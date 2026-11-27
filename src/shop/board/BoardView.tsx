// One function's mood board at its real size (1200 × 1500): the theme, a collage of pinned photos,
// the colours with their names and codes for the decorator, the words, the notes, and what guests
// wear. Drawn the same in the editor's preview and in the picture we make of it.
import { brand } from '@shared/brand';
import { colourName, outfitInfo, outfitsFor } from '@shared/looks';
import type { BoardInput } from '@shared/schemas/board';
import type { CSSProperties } from 'react';

import { Outfit } from '@/invitation/looks/Outfit';
import { outfitColours } from '@/invitation/luxury/night/DressCode';
import type { PublicDressCode } from '@/invitation/types';

export interface BoardViewProps {
    board: BoardInput;
    title: string;
    names: string;
    startsAt: string;
    venue: string;
    culture: string;
    dressCode: PublicDressCode | null;
    pinSrc: (key: string) => string;
}

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

// Spelt out by hand, so the server and every browser write the day the same way.
const dateOf = (iso: string) => {
    const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
    if (Number.isNaN(d.getTime())) return '';
    const day = weekdays[d.getUTCDay()] ?? '';
    const month = months[d.getUTCMonth()] ?? '';
    return `${day}, ${String(d.getUTCDate())} ${month} ${String(d.getUTCFullYear())}`;
};

// Columns, rows and how far the first photo spreads, so every count from 1 to 12 fills its grid.
const layouts: Record<number, [number, number, number, number]> = {
    1: [1, 1, 1, 1],
    2: [2, 1, 1, 1],
    3: [2, 2, 1, 2],
    4: [2, 2, 1, 1],
    5: [3, 2, 1, 2],
    6: [3, 3, 2, 2],
    7: [4, 2, 1, 2],
    8: [4, 2, 1, 1],
    9: [3, 3, 1, 1],
    10: [4, 3, 1, 3],
    11: [4, 3, 1, 2],
    12: [4, 3, 1, 1],
};

function collage(count: number) {
    const [columns, rows, wide, tall] = layouts[Math.min(12, Math.max(1, count))] ?? [1, 1, 1, 1];
    return {
        columns,
        rows,
        lead: {
            gridColumn: `span ${String(wide)}`,
            gridRow: `span ${String(tall)}`,
        },
    };
}

const isLight = (hex: string) => {
    const n = Number.parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return 0.299 * r + 0.587 * g + 0.114 * b > 160;
};

function Swatch({ color }: { color: string }) {
    const ink: CSSProperties = {
        background: color,
        color: isLight(color) ? '#2a2320' : '#fbf7f0',
    };
    return (
        <div
            className="flex h-[118px] min-w-0 flex-1 flex-col justify-end rounded-[10px] p-3 ring-1 ring-black/10"
            style={ink}
        >
            <p className="truncate text-[17px] font-medium">{colourName(color)}</p>
            <p className="font-mono text-[13px] uppercase opacity-80">{color}</p>
        </div>
    );
}

export function BoardView({
    board,
    title,
    names,
    startsAt,
    venue,
    culture,
    dressCode,
    pinSrc,
}: BoardViewProps) {
    const pins = board.pins;
    const { columns, rows, lead } = collage(pins.length);
    const grid: CSSProperties = {
        gridTemplateColumns: `repeat(${String(columns)}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${String(rows)}, minmax(0, 1fr))`,
    };
    const palette = board.palette.length > 0 ? board.palette : (dressCode?.swatches ?? []);
    const accent = palette[0] ?? '#c39a4e';
    const wear = dressCode && (dressCode.swatches.length > 0 || dressCode.outfits?.length);
    const figures = wear ? outfitsFor(dressCode.outfits, culture) : [];
    const credits = pins.filter((p) => p.credit);
    const rule: CSSProperties = { background: accent };
    return (
        <div className="relative flex h-[1500px] w-[1200px] flex-col overflow-hidden bg-[#f6f1e7] px-[64px] pt-[56px] pb-[40px] text-[#2a2320]">
            <header className="flex items-end justify-between gap-10">
                <div className="min-w-0">
                    <p className="text-[15px] tracking-[0.42em] text-[#9c7633] uppercase">
                        Mood board
                    </p>
                    <h1 className="mt-2 truncate font-display text-[92px] leading-[0.95]">
                        {title}
                    </h1>
                    {board.theme && (
                        <p className="mt-2 truncate font-display text-[40px] text-[#9c7633] italic">
                            {board.theme}
                        </p>
                    )}
                </div>
                <div className="shrink-0 text-end text-[18px] leading-relaxed">
                    <p className="font-display text-[30px]">{names}</p>
                    <p>{dateOf(startsAt)}</p>
                    <p className="max-w-[340px] truncate opacity-70">{venue}</p>
                </div>
            </header>
            <div className="mt-6 h-[3px] w-[120px] rounded-full" style={rule} />

            <section className="mt-8 min-h-0 flex-1">
                {pins.length > 0 ? (
                    <div className="grid size-full gap-[14px]" style={grid}>
                        {pins.map((p, i) => (
                            <img
                                key={p.key}
                                src={pinSrc(p.key)}
                                alt=""
                                className="size-full rounded-[10px] object-cover"
                                style={i === 0 ? lead : undefined}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex size-full gap-[14px]">
                        {(palette.length > 0 ? palette : ['#e8d9bd', '#c39a4e', '#4a0f1f']).map(
                            (c, i) => {
                                const block: CSSProperties = { background: c };
                                return (
                                    <div
                                        key={`${c}-${String(i)}`}
                                        className="flex-1 rounded-[10px] ring-1 ring-black/10"
                                        style={block}
                                    />
                                );
                            },
                        )}
                    </div>
                )}
            </section>

            <section className="mt-8 flex gap-10">
                <div className="min-w-0 flex-1 space-y-6">
                    {palette.length > 0 && (
                        <div className="flex gap-3">
                            {palette.map((c, i) => (
                                <Swatch key={`${c}-${String(i)}`} color={c} />
                            ))}
                        </div>
                    )}
                    {board.words.length > 0 && (
                        <ul className="flex flex-wrap gap-2.5">
                            {board.words.map((w) => (
                                <li
                                    key={w}
                                    className="rounded-full border border-[#2a2320]/25 px-4 py-1.5 text-[18px]"
                                >
                                    {w}
                                </li>
                            ))}
                        </ul>
                    )}
                    {board.notes && (
                        <p className="line-clamp-5 text-[19px] leading-[1.55] whitespace-pre-line">
                            {board.notes}
                        </p>
                    )}
                </div>
                {figures.length > 0 && dressCode && (
                    <div className="w-[300px] shrink-0 rounded-[12px] bg-[#efe6d4] px-4 pt-4 text-center">
                        <p className="text-[13px] tracking-[0.35em] text-[#9c7633] uppercase">
                            Guests wear
                        </p>
                        <div className="mt-2 flex items-end justify-center gap-1">
                            {figures.map((o, k) => (
                                <Outfit
                                    key={o}
                                    id={o}
                                    {...outfitColours(dressCode.swatches, k)}
                                    trim="#9c7633"
                                    turban={dressCode.turban}
                                    title={outfitInfo[o].label}
                                    className={
                                        figures.length > 2 ? 'h-[170px] w-auto' : 'h-[210px] w-auto'
                                    }
                                />
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <footer className="mt-6 flex items-end justify-between gap-6 text-[12px] text-[#2a2320]/55">
                <p className="min-w-0 truncate">
                    {credits.length > 0 &&
                        `Photos: ${credits
                            .map((p) =>
                                [p.credit?.author, p.credit?.license].filter(Boolean).join(', '),
                            )
                            .join(' · ')}`}
                </p>
                <p className="shrink-0 tracking-[0.2em] uppercase">Made with {brand.name}</p>
            </footer>
        </div>
    );
}
