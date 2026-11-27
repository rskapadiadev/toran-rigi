import type { OutfitId } from '@shared/looks';
import { type CSSProperties, type JSX, type ReactNode, useId } from 'react';

export { type OutfitId, outfitIds } from '@shared/looks';

export interface OutfitProps {
    id: OutfitId;
    main: string;
    second: string;
    trim?: string;
    turban?: boolean;
    className?: string;
    title?: string;
}

const SKIN = '#c89f80';
const SKIN_SHADE = '#b48b6d';
const HAIR = '#2a201b';
const SHOE = '#2b211c';
const SHIRT = '#f3eee5';

interface Paint {
    /** Gradient fills, so every piece gets the same soft volume. */
    m: string;
    s: string;
    /** Flat colours for folds and quiet details. */
    main: string;
    second: string;
    mFold: string;
    sFold: string;
    light: string;
    lightFold: string;
    turban: boolean;
    clip: string;
}

function channel(hex: string): [number, number, number] | null {
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
    const body = match?.[1];
    if (body === undefined) return null;
    const full = body.length === 3 ? body.replace(/./g, '$&$&') : body;
    const n = Number.parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Blends toward black (to = 0) or white (to = 255); unknown colours pass through untouched.
function mix(hex: string, to: number, t: number): string {
    const rgb = channel(hex);
    if (rgb === null) return hex;
    const out = rgb.map((v) => Math.round(v + (to - v) * t));
    return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

interface ShadeProps {
    id: string;
    colour: string;
}

function Shade({ id, colour }: ShadeProps) {
    return (
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={mix(colour, 0, 0.26)} />
            <stop offset="0.3" stopColor={colour} />
            <stop offset="0.62" stopColor={mix(colour, 255, 0.07)} />
            <stop offset="1" stopColor={mix(colour, 0, 0.3)} />
        </linearGradient>
    );
}

// Mirrors a left-side piece onto the right, so arms and legs stay identical.
function Mirror({ children }: { children: ReactNode }) {
    return <g transform="matrix(-1 0 0 1 120 0)">{children}</g>;
}

interface FoldProps {
    d: string;
    colour: string;
    width?: number;
}

function Fold({ d, colour, width = 0.8 }: FoldProps) {
    return (
        <path
            d={d}
            fill="none"
            stroke={colour}
            strokeWidth={width}
            strokeLinecap="round"
            opacity={0.6}
        />
    );
}

interface TrimProps {
    d: string;
    width?: number;
}

function Trim({ d, width = 1 }: TrimProps) {
    return (
        <path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
}

interface DotsProps {
    at: [number, number][];
    r?: number;
}

function Dots({ at, r = 0.9 }: DotsProps) {
    return (
        <g fill="currentColor">
            {at.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
            ))}
        </g>
    );
}

// Height of a hem that dips `sag` at the centre, so folds and dots follow its curve.
function hemAt(x: number, half: number, y: number, sag: number): number {
    const u = (x - 60) / half;
    return Math.round((y + sag * (1 - u * u)) * 10) / 10;
}

function along(x0: number, x1: number, y: number, sag: number, count: number): [number, number][] {
    return Array.from({ length: count }, (_, i) => {
        const x = Math.round((x0 + ((x1 - x0) * i) / (count - 1)) * 10) / 10;
        return [x, hemAt(x, (x1 - x0) / 2, y, sag)];
    });
}

function GroundShadow() {
    return <ellipse cx="60" cy="330" rx="27" ry="2.6" fill="#000" opacity={0.16} />;
}

/* ---------- Heads ---------- */

const TURBAN = 'M47.8 32 C45 19 50.4 9.4 60 9.2 C69.6 9.4 75 19 72.2 32 C66 27 54 27 47.8 32 Z';

function LadyHead({ earrings = true }: { earrings?: boolean }) {
    return (
        <g>
            <ellipse cx="60" cy="18.5" rx="6.8" ry="5.6" fill={HAIR} />
            <path d="M56.2 40 L56.2 60 Q60 63 63.8 60 L63.8 40 Z" fill={SKIN_SHADE} />
            <ellipse cx="60" cy="32" rx="9.6" ry="13" fill={SKIN} />
            <path
                d="M50.3 36 C48.6 23.5 53.6 18.6 60 18.6 C66.4 18.6 71.4 23.5 69.7 36 C69 29.5 66.6 25.6 62.8 24.4 C58.6 26.8 53.6 28.8 50.3 36 Z"
                fill={HAIR}
            />
            {earrings ? (
                <Dots
                    at={[
                        [50.6, 38.6],
                        [69.4, 38.6],
                    ]}
                    r={1.3}
                />
            ) : null}
        </g>
    );
}

function ManHead({ p }: { p: Paint }) {
    return (
        <g>
            <path d="M54.8 41 L54.8 60 Q60 63 65.2 60 L65.2 41 Z" fill={SKIN_SHADE} />
            <ellipse cx="60" cy="32" rx="10.2" ry="13.4" fill={SKIN} />
            {p.turban ? (
                <g>
                    <clipPath id={p.clip}>
                        <path d={TURBAN} />
                    </clipPath>
                    <path d={TURBAN} fill={p.s} />
                    <g clipPath={`url(#${p.clip})`}>
                        <Fold d="M44 22 C54 18 64 13 76 12" colour={p.sFold} />
                        <Fold d="M44 28.4 C54 24 66 19 76 18.4" colour={p.sFold} />
                        <Fold d="M44 15.6 C52 12 60 8.6 70 7" colour={p.sFold} />
                    </g>
                    <Trim d="M47.8 32 C54 27 66 27 72.2 32" width={0.9} />
                    <Trim d="M61 23.4 C61.2 18 63.4 13 68 9.6" width={1.1} />
                    <Dots at={[[61, 24.4]]} r={1.7} />
                </g>
            ) : (
                <path
                    d="M49.6 31.5 C48.6 21 53.6 17.2 60.4 17.3 C67.4 17.4 71.8 21.4 70.6 31.5 C69.6 26.2 67 23.8 62.6 23.4 C57.8 24 52.2 25.6 49.6 31.5 Z"
                    fill={HAIR}
                />
            )}
        </g>
    );
}

/* ---------- Shared limbs ---------- */

// Bare arm with bangles, for blouses and gowns.
function BareArm() {
    return (
        <g>
            <path
                d="M47.2 61.6 C42.6 62.4 40.4 67.4 40.4 75 C40 96 39 120 38.6 142 C38.5 150 38.6 156 38.9 160 L43.1 160 C43.6 150 44.2 140 45.2 124 C46.2 108 47.2 94 48.4 80 Z"
                fill={SKIN}
            />
            <path
                d="M38.9 159 C37.2 164 37.6 171 40 174.4 C42.6 172.6 43.8 166.4 43.1 159 Z"
                fill={SKIN}
            />
            <Trim d="M38.8 153.6 L43.3 154.2" width={0.9} />
            <Trim d="M38.8 156.2 L43.2 156.8" width={0.9} />
        </g>
    );
}

// Long sleeve for ladies' kurtas, ending in a cuff and hand.
interface LadySleeveProps {
    p: Paint;
    to?: number;
}

function LadySleeve({ p, to = 158 }: LadySleeveProps) {
    return (
        <g>
            <path
                d="M38.9 159 C37.2 164 37.6 171 40 174.4 C42.6 172.6 43.8 166.4 43.1 159 Z"
                fill={SKIN}
            />
            <path
                d={`M47.4 61.4 C42.2 62.2 39.8 67.4 39.8 75.6 C39.4 98 38.4 128 38 ${to} L44.2 ${to} C44.8 130 46.2 104 48.6 80 Z`}
                fill={p.m}
            />
            <Trim d={`M38.1 ${to - 4} L44.3 ${to - 4}`} width={1.2} />
        </g>
    );
}

interface ManSleeveProps {
    fill: string;
    cuff?: string;
}

function ManSleeve({ fill, cuff }: ManSleeveProps) {
    return (
        <g>
            <path
                d="M35.2 162 C34 167.6 34.6 175 37.6 178.2 C40.8 177 42.4 170 42 162 Z"
                fill={SKIN}
            />
            {cuff === undefined ? null : (
                <path d="M34.6 158 L42.4 158.4 L42.3 164 L34.8 163.6 Z" fill={cuff} />
            )}
            <path
                d="M41.2 62.4 C37 64.4 35.4 71 35.2 80 C34.8 108 34.4 136 34.6 160 L42.4 160.4 C42.6 136 43.4 108 44.8 86 Z"
                fill={fill}
            />
        </g>
    );
}

function Juttis({ colour }: { colour: string }) {
    return (
        <g fill={colour}>
            <path d="M50.4 325 C52.4 323.4 57 323.4 58.6 325.4 L58.4 329 C55.6 329.8 51.6 329.6 49.2 328.8 Z" />
            <path d="M69.6 325 C67.6 323.4 63 323.4 61.4 325.4 L61.6 329 C64.4 329.8 68.4 329.6 70.8 328.8 Z" />
        </g>
    );
}

function MenShoes({ colour }: { colour: string }) {
    return (
        <g fill={colour}>
            <path d="M46 323.6 C48 321.8 55.6 321.6 58.6 323.6 L58.6 328.4 C54 329.6 47.4 329.6 43.4 328.6 C43.2 326.4 44.2 324.8 46 323.6 Z" />
            <path d="M74 323.6 C72 321.8 64.4 321.6 61.4 323.6 L61.4 328.4 C66 329.6 72.6 329.6 76.6 328.6 C76.8 326.4 75.8 324.8 74 323.6 Z" />
        </g>
    );
}

// Bare shoulders and midriff, worn under a choli.
const BARE_TORSO =
    'M46.6 62 C52 59 68 59 73.4 62 L72 84 C70 95 68.6 102 69.6 113 L50.4 113 C51.4 102 50 95 48 84 Z';

function Choli({ p }: { p: Paint }) {
    return (
        <g>
            <path d={BARE_TORSO} fill={SKIN} />
            <path
                d="M45.6 62.2 C50.8 59 54.6 59.8 56 61 Q60 71 64 61 C65.4 59.8 69.2 59 74.4 62.2 L73.6 72 C72 80 71.2 86 71.6 92.6 C64.2 95 55.8 95 48.4 92.6 C48.8 86 48 80 46.4 72 Z"
                fill={p.m}
            />
            <Trim d="M56 61 Q60 71 64 61" width={0.9} />
            <Trim d="M48.4 92.6 C55.8 95 64.2 95 71.6 92.6" width={1.1} />
            <Mirror>
                <path
                    d="M47.6 61.2 C43 62 40.4 66.4 40.2 75.4 C42.6 76.6 45.4 77 48 76.2 Z"
                    fill={p.m}
                />
            </Mirror>
            <path
                d="M47.6 61.2 C43 62 40.4 66.4 40.2 75.4 C42.6 76.6 45.4 77 48 76.2 Z"
                fill={p.m}
            />
        </g>
    );
}

/* ---------- Ladies ---------- */

function Sari(p: Paint) {
    return (
        <g>
            <path
                d="M70 60 C78.6 61.6 83.4 70 84.4 90 C86.4 140 88.4 200 86.4 252 C82.4 254.4 77.4 253.6 74 250 C75 200 74.2 140 72.4 100 Z"
                fill={p.s}
            />
            <Trim d="M84.4 90 C86.4 140 88.4 200 86.4 252 C82.4 254.4 77.4 253.6 74 250" />
            <path
                d="M51 110 C47 124 45.6 140 46 162 C46.6 220 44 280 41.6 327 C54 329.4 66 329.4 78.4 327 C76 280 73.4 220 74 162 C74.4 140 73 124 69 110 Z"
                fill={p.m}
            />
            <Fold d="M62.4 121 C61.6 200 58.6 270 55.4 327.8" colour={p.mFold} />
            <Fold d="M64.8 121 C64.8 200 64 270 63 328" colour={p.mFold} />
            <Fold d="M67 121 C67.6 200 68.4 270 68.6 328" colour={p.mFold} />
            <Fold d="M69 121 C70.6 200 73 270 75.6 327.4" colour={p.mFold} />
            <Fold d="M50 150 C49 220 48.4 280 48 326" colour={p.mFold} width={0.6} />
            <Trim d="M41.9 322.6 C54 325 66 325 78.1 322.6" width={1.6} />
            <Trim d="M42.3 318.4 C54 320.8 66 320.8 77.7 318.4" width={0.6} />
            <Choli p={p} />
            <BareArm />
            <Mirror>
                <BareArm />
            </Mirror>
            <path
                d="M48.6 120 C54 107 62 90 67.6 72 C69 67 70 63 70.6 59.6 C74.6 59.4 78.4 61 79.4 63.4 C77.4 80 72.6 96 66.6 108 C62.6 116 58.6 122 55.4 127 Z"
                fill={p.s}
            />
            <Fold d="M52.6 123 C59.6 108 67.8 88 74.4 61.6" colour={p.sFold} />
            <Fold d="M56 124.6 C62 112 69 96 75.4 70" colour={p.sFold} width={0.6} />
            <Trim d="M48.6 120 C54 107 62 90 67.6 72 C69 67 70 63 70.6 59.6" />
            <Trim d="M79.4 63.4 C77.4 80 72.6 96 66.6 108 C62.6 116 58.6 122 55.4 127" />
            <LadyHead />
        </g>
    );
}

function Lehenga(p: Paint) {
    const folds = [-3, -2, -1, 0, 1, 2, 3];
    return (
        <g>
            <g opacity={0.86}>
                <path
                    d="M71 60.4 C80.6 63 86 74 87.6 96 C90.4 150 95.4 220 99.6 296 C94 300 87.6 300 82.4 296 C80.2 220 77.4 150 74 104 Z"
                    fill={p.s}
                />
            </g>
            <Trim d="M87.6 96 C90.4 150 95.4 220 99.6 296 C94 300 87.6 300 82.4 296" width={0.9} />
            <path
                d="M51 108 C42 160 26 240 12 318 C40 329.6 80 329.6 108 318 C94 240 78 160 69 108 Z"
                fill={p.m}
            />
            {folds.map((i) => (
                <Fold
                    key={i}
                    d={`M${60 + i * 2.6} 114 Q${60 + i * 7.6} 220 ${60 + i * 13.6} ${hemAt(60 + i * 13.6, 48, 316.6, 8.7)}`}
                    colour={p.mFold}
                />
            ))}
            <Trim d="M12.8 313.4 C40 324.6 80 324.6 107.2 313.4" width={1.8} />
            <Trim d="M16 302.4 C40 312.6 80 312.6 104 302.4" width={0.6} />
            <Dots at={along(20, 100, 299.4, 8.4, 9)} r={1} />
            <Trim d="M50.6 110 C57 112.4 63 112.4 69.4 110" width={1.4} />
            <Choli p={p} />
            <BareArm />
            <Mirror>
                <BareArm />
            </Mirror>
            <g opacity={0.86}>
                <path
                    d="M70.4 59.6 C75 59.4 78.8 61 79.6 63.4 C76 86 62 104 51 115 C47 119 44.6 125 43.8 134 C42 170 41.4 205 42 242 C38 244.6 33.4 244.6 30.2 242 C31.4 200 33 160 35.8 132 C37.6 118 46 106 55 97 C62.6 88 68 76 70.4 59.6 Z"
                    fill={p.s}
                />
            </g>
            <Fold
                d="M74 64 C70 88 58 106 46 118 C40.6 126 38.6 140 37.6 160"
                colour={p.sFold}
                width={0.6}
            />
            <Trim
                d="M79.6 63.4 C76 86 62 104 51 115 C47 119 44.6 125 43.8 134 C42 170 41.4 205 42 242"
                width={0.9}
            />
            <Trim d="M30.2 242 C33.4 244.6 38 244.6 42 242" width={1.4} />
            <Dots
                at={[
                    [31.4, 236],
                    [36, 237.4],
                    [40.6, 236],
                ]}
                r={0.8}
            />
            <LadyHead />
        </g>
    );
}

function Dupatta({ p }: { p: Paint }) {
    return (
        <g opacity={0.84}>
            <path
                d="M45 61.6 C37 68 32 104 29.4 160 C27.6 205 26.6 240 27.4 276 C30.6 278.6 34.2 278.6 36.6 276.4 C37 236 39 196 41.6 160 C43 130 44.6 100 47 76 Z"
                fill={p.s}
            />
            <Mirror>
                <path
                    d="M45 61.6 C37 68 32 104 29.4 160 C27.6 205 26.6 240 27.4 276 C30.6 278.6 34.2 278.6 36.6 276.4 C37 236 39 196 41.6 160 C43 130 44.6 100 47 76 Z"
                    fill={p.s}
                />
            </Mirror>
        </g>
    );
}

function Anarkali(p: Paint) {
    const folds = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    return (
        <g>
            <Dupatta p={p} />
            <Trim d="M27.4 276 C30.6 278.6 34.2 278.6 36.6 276.4" width={1.2} />
            <Trim d="M92.6 276 C89.4 278.6 85.8 278.6 83.4 276.4" width={1.2} />
            <path d="M51.4 296 L50.6 326 L57.4 326 L58.6 296 Z" fill={p.s} />
            <path d="M68.6 296 L69.4 326 L62.6 326 L61.4 296 Z" fill={p.s} />
            <Fold
                d="M50.8 312 Q54 314 57.6 312 M50.8 317 Q54 319 57.4 317 M50.6 322 Q54 324 57.4 322"
                colour={p.sFold}
            />
            <Fold
                d="M69.2 312 Q66 314 62.4 312 M69.2 317 Q66 319 62.6 317 M69.4 322 Q66 324 62.6 322"
                colour={p.sFold}
            />
            <path
                d="M49 95 C38 150 24 230 14 296 C40 307 80 307 106 296 C96 230 82 150 71 95 Z"
                fill={p.m}
            />
            {folds.map((i) => (
                <Fold
                    key={i}
                    d={`M${60 + i * 2.2} 100 Q${60 + i * 6} 200 ${60 + i * 10.4} ${hemAt(60 + i * 10.4, 46, 295, 8.2)}`}
                    colour={p.mFold}
                    width={0.6}
                />
            ))}
            <Trim d="M14.6 292 C40 303 80 303 105.4 292" width={1.8} />
            <Dots at={along(22, 98, 283.4, 8, 9)} r={0.9} />
            <path
                d="M45.6 62.2 C50.8 59 54.6 59.8 56 61 Q60 69 64 61 C65.4 59.8 69.2 59 74.4 62.2 L73 76 C71.6 84 71 90 71 97 L49 97 C49 90 48.4 84 47 76 Z"
                fill={p.m}
            />
            <Trim d="M56 61 Q60 69 64 61" width={0.9} />
            <Trim d="M49 96 C56 97.6 64 97.6 71 96" width={1.6} />
            <LadySleeve p={p} />
            <Mirror>
                <LadySleeve p={p} />
            </Mirror>
            <LadyHead />
        </g>
    );
}

function Sharara(p: Paint) {
    return (
        <g>
            <path
                d="M47.4 180 C42 236 30 290 17 326.4 C30 328.4 45 328.6 57.6 327.4 C58.6 290 59.4 240 60 190 Z"
                fill={p.s}
            />
            <Mirror>
                <path
                    d="M47.4 180 C42 236 30 290 17 326.4 C30 328.4 45 328.6 57.6 327.4 C58.6 290 59.4 240 60 190 Z"
                    fill={p.s}
                />
            </Mirror>
            <Fold
                d="M52 214 C48 260 40 296 31 327 M56 220 C54.6 262 51.6 298 47 328"
                colour={p.sFold}
            />
            <Fold
                d="M68 214 C72 260 80 296 89 327 M64 220 C65.4 262 68.4 298 73 328"
                colour={p.sFold}
            />
            <Trim d="M17.6 322.6 C30 324.6 45 324.8 57.6 323.6" width={1.6} />
            <Trim d="M102.4 322.6 C90 324.6 75 324.8 62.4 323.6" width={1.6} />
            <path
                d="M45.6 62.2 C50.8 59 54.6 59.8 56 61 Q60 69 64 61 C65.4 59.8 69.2 59 74.4 62.2 L73 78 C72 95 71 110 72 125 C74 150 77 175 79.4 202 C66 205.4 54 205.4 40.6 202 C43 175 46 150 48 125 C49 110 48 95 47 78 Z"
                fill={p.m}
            />
            <Fold
                d="M54 120 C52 150 50 176 48 203 M66 120 C68 150 70 176 72 203"
                colour={p.mFold}
            />
            <Trim d="M56 61 Q60 69 64 61" width={0.9} />
            <Trim d="M60 69 L60 92" width={0.7} />
            <Trim d="M41 198 C54 201.4 66 201.4 79 198" width={1.6} />
            <Dots at={along(45, 75, 192.6, 2.4, 6)} r={0.8} />
            <LadySleeve p={p} />
            <Mirror>
                <LadySleeve p={p} />
            </Mirror>
            <g opacity={0.84}>
                <path
                    d="M70.4 59.6 C75.4 59.4 79 61 80.4 64 C82 100 84 150 84.6 214 C81.4 216.4 77.6 216.4 75 214.4 C74.8 160 74 110 70.4 59.6 Z"
                    fill={p.s}
                />
            </g>
            <Trim d="M75 214.4 C77.6 216.4 81.4 216.4 84.6 214" width={1.2} />
            <LadyHead />
        </g>
    );
}

function Gown(p: Paint) {
    return (
        <g>
            <g opacity={0.62}>
                <path
                    d="M45.4 66 C36 74 31 118 27 180 C24 240 20 290 16 326 C26 329.4 36 329.6 44 328 C42 280 42 220 44 160 Z"
                    fill={p.s}
                />
                <Mirror>
                    <path
                        d="M45.4 66 C36 74 31 118 27 180 C24 240 20 290 16 326 C26 329.4 36 329.6 44 328 C42 280 42 220 44 160 Z"
                        fill={p.s}
                    />
                </Mirror>
            </g>
            <path d={BARE_TORSO} fill={SKIN} />
            <path
                d="M46.6 74 C51 71 55.6 72 60 77 C64.4 72 69 71 73.4 74 L72.4 90 C71 100 70 106 70.6 114 C73.6 128 75 146 73.6 176 C72.8 194 71.8 206 72 216 C80 254 94 296 106 322 C80 331 40 331 14 322 C26 296 40 254 48 216 C48.2 206 47.2 194 46.4 176 C45 146 46.4 128 49.4 114 C50 106 49 100 47.6 90 Z"
                fill={p.m}
            />
            <Fold
                d="M52 230 C46 266 36 298 26 324 M57 232 C54 270 50 300 46 328"
                colour={p.mFold}
            />
            <Fold
                d="M68 230 C74 266 84 298 94 324 M63 232 C66 270 70 300 74 328"
                colour={p.mFold}
            />
            <Fold d="M60 120 L60 220" colour={p.mFold} width={0.6} />
            <Fold d="M48 216 C54 219 66 219 72 216" colour={p.mFold} width={0.6} />
            <Trim d="M46.6 74 C51 71 55.6 72 60 77 C64.4 72 69 71 73.4 74" width={1} />
            <path
                d="M49.4 110.4 C56 113.4 64 113.4 70.6 110.4 L70.6 116.6 C64 119.6 56 119.6 49.4 116.6 Z"
                fill={p.s}
            />
            <Dots at={[[60, 113.8]]} r={1.4} />
            <Trim d="M54.6 54.6 Q60 60.4 65.4 54.6" width={0.6} />
            <Dots at={[[60, 58.8]]} r={1.1} />
            <BareArm />
            <Mirror>
                <BareArm />
            </Mirror>
            <LadyHead earrings={false} />
        </g>
    );
}

function Abaya(p: Paint) {
    return (
        <g>
            <path
                d="M44 66 C52 62 68 62 76 66 C78.4 110 82.6 200 92.6 326.4 C70 330 50 330 27.4 326.4 C37.4 200 41.6 110 44 66 Z"
                fill={p.m}
            />
            <Fold
                d="M52 140 C48 200 42 270 36 326 M68 140 C72 200 78 270 84 326"
                colour={p.mFold}
            />
            <Trim d="M60 76 L60 326" width={0.7} />
            <Dots
                at={[
                    [60, 90],
                    [60, 104],
                    [60, 118],
                    [60, 132],
                ]}
                r={0.8}
            />
            <Trim d="M28.2 320.6 C50 324 70 324 91.8 320.6" width={1.4} />
            <Mirror>
                <path
                    d="M35.6 163 C34.4 168.4 35 175 37.8 178 C40.8 176.8 42.2 170.4 41.8 163 Z"
                    fill={SKIN}
                />
                <path
                    d="M44.6 66.4 C38.4 68.6 35 80 34 110 C33 135 31 150 28.6 166 C33 168.4 40 168.4 45.6 165.6 C45.4 140 46 110 47.4 86 Z"
                    fill={p.m}
                />
                <Trim d="M29.2 162 C33.4 164.4 40.2 164.4 45.6 161.6" width={1.2} />
            </Mirror>
            <path
                d="M35.6 163 C34.4 168.4 35 175 37.8 178 C40.8 176.8 42.2 170.4 41.8 163 Z"
                fill={SKIN}
            />
            <path
                d="M44.6 66.4 C38.4 68.6 35 80 34 110 C33 135 31 150 28.6 166 C33 168.4 40 168.4 45.6 165.6 C45.4 140 46 110 47.4 86 Z"
                fill={p.m}
            />
            <Trim d="M29.2 162 C33.4 164.4 40.2 164.4 45.6 161.6" width={1.2} />
            <path
                d="M60 15.2 C71 15.2 75 24.4 74.6 34 C74.2 42 72.4 48 71.6 53 C79 57 83.4 64 83 76 C82.6 84 80.6 90 78 95 C68 100 52 100 42 95 C39.4 90 37.4 84 37 76 C36.6 64 41 57 48.4 53 C47.6 48 45.8 42 45.4 34 C45 24.4 49 15.2 60 15.2 Z"
                fill={p.s}
            />
            <Fold
                d="M48.6 58 C53 65 67 65 71.4 58 M41 74 C50 84 70 84 79 74"
                colour={p.sFold}
                width={0.7}
            />
            <ellipse cx="60" cy="34" rx="8.2" ry="11.2" fill={SKIN} />
            <Fold d="M51.4 27 C53.6 20.6 66.4 20.6 68.6 27" colour={p.sFold} width={1.1} />
            <Trim d="M42 95 C52 100 68 100 78 95" width={0.9} />
        </g>
    );
}

/* ---------- Gentlemen ---------- */

const KURTA =
    'M41 63 C48 59.4 54 59 56 59 L64 59 C66 59 72 59.4 79 63 C80 90 78.4 120 78.4 150 C79 180 80 205 81 232 C67 235.4 53 235.4 39 232 C40 205 41 180 41.6 150 C41.6 120 40 90 41 63 Z';

interface PyjamaProps {
    fill: string;
    fold: string;
    ruched?: boolean;
}

function Pyjama({ fill, fold, ruched = false }: PyjamaProps) {
    return (
        <g>
            <path
                d="M44.4 222 C45 260 46 300 47 324 L58.6 324 C59 300 59.4 260 59.8 222 Z"
                fill={fill}
            />
            <Mirror>
                <path
                    d="M44.4 222 C45 260 46 300 47 324 L58.6 324 C59 300 59.4 260 59.8 222 Z"
                    fill={fill}
                />
            </Mirror>
            <Fold d="M52.6 240 L53.4 322 M67.4 240 L66.6 322" colour={fold} width={0.6} />
            {ruched ? (
                <Fold
                    d="M47 304 Q52.8 306.4 58.8 304 M47.2 310 Q52.8 312.4 58.8 310 M47.4 316 Q52.8 318.4 58.8 316 M73 304 Q67.2 306.4 61.2 304 M72.8 310 Q67.2 312.4 61.2 310 M72.6 316 Q67.2 318.4 61.2 316"
                    colour={fold}
                />
            ) : null}
        </g>
    );
}

function MandarinCollar({ fill }: { fill: string }) {
    return (
        <g>
            <path d="M54 57 C57 59 63 59 66 57 L66.2 62 C63 64 57 64 53.8 62 Z" fill={fill} />
            <Trim d="M53.8 62 C57 64 63 64 66.2 62" width={0.8} />
        </g>
    );
}

function Kurta(p: Paint) {
    return (
        <g>
            <Pyjama fill={p.s} fold={p.sFold} />
            <path d={KURTA} fill={p.m} />
            <Fold
                d="M48 150 C47 180 46.4 206 45.6 233 M72 150 C73 180 73.6 206 74.4 233"
                colour={p.mFold}
            />
            <Fold d="M41.6 204 L40 232 M78.4 204 L80 232" colour={p.mFold} width={1} />
            <Trim d="M39.4 228.6 C53 231.8 67 231.8 80.6 228.6" width={1.4} />
            <Trim d="M60 62 L60 110" width={0.7} />
            <Dots
                at={[
                    [60, 70],
                    [60, 80],
                    [60, 90],
                    [60, 100],
                ]}
                r={0.95}
            />
            <ManSleeve fill={p.m} />
            <Mirror>
                <ManSleeve fill={p.m} />
            </Mirror>
            <Trim d="M34.8 156 L42.4 156.4 M85.2 156 L77.6 156.4" width={1.2} />
            <MandarinCollar fill={p.m} />
            <Juttis colour="currentColor" />
            <ManHead p={p} />
        </g>
    );
}

function Sherwani(p: Paint) {
    const buttons = [70, 80, 90, 100, 110, 120, 130];
    return (
        <g>
            <Pyjama fill={p.light} fold={p.lightFold} ruched />
            <path
                d="M39.4 62 C46 59.4 53 59 55 58.6 L65 58.6 C67 59 74 59.4 80.6 62 C81.6 85 79.2 110 78.6 135 C78.6 175 80 215 81.4 256 C67 259.4 53 259.4 38.6 256 C40 215 41.4 175 41.4 135 C40.8 110 38.4 85 39.4 62 Z"
                fill={p.m}
            />
            <Fold d="M60 62 L60 258" colour={p.mFold} width={1} />
            <Fold
                d="M48 150 C47 190 46 220 45.4 256 M72 150 C73 190 74 220 74.6 256"
                colour={p.mFold}
            />
            <Trim d="M38.8 251.6 C53 255 67 255 81.2 251.6" width={1.8} />
            <Trim d="M58.6 64 L58.6 252 M61.4 64 L61.4 252" width={0.5} />
            <Dots at={buttons.map((y): [number, number] => [60, y])} r={1.15} />
            <ManSleeve fill={p.m} />
            <Mirror>
                <ManSleeve fill={p.m} />
            </Mirror>
            <Trim
                d="M34.8 154.6 L42.4 155 M34.8 157.4 L42.4 157.8 M85.2 154.6 L77.6 155 M85.2 157.4 L77.6 157.8"
                width={0.9}
            />
            <path
                d="M67 59 C72 59 77 60 80.8 62.4 C82 68 81.6 74 80.6 80 C79 120 77.6 170 77 222 C74.6 224 71.4 224 69 222 C69.4 170 69.6 120 68.6 76 Z"
                fill={p.s}
            />
            <Fold d="M73 66 C74.6 110 73.8 170 73 222" colour={p.sFold} />
            <Trim d="M69 222 C71.4 224 74.6 224 77 222" width={1.4} />
            <Dots
                at={[
                    [70.6, 226.6],
                    [73, 227.4],
                    [75.4, 226.6],
                ]}
                r={0.8}
            />
            <MandarinCollar fill={p.m} />
            <Juttis colour="currentColor" />
            <ManHead p={p} />
        </g>
    );
}

function Bandhgala(p: Paint) {
    return (
        <g>
            <Pyjama fill={p.light} fold={p.lightFold} ruched />
            <path d={KURTA} fill={p.m} />
            <Fold d="M41.6 204 L40 232 M78.4 204 L80 232" colour={p.mFold} width={1} />
            <Trim d="M39.4 228.6 C53 231.8 67 231.8 80.6 228.6" width={1.2} />
            <ManSleeve fill={p.m} />
            <Mirror>
                <ManSleeve fill={p.m} />
            </Mirror>
            <path
                d="M43.4 63 C49 60.4 54 59.4 55.6 58.8 L64.4 58.8 C66 59.4 71 60.4 76.6 63 C78 70 78 78 77.2 86 C76.8 108 76.8 130 77.6 152 C71 155 64.4 155.4 60 158 C55.6 155.4 49 155 42.4 152 C43.2 130 43.2 108 42.8 86 C42 78 42 70 43.4 63 Z"
                fill={p.s}
            />
            <Fold d="M60 62 L60 157" colour={p.sFold} width={1} />
            <Dots
                at={[
                    [60, 72],
                    [60, 84],
                    [60, 96],
                    [60, 108],
                    [60, 120],
                    [60, 132],
                ]}
                r={1.05}
            />
            <Trim d="M66 84 L73.4 83.2" width={1} />
            <Trim d="M45.6 132 L53.6 132.8 M66.4 132.8 L74.4 132" width={1} />
            <Trim d="M42.4 152 C49 155 55.6 155.4 60 158 C64.4 155.4 71 155 77.6 152" width={0.6} />
            <MandarinCollar fill={p.s} />
            <Juttis colour="currentColor" />
            <ManHead p={p} />
        </g>
    );
}

function Suit(p: Paint) {
    const lapel = 'M55.2 58.6 L60 104 L56 96 L48.6 76.6 L52.8 72.4 L50.8 65.6 Z';
    return (
        <g>
            <path d="M43.8 160 L46.4 324 L58.6 324 L59.8 176 Z" fill={p.m} />
            <Mirror>
                <path d="M43.8 160 L46.4 324 L58.6 324 L59.8 176 Z" fill={p.m} />
            </Mirror>
            <path d="M43.8 158 L76.2 158 L60.2 182 Z" fill={p.m} />
            <Fold d="M51.8 176 L52.6 322 M68.2 176 L67.4 322" colour={p.mFold} width={0.6} />
            <path d="M53.8 57 L66.2 57 L66 66 L60 106 L54 66 Z" fill={SHIRT} />
            <path d="M58.2 61.6 L61.8 61.6 L61.2 66 L58.8 66 Z" fill={p.second} />
            <path d="M58.8 66 L61.2 66 L63 95 L60 99.4 L57 95 Z" fill={p.s} />
            <path
                d="M39.4 62 C46 59.4 53 59 55.2 58.6 L60 104 L64.8 58.6 C67 59 74 59.4 80.6 62 C81.6 85 79.2 110 78.6 135 C78.6 150 79 160 79.6 169 C72 172 64.4 172 60 169 C55.6 172 48 172 40.4 169 C41 160 41.4 150 41.4 135 C40.8 110 38.4 85 39.4 62 Z"
                fill={p.m}
            />
            <path d={lapel} fill={p.mFold} opacity={0.55} />
            <Mirror>
                <path d={lapel} fill={p.mFold} opacity={0.55} />
            </Mirror>
            <Fold d="M60 104 L60 169" colour={p.mFold} width={0.9} />
            <Dots
                at={[
                    [60, 116],
                    [60, 130],
                ]}
                r={1.2}
            />
            <Fold d="M45 140 L54 140.6 M66 140.6 L75 140" colour={p.mFold} width={1.1} />
            <path
                d="M66.6 84.6 L73.6 83.8 L72.8 80 L71.2 82.4 L69.8 79.4 L68.4 82.6 Z"
                fill={p.s}
            />
            <ManSleeve fill={p.m} cuff={SHIRT} />
            <Mirror>
                <ManSleeve fill={p.m} cuff={SHIRT} />
            </Mirror>
            <MenShoes colour={SHOE} />
            <ManHead p={p} />
        </g>
    );
}

const figures: Record<OutfitId, (p: Paint) => ReactNode> = {
    sari: Sari,
    lehenga: Lehenga,
    anarkali: Anarkali,
    sharara: Sharara,
    gown: Gown,
    abaya: Abaya,
    kurta: Kurta,
    sherwani: Sherwani,
    bandhgala: Bandhgala,
    suit: Suit,
};

export function Outfit({
    id,
    main,
    second,
    trim = 'var(--inv-gold, #c9a24a)',
    turban = false,
    className,
    title,
}: OutfitProps): JSX.Element {
    // The colours join the id too, so figures rendered in separate static passes never share a gradient.
    const uid = `outfit${useId()}${main}${second}`.replace(/[^a-zA-Z0-9_-]/g, '');
    const paint: Paint = {
        m: `url(#${uid}m)`,
        s: `url(#${uid}s)`,
        main,
        second,
        mFold: mix(main, 0, 0.42),
        sFold: mix(second, 0, 0.42),
        light: mix(main, 255, 0.74),
        lightFold: mix(main, 0, 0.2),
        turban,
        clip: `${uid}t`,
    };
    const ink: CSSProperties = { color: trim };
    return (
        <svg
            viewBox="0 0 120 340"
            className={className}
            style={ink}
            role={title === undefined ? undefined : 'img'}
            aria-hidden={title === undefined ? true : undefined}
        >
            {title === undefined ? null : <title>{title}</title>}
            <defs>
                <Shade id={`${uid}m`} colour={main} />
                <Shade id={`${uid}s`} colour={second} />
            </defs>
            <GroundShadow />
            {figures[id](paint)}
        </svg>
    );
}
