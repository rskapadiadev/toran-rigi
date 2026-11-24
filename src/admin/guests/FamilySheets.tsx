// The studio's right-hand panels for a couple's guest list: one family, a pasted list, a reply.
import { isSide, type Side } from '@shared/guests';
import { Loader2 } from 'lucide-react';
import { type ReactNode, type SyntheticEvent, useState } from 'react';

import { FormField } from '@/admin/kit/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formString } from '@/motion/hooks';
import { useGuestAction } from '@/shop/guests/actions';
import { functionsFor, type GuestList, type ListGuest, sideLabel } from '@/shop/guests/model';

// Radix selects have no empty value.
const NONE = 'none';

interface PanelProps {
    title: string;
    description: string;
    action: string;
    busy: boolean;
    disabled?: boolean;
    onClose: () => void;
    onSubmit: (e: SyntheticEvent<HTMLFormElement>) => void;
    children: ReactNode;
}

function SidePanel({
    title,
    description,
    action,
    busy,
    disabled = false,
    onClose,
    onSubmit,
    children,
}: PanelProps) {
    return (
        <Sheet
            open
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <SheetContent className="w-full sm:max-w-md">
                <form onSubmit={onSubmit} className="flex h-full flex-col">
                    <SheetHeader className="border-b">
                        <SheetTitle>{title}</SheetTitle>
                        <SheetDescription>{description}</SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">{children}</div>
                    <SheetFooter className="border-t">
                        <Button type="submit" disabled={busy || disabled}>
                            {busy && <Loader2 className="animate-spin" />}
                            {action}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

interface PlacementProps {
    list: GuestList;
    side: Side | null;
    groupId: string | null;
    onSide: (side: Side | null) => void;
    onGroup: (groupId: string | null) => void;
}

function Placement({ list, side, groupId, onSide, onGroup }: PlacementProps) {
    return (
        <>
            {list.names.two && (
                <FormField label="Whose guests">
                    {(id) => (
                        <Select
                            value={side ?? NONE}
                            onValueChange={(v) => {
                                onSide(isSide(v) ? v : null);
                            }}
                        >
                            <SelectTrigger id={id} className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NONE}>Both families</SelectItem>
                                <SelectItem value="one">{sideLabel(list, 'one')}</SelectItem>
                                <SelectItem value="two">{sideLabel(list, 'two')}</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </FormField>
            )}
            <FormField label="Group" description="Make groups on the Links tab.">
                {(id) => (
                    <Select
                        value={groupId ?? NONE}
                        onValueChange={(v) => {
                            onGroup(v === NONE ? null : v);
                        }}
                    >
                        <SelectTrigger id={id} className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE}>No group</SelectItem>
                            {list.groups
                                .filter((g) => g.kind === 'group')
                                .map((g) => (
                                    <SelectItem key={g.id} value={g.id}>
                                        {g.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                )}
            </FormField>
        </>
    );
}

interface SheetProps {
    list: GuestList;
    base: string;
    onClose: () => void;
}

interface FamilySheetProps extends SheetProps {
    guest: ListGuest | null;
}

export function FamilySheet({ list, base, guest, onClose }: FamilySheetProps) {
    const act = useGuestAction(base);
    const [side, setSide] = useState<Side | null>(guest?.side ?? null);
    const [groupId, setGroupId] = useState<string | null>(guest?.groupId ?? null);
    const [busy, setBusy] = useState(false);
    const submit = async (form: FormData) => {
        const max = Number(formString(form, 'maxGuests'));
        const body = {
            displayName: formString(form, 'displayName'),
            phone: formString(form, 'phone') || undefined,
            side,
            groupId,
            maxGuests: max > 0 ? Math.min(20, max) : null,
            note: formString(form, 'note') || undefined,
        };
        setBusy(true);
        const ok = await act(
            {
                path: guest ? `/families/${guest.id}` : '/families',
                method: guest ? 'PATCH' : 'POST',
                body,
            },
            guest ? 'Family saved' : 'Family added',
        );
        setBusy(false);
        if (ok) onClose();
    };
    return (
        <SidePanel
            title={guest ? guest.displayName : 'Add a family'}
            description="Their invite greets them by this name and shows only their functions."
            action={guest ? 'Save' : 'Add family'}
            busy={busy}
            onClose={onClose}
            onSubmit={(e) => {
                e.preventDefault();
                void submit(new FormData(e.currentTarget));
            }}
        >
            <FormField label="Name on their invite">
                {(id) => (
                    <Input
                        id={id}
                        name="displayName"
                        required
                        maxLength={120}
                        defaultValue={guest?.displayName}
                        placeholder="Sharma family"
                    />
                )}
            </FormField>
            <FormField label="WhatsApp number" description="With the country code.">
                {(id) => (
                    <Input
                        id={id}
                        name="phone"
                        type="tel"
                        dir="ltr"
                        maxLength={32}
                        defaultValue={guest?.phone ?? ''}
                        placeholder="+91 98765 43210"
                    />
                )}
            </FormField>
            <Placement
                list={list}
                side={side}
                groupId={groupId}
                onSide={setSide}
                onGroup={setGroupId}
            />
            <FormField label="Most people from this family">
                {(id) => (
                    <Input
                        id={id}
                        name="maxGuests"
                        type="number"
                        min={1}
                        max={20}
                        defaultValue={guest?.maxGuests ?? ''}
                        placeholder="No limit"
                    />
                )}
            </FormField>
            <FormField
                label="A line just for them"
                description="Goes at the top of their WhatsApp message."
            >
                {(id) => (
                    <Textarea
                        id={id}
                        name="note"
                        rows={2}
                        maxLength={500}
                        defaultValue={guest?.note ?? ''}
                    />
                )}
            </FormField>
        </SidePanel>
    );
}

export function PasteSheet({ list, base, onClose }: SheetProps) {
    const act = useGuestAction(base);
    const [lines, setLines] = useState('');
    const [side, setSide] = useState<Side | null>(null);
    const [groupId, setGroupId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const count = lines.split(/\r?\n/).filter((l) => l.trim()).length;
    const noun = count === 1 ? 'family' : 'families';
    return (
        <SidePanel
            title="Paste a list"
            description="One family per line: name, then phone and party size if you have them."
            action={count ? `Add ${String(count)} ${noun}` : 'Add families'}
            busy={busy}
            disabled={count === 0}
            onClose={onClose}
            onSubmit={(e) => {
                e.preventDefault();
                setBusy(true);
                const body = {
                    lines,
                    side,
                    groupId,
                };
                void act(
                    {
                        path: '/families/paste',
                        method: 'POST',
                        body,
                    },
                    `${String(count)} ${noun} added`,
                ).then((ok) => {
                    setBusy(false);
                    if (ok) onClose();
                });
            }}
        >
            <FormField label="One family per line">
                {(id) => (
                    <Textarea
                        id={id}
                        rows={8}
                        dir="auto"
                        value={lines}
                        className="font-mono text-xs"
                        onChange={(e) => {
                            setLines(e.target.value);
                        }}
                        placeholder={'Shah Parivar, +919800000001, 4\nPatel Family'}
                    />
                )}
            </FormField>
            <Placement
                list={list}
                side={side}
                groupId={groupId}
                onSide={setSide}
                onGroup={setGroupId}
            />
        </SidePanel>
    );
}

interface ReplySheetProps extends SheetProps {
    guest: ListGuest;
}

// A reply the couple passed on, or that came only on WhatsApp.
export function ReplySheet({ list, base, guest, onClose }: ReplySheetProps) {
    const act = useGuestAction(base);
    const [coming, setComing] = useState(true);
    const [busy, setBusy] = useState(false);
    const events = functionsFor(list, guest);
    const submit = async (form: FormData) => {
        const counts = Object.fromEntries(
            events.map((e) => [e.id, Math.min(50, Number(formString(form, e.id)) || 0)]),
        );
        const body = {
            attending: coming,
            counts: coming ? counts : {},
            message: formString(form, 'message') || undefined,
        };
        setBusy(true);
        const ok = await act(
            {
                path: `/families/${guest.id}/reply`,
                method: 'POST',
                body,
            },
            'Reply added',
        );
        setBusy(false);
        if (ok) onClose();
    };
    return (
        <SidePanel
            title={`Reply from ${guest.displayName}`}
            description="It replaces any earlier reply from this family."
            action="Add reply"
            busy={busy}
            onClose={onClose}
            onSubmit={(e) => {
                e.preventDefault();
                void submit(new FormData(e.currentTarget));
            }}
        >
            <ToggleGroup
                type="single"
                variant="outline"
                aria-label="Are they coming?"
                value={coming ? 'yes' : 'no'}
                onValueChange={(v) => {
                    if (v) setComing(v === 'yes');
                }}
            >
                <ToggleGroupItem value="yes">Coming</ToggleGroupItem>
                <ToggleGroupItem value="no">Can’t come</ToggleGroupItem>
            </ToggleGroup>
            {coming &&
                events.map((e) => (
                    <FormField key={e.id} label={e.title}>
                        {(id) => (
                            <Input
                                id={id}
                                name={e.id}
                                type="number"
                                min={0}
                                max={50}
                                defaultValue={0}
                            />
                        )}
                    </FormField>
                ))}
            <FormField label="Their message">
                {(id) => <Textarea id={id} name="message" rows={2} maxLength={1000} />}
            </FormField>
        </SidePanel>
    );
}
