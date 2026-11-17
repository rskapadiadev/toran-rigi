// A real wax seal: an irregular poured blob (no two couples' alike), a pressed ring with beading,
// the couple's initials debossed into the wax, a soft specular highlight. It can crack along a
// fracture line and split into two halves that fall away; the parent drives both with `applySeal`
// so the press and the fall run at 60fps without React.
import { rng } from '@shared/generative';
import { mixHex } from '@shared/materials';
import { useEffect, useMemo, useRef } from 'react';

const SIZE = 220;
const C = SIZE / 2;

// Smooth closed outline through jittered points: a poured blob, not a circle.
function blob(seed: number, r: number) {
    const rand = rng(seed);
    const n = 30;
    const pts = Array.from({ length: n }, (_, i) => {
        const a = (Math.PI * 2 * i) / n;
        const rr = r * (0.92 + rand.next() * 0.12);
        return [C + rr * Math.cos(a), C + rr * Math.sin(a)] as const;
    });
    const f = (v: number) => v.toFixed(1);
    const mid = (i: number) => {
        const p = pts[i % n] ?? pts[0] ?? [C, C];
        const q = pts[(i + 1) % n] ?? p;
        return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] as const;
    };
    const start = mid(n - 1);
    const segments = pts.map((p, i) => {
        const end = mid(i);
        return `Q${f(p[0])} ${f(p[1])} ${f(end[0])} ${f(end[1])}`;
    });
    return `M${f(start[0])} ${f(start[1])} ${segments.join(' ')} Z`;
}

// The fracture: a jagged line from top to bottom, with a few short branches.
function fracture(seed: number) {
    const rand = rng(seed + 7);
    const steps = 9;
    const pts = Array.from({ length: steps + 1 }, (_, i) => {
        const y = (SIZE / steps) * i;
        const x = C + (i === 0 || i === steps ? 0 : (rand.next() - 0.5) * 30);
        return [x, y] as const;
    });
    const line = pts
        .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
        .join(' ');
    const branches = [2, 4, 6].map((i) => {
        const [x, y] = pts[i] ?? [C, C];
        const dir = rand.next() > 0.5 ? 1 : -1;
        return `M${x.toFixed(1)} ${y.toFixed(1)} l${(dir * (14 + rand.next() * 14)).toFixed(1)} ${(6 + rand.next() * 10).toFixed(1)} l${(dir * (6 + rand.next() * 8)).toFixed(1)} ${(4 + rand.next() * 6).toFixed(1)}`;
    });
    const left = `${line} L0 ${String(SIZE)} L0 0 Z`;
    const right = `${line} L${String(SIZE)} ${String(SIZE)} L${String(SIZE)} 0 Z`;
    return {
        line,
        branches: branches.join(' '),
        left,
        right,
    };
}

interface Crumb {
    x: number;
    y: number;
    r: number;
    dx: number;
    dy: number;
    spin: number;
}

// A few chips of wax that break off along the fracture and scatter.
function crumbs(seed: number): Crumb[] {
    const rand = rng(seed + 31);
    return Array.from({ length: 9 }, () => {
        const y = 30 + rand.next() * 160;
        const side = rand.next() > 0.5 ? 1 : -1;
        return {
            x: C + (rand.next() - 0.5) * 24,
            y,
            r: 2.5 + rand.next() * 4.5,
            dx: side * (30 + rand.next() * 90),
            dy: 60 + rand.next() * 220,
            spin: (rand.next() - 0.5) * 540,
        };
    });
}

export interface SealHandle {
    crack: SVGPathElement | null;
    branches: SVGPathElement | null;
    left: SVGGElement | null;
    right: SVGGElement | null;
    ring: SVGCircleElement | null;
    // Things left on the paper (shadow, crack line, press ring) fade as the halves fall.
    marks: SVGGElement | null;
    marksTop?: SVGGElement;
    crumbs: (SVGGElement | null)[];
    // The scatter of each crumb, in the same order.
    crumbPaths: Crumb[];
}

// crack: 0 → 1 the fracture runs across the wax; split: 0 → 1 the halves part and fall.
export function applySeal(h: SealHandle, crack: number, split: number) {
    if (h.crack) h.crack.style.strokeDashoffset = String(1 - crack);
    if (h.branches) h.branches.style.strokeDashoffset = String(1 - Math.max(0, crack * 1.6 - 0.6));
    if (h.ring) h.ring.style.strokeDashoffset = String(1 - crack);
    const fall = split * split;
    const left = String(1 - Math.min(1, split * 3));
    if (h.marks) h.marks.style.opacity = left;
    if (h.marksTop) h.marksTop.style.opacity = left;
    // Crumbs appear at the crack, then fly and fall.
    h.crumbs.forEach((el, i) => {
        const c = h.crumbPaths[i];
        if (!el || !c) return;
        const t = Math.min(1, split * 1.4);
        el.style.opacity = String(split > 0 ? 1 - Math.max(0, t - 0.6) / 0.4 : 0);
        el.style.transform = `translate(${String(c.dx * t)}px, ${String(c.dy * t * t)}px) rotate(${String(c.spin * t)}deg)`;
    });
    if (h.left) {
        h.left.style.transform = `translate(${String(-split * 30)}px, ${String(fall * 210)}px) rotate(${String(-split * 34)}deg)`;
        h.left.style.opacity = String(1 - Math.max(0, split - 0.7) / 0.3);
    }
    if (h.right) {
        h.right.style.transform = `translate(${String(split * 26)}px, ${String(fall * 240)}px) rotate(${String(split * 41)}deg)`;
        h.right.style.opacity = String(1 - Math.max(0, split - 0.65) / 0.35);
    }
}

interface SealProps {
    seed: number;
    // The wax colour; light and shade are derived from it.
    wax: string;
    initials: string;
    className?: string;
    handleRef: (handle: SealHandle) => void;
}

const half = {
    transformBox: 'fill-box',
    transformOrigin: 'center',
} as const;

// Each crumb spins about its own centre.
const crumbOrigin = (c: Crumb) => ({
    transformBox: 'view-box' as const,
    transformOrigin: `${String(c.x)}px ${String(c.y)}px`,
});

export function WaxSeal({ seed, wax, initials, className, handleRef }: SealProps) {
    const shape = useMemo(() => blob(seed, 100), [seed]);
    const crack = useMemo(() => fracture(seed), [seed]);
    const chips = useMemo(() => crumbs(seed), [seed]);
    const id = `seal-${String(seed)}`;
    const handle = useRef<SealHandle>({
        crack: null,
        branches: null,
        left: null,
        right: null,
        ring: null,
        marks: null,
        crumbs: [],
        crumbPaths: [],
    });
    // Hand the drawn parts to the opening once they exist.
    useEffect(() => {
        handle.current.crumbPaths = chips;
        handleRef(handle.current);
    }, [handleRef, chips]);
    const deep = mixHex(wax, '#000000', 0.5);
    const lit = mixHex(wax, '#ffffff', 0.32);
    const body = (
        <>
            <path d={shape} fill={`url(#${id}-wax)`} stroke={deep} strokeOpacity="0.5" />
            {/* The pressed disc: sunk below the rim, lit from the top left. */}
            <circle cx={C} cy={C} r="76" fill={`url(#${id}-press)`} />
            <path
                d="M52 110 A58 58 0 0 1 168 110"
                fill="none"
                stroke={deep}
                strokeOpacity="0.55"
                strokeWidth="3"
            />
            <path
                d="M168 110 A58 58 0 0 1 52 110"
                fill="none"
                stroke={lit}
                strokeOpacity="0.45"
                strokeWidth="2.4"
            />
            <circle
                cx={C}
                cy={C}
                r="66"
                fill="none"
                stroke={lit}
                strokeOpacity="0.35"
                strokeWidth="2.2"
                strokeDasharray="0.1 7.2"
                strokeLinecap="round"
            />
            {/* Debossed initials: the highlight sits below the shadowed letters. */}
            <text
                x={C}
                y={C + 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="inv-display"
                fontSize={initials.length > 2 ? 50 : 62}
                fill={lit}
                fillOpacity="0.4"
                dx="1.2"
                dy="2"
            >
                {initials}
            </text>
            <text
                x={C}
                y={C + 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="inv-display"
                fontSize={initials.length > 2 ? 50 : 62}
                fill={deep}
                fillOpacity="0.85"
            >
                {initials}
            </text>
            <ellipse
                cx="78"
                cy="64"
                rx="34"
                ry="18"
                fill="#ffffff"
                opacity="0.18"
                transform="rotate(-28 78 64)"
            />
        </>
    );
    return (
        <svg
            viewBox={`-40 -40 ${String(SIZE + 80)} ${String(SIZE + 280)}`}
            className={className}
            style={{ overflow: 'visible' }}
            aria-hidden
        >
            <defs>
                <radialGradient id={`${id}-wax`} cx="0.36" cy="0.3" r="0.85">
                    <stop offset="0" stopColor={lit} />
                    <stop offset="0.45" stopColor={wax} />
                    <stop offset="1" stopColor={deep} />
                </radialGradient>
                <radialGradient id={`${id}-press`} cx="0.6" cy="0.62" r="0.7">
                    <stop offset="0" stopColor={mixHex(wax, '#ffffff', 0.08)} />
                    <stop offset="1" stopColor={mixHex(wax, '#000000', 0.22)} />
                </radialGradient>
                <clipPath id={`${id}-l`}>
                    <path d={crack.left} />
                </clipPath>
                <clipPath id={`${id}-r`}>
                    <path d={crack.right} />
                </clipPath>
            </defs>
            {/* Soft shadow of the wax on the paper; it goes with the wax. */}
            <g
                ref={(el) => {
                    handle.current.marks = el;
                }}
            >
                <ellipse cx={C + 6} cy={C + 10} rx="104" ry="100" fill="#000000" opacity="0.28" />
            </g>
            <g
                ref={(el) => {
                    handle.current.left = el;
                }}
                clipPath={`url(#${id}-l)`}
                style={half}
            >
                {body}
            </g>
            <g
                ref={(el) => {
                    handle.current.right = el;
                }}
                clipPath={`url(#${id}-r)`}
                style={half}
            >
                {body}
            </g>
            {chips.map((c, i) => (
                <g
                    key={i}
                    ref={(el) => {
                        handle.current.crumbs[i] = el;
                    }}
                    style={crumbOrigin(c)}
                    opacity={0}
                >
                    <path
                        d={`M${String(c.x - c.r)} ${String(c.y)} l${String(c.r * 0.8)} ${String(-c.r)} l${String(c.r * 1.3)} ${String(c.r * 0.3)} l${String(-c.r * 0.4)} ${String(c.r * 1.2)} Z`}
                        fill={`url(#${id}-wax)`}
                    />
                </g>
            ))}
            <g
                ref={(el) => {
                    if (el) handle.current.marksTop = el;
                }}
            >
                <path
                    ref={(el) => {
                        handle.current.crack = el;
                    }}
                    d={crack.line}
                    pathLength={1}
                    fill="none"
                    stroke={mixHex(wax, '#000000', 0.7)}
                    strokeWidth="3"
                    strokeDasharray="1"
                    strokeDashoffset="1"
                    strokeLinejoin="round"
                />
                <path
                    ref={(el) => {
                        handle.current.branches = el;
                    }}
                    d={crack.branches}
                    pathLength={1}
                    fill="none"
                    stroke={mixHex(wax, '#000000', 0.65)}
                    strokeWidth="1.8"
                    strokeDasharray="1"
                    strokeDashoffset="1"
                />
                {/* The press indicator: a fine gold ring that fills while the guest holds. */}
                <circle
                    ref={(el) => {
                        handle.current.ring = el;
                    }}
                    cx={C}
                    cy={C}
                    r="118"
                    pathLength={1}
                    fill="none"
                    stroke="var(--inv-gold)"
                    strokeWidth="2"
                    strokeDasharray="1"
                    strokeDashoffset="1"
                    transform={`rotate(-90 ${String(C)} ${String(C)})`}
                    strokeLinecap="round"
                />
            </g>
        </svg>
    );
}
