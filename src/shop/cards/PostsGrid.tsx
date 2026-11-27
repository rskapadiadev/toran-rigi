// Posts for Instagram and WhatsApp status: what to post today, the countdown day by day, each
// ceremony on its day, a thank-you, a square save-the-date and a profile grid. Used on the couple's
// and the studio's Cards pages.
import { type GridSize, gridSizes, type PostInfo, type PostLook, postSize } from '@shared/posts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Download, Grid3x3, Hash, ImageIcon, Loader2, Lock } from 'lucide-react';
import { lazy, type ReactNode, useState } from 'react';
import { toast } from 'sonner';

import { Panel } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import type { PublicInvitationData } from '@/invitation/types';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

import { Scaled } from './CardsGrid';
import { type CardsChoice, saveFile } from './model';

// Drawn with the cards' own lettering and art, so they load with the panel, not the page.
const PostView = lazy(() =>
    import('@/invitation/cards/PostView').then((mod) => ({ default: mod.PostView })),
);

interface PostsSet {
    ready: boolean;
    refundable: boolean;
    posts: PostInfo[];
    photo: boolean;
    data: PublicInvitationData;
    version: {
        who: string | null;
        lang: string;
    };
}

interface LookChoice {
    look: PostLook;
    label: string;
    icon: typeof Hash;
}

const looks: LookChoice[] = [
    {
        look: 'number',
        label: 'Big number',
        icon: Hash,
    },
    {
        look: 'calendar',
        label: 'Calendar',
        icon: CalendarDays,
    },
    {
        look: 'photo',
        label: 'Photo',
        icon: ImageIcon,
    },
];

const dayOf = (iso: string) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString('en', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
    });

interface PostsGridProps {
    base: string;
    choice: CardsChoice;
    buttonClass?: string;
}

export function PostsGrid({ base, choice, buttonClass = '' }: PostsGridProps) {
    const client = useQueryClient();
    const [look, setLook] = useState<PostLook>('number');
    const [tiles, setTiles] = useState<GridSize>(6);
    const [busy, setBusy] = useState<string | null>(null);
    const query = new URLSearchParams({
        ...(choice.who && { who: choice.who }),
        ...(choice.lang && { lang: choice.lang }),
    });
    const search = query.toString();
    const { data: set } = useQuery({
        queryKey: ['posts', base, search],
        queryFn: () => api<PostsSet>(`${base}/posts${search ? `?${search}` : ''}`),
        placeholderData: (previous: PostsSet | undefined) => previous,
    });
    // Today where the person is; a post for a day gone by isn't on the list at all.
    const [today] = useState(() => new Date().toLocaleDateString('en-CA'));
    if (!set || set.posts.length === 0) return null;
    const shown = look === 'photo' && !set.photo ? 'number' : look;

    const save = async (post: PostInfo) => {
        setBusy(post.id);
        const params = new URLSearchParams(query);
        if (post.kind === 'countdown') params.set('look', shown);
        try {
            await saveFile(`${base}/posts/${encodeURIComponent(post.id)}?${params.toString()}`);
            if (set.refundable) await client.invalidateQueries({ queryKey: ['cards', base] });
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Something went wrong');
        } finally {
            setBusy(null);
        }
    };

    const draw = (post: PostInfo, grid?: GridSize) => (
        <Scaled size={postSize(post.face, grid)}>
            <PostView
                data={set.data}
                face={post.face}
                locale={set.version.lang}
                look={shown}
                day={post.day}
                eventId={post.eventId}
                tiles={grid}
            />
        </Scaled>
    );

    const get = (post: PostInfo, label = 'Download') => (
        <Button
            variant="outline"
            size="sm"
            className={buttonClass}
            disabled={!set.ready || busy !== null}
            onClick={() => {
                void save(post);
            }}
        >
            {busy === post.id ? (
                <Loader2 className="animate-spin" />
            ) : set.ready ? (
                <Download />
            ) : (
                <Lock />
            )}
            {label}
        </Button>
    );

    const dated = set.posts.filter((p) => p.on !== null);
    const next = dated.find((p) => p.on === today) ?? dated[0];
    const countdown = set.posts.filter((p) => p.kind === 'countdown');
    const ceremonies = set.posts.filter((p) => p.kind === 'ceremony');
    const thanks = set.posts.find((p) => p.kind === 'thanks');
    const square = set.posts.find((p) => p.kind === 'square');
    const grid = set.posts.find((p) => p.kind === 'grid' && p.tiles === tiles);

    return (
        <Panel
            title="Posts for Instagram and WhatsApp"
            description="A countdown to the day, each ceremony on its day, a thank-you after, and a grid for your profile. Drawn in your invitation’s own design."
            className="mt-4"
        >
            <div className="space-y-8">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                        Countdown look
                    </span>
                    <div
                        role="group"
                        aria-label="Countdown look"
                        className="flex flex-wrap gap-1 rounded-full bg-black/5 p-1"
                    >
                        {looks.map((l) => (
                            <button
                                key={l.look}
                                type="button"
                                aria-pressed={shown === l.look}
                                disabled={l.look === 'photo' && !set.photo}
                                title={
                                    l.look === 'photo' && !set.photo
                                        ? 'Add a photo to your invitation first'
                                        : undefined
                                }
                                onClick={() => {
                                    setLook(l.look);
                                }}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition disabled:opacity-40',
                                    shown === l.look
                                        ? 'bg-foreground text-background'
                                        : 'text-foreground/80',
                                )}
                            >
                                <l.icon className="size-3.5" />
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>

                {next && (
                    <div className="grid items-start gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
                        <div className="w-[220px] max-w-full">{draw(next)}</div>
                        <div className="space-y-3">
                            <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                {next.on === today
                                    ? 'Post today'
                                    : `Next: ${dayOf(next.on ?? today)}`}
                            </p>
                            <p className="text-lg font-medium">{next.title}</p>
                            <p className="text-sm text-muted-foreground">
                                1080 × 1920, for your WhatsApp status and Instagram story.
                            </p>
                            {get(next)}
                        </div>
                    </div>
                )}

                {countdown.length > 0 && (
                    <Group title="The countdown" hint="One for each day. Post it that morning.">
                        <ul className="max-h-80 divide-y overflow-y-auto rounded-lg ring-1 ring-foreground/10">
                            {countdown.map((p) => (
                                <li
                                    key={p.id}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2',
                                        p.on === today && 'bg-primary/5',
                                    )}
                                >
                                    <span className="w-28 shrink-0 text-xs text-muted-foreground">
                                        {p.on === today ? 'Today' : dayOf(p.on ?? today)}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-sm">
                                        {p.title}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 shrink-0"
                                        aria-label={`Download ${p.title}`}
                                        disabled={!set.ready || busy !== null}
                                        onClick={() => {
                                            void save(p);
                                        }}
                                    >
                                        {busy === p.id ? (
                                            <Loader2 className="animate-spin" />
                                        ) : set.ready ? (
                                            <Download />
                                        ) : (
                                            <Lock />
                                        )}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </Group>
                )}

                <div className="grid grid-cols-2 items-start gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                    {ceremonies.map((p) => (
                        <Tile
                            key={p.id}
                            preview={draw(p)}
                            title={`${p.title}, on the day`}
                            hint={dayOf(p.on ?? today)}
                            action={get(p)}
                        />
                    ))}
                    {thanks && (
                        <Tile
                            preview={draw(thanks)}
                            title="Thank you"
                            hint={`After, from ${dayOf(thanks.on ?? today)}`}
                            action={get(thanks)}
                        />
                    )}
                    {square && (
                        <Tile
                            preview={draw(square)}
                            title="Save the date, square"
                            hint="1080 × 1080, for your feed"
                            action={get(square)}
                        />
                    )}
                </div>

                {grid && (
                    <Group
                        title="Profile grid"
                        hint="One picture across your Instagram profile. Post them in order: post 1 first, the last one makes it whole."
                        icon={Grid3x3}
                    >
                        <div className="flex flex-wrap items-center gap-3">
                            <div
                                role="group"
                                aria-label="Posts in the grid"
                                className="flex gap-1 rounded-full bg-black/5 p-1"
                            >
                                {gridSizes.map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        aria-pressed={tiles === n}
                                        onClick={() => {
                                            setTiles(n);
                                        }}
                                        className={cn(
                                            'rounded-full px-3 py-1.5 text-xs transition',
                                            tiles === n
                                                ? 'bg-foreground text-background'
                                                : 'text-foreground/80',
                                        )}
                                    >
                                        {n} posts
                                    </button>
                                ))}
                            </div>
                            {get(grid, `Download ${String(tiles)} posts`)}
                        </div>
                        <div className="relative mt-3 w-full max-w-md">
                            {draw(grid, tiles)}
                            <GridLines tiles={tiles} />
                        </div>
                    </Group>
                )}
            </div>
        </Panel>
    );
}

interface GroupProps {
    title: string;
    hint: string;
    icon?: typeof Hash;
    children: ReactNode;
}

function Group({ title, hint, icon: Icon, children }: GroupProps) {
    return (
        <section className="space-y-3">
            <div>
                <h3 className="flex items-center gap-2 text-sm font-medium">
                    {Icon && <Icon className="size-4" />}
                    {title}
                </h3>
                <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
            {children}
        </section>
    );
}

interface TileProps {
    preview: ReactNode;
    title: string;
    hint: string;
    action: ReactNode;
}

function Tile({ preview, title, hint, action }: TileProps) {
    return (
        <div className="space-y-2.5">
            {preview}
            <div>
                <p className="truncate text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
            {action}
        </div>
    );
}

// Where the grid is cut, and which post each tile is.
function GridLines({ tiles }: { tiles: GridSize }) {
    const rows = tiles / 3;
    const cells = Array.from({ length: tiles }, (_, i) => tiles - i);
    const layout = { gridTemplateRows: `repeat(${String(rows)}, 1fr)` };
    return (
        <div
            className="pointer-events-none absolute inset-0 grid grid-cols-3"
            style={layout}
            aria-hidden
        >
            {cells.map((n) => (
                <div key={n} className="relative border border-white/60">
                    <span className="absolute start-1.5 top-1.5 rounded-full bg-black/60 px-1.5 text-[10px] text-white">
                        {n}
                    </span>
                </div>
            ))}
        </div>
    );
}
