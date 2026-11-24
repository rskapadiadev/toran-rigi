import { inviteLink, inviteMessage, type Viewer, whatsappLink } from '@shared/guests';
import { Check, Copy, MessageCircle, PenLine, Plus, Trash2, X } from 'lucide-react';
import { type SyntheticEvent, useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { copyText, useGuestAction } from './actions';
import {
    functionsForLink,
    type GuestList,
    inviteWords,
    type ListGroup,
    sideLabel,
    titles,
} from './model';

interface LinksProps {
    list: GuestList;
    base: string;
    origin: string;
}

interface LinkRowProps {
    title: string;
    hint: string;
    url: string;
    shows: string;
    message: string;
    actions?: React.ReactNode;
}

function LinkRow({ title, hint, url, shows, message, actions }: LinkRowProps) {
    return (
        <li className="space-y-2 p-4">
            <div className="flex flex-wrap items-start gap-2">
                <div className="min-w-0 flex-1 basis-52">
                    <p className="font-medium text-ink">{title}</p>
                    <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
                {actions}
            </div>
            <p
                className="truncate rounded-lg bg-black/[0.03] px-3 py-2 font-mono text-xs"
                dir="ltr"
            >
                {url.replace(/^https?:\/\//, '')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
                <p className="min-w-0 flex-1 basis-52 text-xs text-muted-foreground">
                    Shows: {shows}
                </p>
                <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                        void copyText(url);
                    }}
                >
                    <Copy /> Copy
                </Button>
                <Button size="sm" className="rounded-full" asChild>
                    <a href={whatsappLink(null, message)} target="_blank" rel="noreferrer">
                        <MessageCircle /> Share
                    </a>
                </Button>
            </div>
        </li>
    );
}

export function Links({ list, base, origin }: LinksProps) {
    const act = useGuestAction(base);
    const [renaming, setRenaming] = useState<string | null>(null);
    const newId = useId();
    const groups = list.groups.filter((g) => g.kind === 'group');
    const sides = list.names.two ? list.groups.filter((g) => g.kind === 'side') : [];
    // A group or a side link greets no one by name, so its message doesn't either.
    const messageFor = (url: string) =>
        inviteMessage(inviteWords(list), {
            name: '',
            link: url,
        });
    const shows = (viewer?: Viewer) => titles(functionsForLink(list, viewer));

    const create = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = new FormData(form).get('name');
        if (typeof name !== 'string' || !name.trim()) return;
        if (
            await act(
                {
                    path: '/groups',
                    method: 'POST',
                    body: { name },
                },
                `${name.trim()} made`,
            )
        )
            form.reset();
    };

    const everyone = inviteLink(origin, list.slug);
    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <div>
                    <h2 className="font-display text-2xl text-ink">Links for many at once</h2>
                    <p className="text-sm text-muted-foreground">
                        For the family group or a status. Each shows only the functions it’s for.
                        For one family by name, send their own link from Families.
                    </p>
                </div>
                <ul className="divide-y rounded-2xl border bg-card">
                    <LinkRow
                        title="Everyone"
                        hint="Your invitation’s own link"
                        url={everyone}
                        shows={shows()}
                        message={messageFor(everyone)}
                    />
                    {sides.map((s) => {
                        const url = inviteLink(origin, list.slug, s.token);
                        return (
                            <LinkRow
                                key={s.id}
                                title={`Everyone ${sideLabel(list, s.side)} invites`}
                                hint={
                                    list.versions
                                        ? `${sideLabel(list, s.side)}’s main link, in their own version`
                                        : `${sideLabel(list, s.side)}’s main link`
                                }
                                url={url}
                                shows={shows({ side: s.side })}
                                message={messageFor(url)}
                            />
                        );
                    })}
                    {groups.map((g) => {
                        const url = inviteLink(origin, list.slug, g.token);
                        return (
                            <LinkRow
                                key={g.id}
                                title={g.name}
                                hint="Group link"
                                url={url}
                                shows={shows({ groupId: g.id })}
                                message={messageFor(url)}
                                actions={
                                    renaming === g.id ? (
                                        <RenameGroup
                                            group={g}
                                            onDone={(name) => {
                                                if (name && name !== g.name)
                                                    void act(
                                                        {
                                                            path: `/groups/${g.id}`,
                                                            method: 'PATCH',
                                                            body: { name },
                                                        },
                                                        'Renamed. The link stays the same',
                                                    );
                                                setRenaming(null);
                                            }}
                                        />
                                    ) : (
                                        <div className="flex gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                aria-label={`Rename ${g.name}`}
                                                onClick={() => {
                                                    setRenaming(g.id);
                                                }}
                                            >
                                                <PenLine />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                aria-label={`Remove ${g.name}`}
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            `Remove ${g.name}? Its link stops working, and its families then see what everyone sees.`,
                                                        )
                                                    )
                                                        void act(
                                                            {
                                                                path: `/groups/${g.id}`,
                                                                method: 'DELETE',
                                                            },
                                                            'Group removed',
                                                        );
                                                }}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    )
                                }
                            />
                        );
                    })}
                </ul>
            </section>

            <section className="space-y-3">
                <div>
                    <h2 className="font-display text-2xl text-ink">Groups</h2>
                    <p className="text-sm text-muted-foreground">
                        The people you invite together, like close family or the office. A group
                        sees the functions for everyone, plus the ones you pick for it under Who
                        sees what.
                    </p>
                </div>
                <form onSubmit={(e) => void create(e)} className="flex gap-2">
                    <Label htmlFor={newId} className="sr-only">
                        New group’s name
                    </Label>
                    <Input
                        id={newId}
                        name="name"
                        maxLength={60}
                        placeholder="Close family"
                        className="h-10 rounded-full"
                    />
                    <Button type="submit" className="rounded-full">
                        <Plus /> New group
                    </Button>
                </form>
            </section>
        </div>
    );
}

interface RenameGroupProps {
    group: ListGroup;
    onDone: (name: string | null) => void;
}

function RenameGroup({ group, onDone }: RenameGroupProps) {
    const [name, setName] = useState(group.name);
    const id = useId();
    return (
        <form
            className="flex items-center gap-1"
            onSubmit={(e) => {
                e.preventDefault();
                onDone(name.trim() || null);
            }}
        >
            <Label htmlFor={id} className="sr-only">
                Group name
            </Label>
            <Input
                id={id}
                value={name}
                maxLength={60}
                onChange={(e) => {
                    setName(e.target.value);
                }}
                className="h-8 w-40"
            />
            <Button size="icon" variant="ghost" type="submit" aria-label="Save the name">
                <Check />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                type="button"
                aria-label="Keep the old name"
                onClick={() => {
                    onDone(null);
                }}
            >
                <X />
            </Button>
        </form>
    );
}
