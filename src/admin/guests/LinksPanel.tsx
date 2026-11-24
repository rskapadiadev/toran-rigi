import { inviteLink, type Viewer } from '@shared/guests';
import { Check, PenLine, Plus, Trash2, X } from 'lucide-react';
import { type SyntheticEvent, useId, useState } from 'react';

import { CopyField } from '@/admin/kit/form';
import { Panel } from '@/admin/kit/page';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formString } from '@/motion/hooks';
import { useGuestAction } from '@/shop/guests/actions';
import {
    functionsForLink,
    type GuestList,
    type ListGroup,
    sideLabel,
    titles,
} from '@/shop/guests/model';

interface LinksPanelProps {
    list: GuestList;
    base: string;
    origin: string;
}

interface SharedLink {
    key: string;
    title: string;
    hint: string;
    token?: string;
    viewer?: Viewer;
    group?: ListGroup;
}

export function LinksPanel({ list, base, origin }: LinksPanelProps) {
    const act = useGuestAction(base);
    const newId = useId();
    const [renaming, setRenaming] = useState<string | null>(null);
    const [removing, setRemoving] = useState<ListGroup | null>(null);

    const links: SharedLink[] = [
        {
            key: 'everyone',
            title: 'Everyone',
            hint: 'The invitation’s own link',
        },
        ...(list.names.two ? list.groups.filter((g) => g.kind === 'side') : []).map((g) => ({
            key: g.id,
            title: `Everyone ${sideLabel(list, g.side)} invites`,
            hint: list.versions ? 'Main link, in their own version' : 'Main link',
            token: g.token,
            viewer: { side: g.side },
        })),
        ...list.groups
            .filter((g) => g.kind === 'group')
            .map((g) => ({
                key: g.id,
                title: g.name,
                hint: 'Group link',
                token: g.token,
                viewer: { groupId: g.id },
                group: g,
            })),
    ];

    const create = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = formString(new FormData(form), 'name');
        const ok = await act(
            {
                path: '/groups',
                method: 'POST',
                body: { name },
            },
            'Group added',
        );
        if (ok) form.reset();
    };

    const rename = (group: ListGroup, name: string) => {
        setRenaming(null);
        if (name && name !== group.name)
            void act(
                {
                    path: `/groups/${group.id}`,
                    method: 'PATCH',
                    body: { name },
                },
                'Group renamed',
            );
    };

    return (
        <Panel
            title="Links for many at once"
            description="Each shows only the functions it’s for. A group sees what everyone sees, plus its own."
        >
            <ul className="divide-y">
                {links.map((l) => (
                    <li
                        key={l.key}
                        className="grid items-center gap-x-6 gap-y-2 py-3 first:pt-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
                    >
                        <div className="flex min-w-0 items-center gap-1">
                            {l.group && renaming === l.group.id ? (
                                <RenameForm
                                    group={l.group}
                                    onDone={rename}
                                    onCancel={() => {
                                        setRenaming(null);
                                    }}
                                />
                            ) : (
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{l.title}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {l.hint} · Shows {titles(functionsForLink(list, l.viewer))}
                                    </p>
                                </div>
                            )}
                            {l.group && renaming !== l.group.id && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Rename ${l.title}`}
                                        onClick={() => {
                                            setRenaming(l.key);
                                        }}
                                    >
                                        <PenLine />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Remove ${l.title}`}
                                        onClick={() => {
                                            setRemoving(l.group ?? null);
                                        }}
                                    >
                                        <Trash2 />
                                    </Button>
                                </>
                            )}
                        </div>
                        <CopyField
                            label={`${l.title} link`}
                            value={inviteLink(origin, list.slug, l.token)}
                        />
                    </li>
                ))}
            </ul>
            <form onSubmit={(e) => void create(e)} className="relative mt-3 flex max-w-md gap-2">
                <Label htmlFor={newId} className="sr-only">
                    New group’s name
                </Label>
                <Input id={newId} name="name" required maxLength={60} placeholder="Close family" />
                <Button type="submit" variant="outline">
                    <Plus /> New group
                </Button>
            </form>
            {removing && (
                <AlertDialog
                    open
                    onOpenChange={(open) => {
                        if (!open) setRemoving(null);
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove {removing.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Its link then shows the main invitation, and its families see what
                                everyone sees.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    void act(
                                        {
                                            path: `/groups/${removing.id}`,
                                            method: 'DELETE',
                                        },
                                        'Group removed',
                                    );
                                }}
                            >
                                Remove
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </Panel>
    );
}

interface RenameFormProps {
    group: ListGroup;
    onDone: (group: ListGroup, name: string) => void;
    onCancel: () => void;
}

function RenameForm({ group, onDone, onCancel }: RenameFormProps) {
    const id = useId();
    return (
        <form
            className="relative flex flex-1 items-center gap-1"
            onSubmit={(e) => {
                e.preventDefault();
                onDone(group, formString(new FormData(e.currentTarget), 'name'));
            }}
        >
            <Label htmlFor={id} className="sr-only">
                Group name
            </Label>
            <Input id={id} name="name" defaultValue={group.name} maxLength={60} />
            <Button type="submit" variant="ghost" size="icon-sm" aria-label="Save the name">
                <Check />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Keep the old name"
                onClick={onCancel}
            >
                <X />
            </Button>
        </form>
    );
}
