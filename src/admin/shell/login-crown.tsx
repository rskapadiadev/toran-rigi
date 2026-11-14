import { type CultureId, cultures } from '@shared/cultures';
import { type OccasionId, occasions } from '@shared/occasions';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    type CSSProperties,
    type PointerEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react';

import { LoginScene, type SceneId } from '@/admin/shell/login-scenes';
import { browserCultures, culturesForCountry } from '@/admin/shell/region';
import { cn } from '@/lib/utils';

// The login panel's crown: a toran strung across the doorway and a greeting beneath it, turning
// through every occasion Toran makes. Each slide is *strung* rather than dropped in: the cord draws
// out from the centre, beads pop on as it passes, hanging pieces swing in and settle. Afterwards only
// a few things live (flames, glints, a slow breath in the drops), so the panel stays calm.
// Greetings come from the vetted culture packs, never written here; where a culture has none for
// the occasion, the occasion's own name and closing line stand in.

type Bead = 'round' | 'rose' | 'pearl' | 'chain' | 'flag';
type Accent = 'mango' | 'leaf' | 'olive' | 'star' | 'none';
type Drop = 'bell' | 'lantern' | 'diya' | 'rose' | 'bud' | 'star' | 'diamond' | 'none';

interface Look {
    beads: string[];
    stroke: string;
    bead: Bead;
    accent: Accent;
    drop: Drop;
    glints?: boolean;
    // Remembrance: slow fades, no pop or bounce, no glints.
    calm?: boolean;
}

const MARIGOLD: Look = {
    beads: ['#e8780c', '#f6a10a'],
    stroke: '#b85a06',
    bead: 'round',
    accent: 'mango',
    drop: 'bell',
    glints: true,
};
const GOLD_CHAIN: Look = {
    beads: ['#d9b25f', '#f1e4c0'],
    stroke: '#8a6a24',
    bead: 'chain',
    accent: 'none',
    drop: 'diamond',
    glints: true,
};
const TUBEROSE: Look = {
    beads: ['#f7f3ea', '#e6dfd0'],
    stroke: '#b8ad98',
    bead: 'round',
    accent: 'leaf',
    drop: 'bud',
    calm: true,
};

interface Slide {
    occasion: OccasionId;
    culture: CultureId;
    // Key into the culture's vetted greetings; omitted → the occasion's name and closing.
    greeting?: string;
    // Script to show the greeting in.
    lang: string;
    look: Look;
}

const SLIDES: Slide[] = [
    {
        occasion: 'wedding',
        culture: 'hindu',
        greeting: 'shubh-vivah',
        lang: 'hi',
        look: MARIGOLD,
    },
    {
        occasion: 'wedding',
        culture: 'islamic',
        greeting: 'mubarak',
        lang: 'ur',
        look: {
            ...GOLD_CHAIN,
            accent: 'star',
            drop: 'lantern',
        },
    },
    {
        occasion: 'wedding',
        culture: 'christian',
        greeting: 'love-is-patient',
        lang: 'en',
        look: {
            beads: ['#fbf3ec', '#f3c4c9'],
            stroke: '#c98a93',
            bead: 'rose',
            accent: 'leaf',
            drop: 'rose',
            glints: true,
        },
    },
    {
        occasion: 'wedding',
        culture: 'jewish',
        greeting: 'mazel-tov',
        lang: 'he',
        look: {
            beads: ['#fbf6ee', '#dfe7f2'],
            stroke: '#a9b6c9',
            bead: 'rose',
            accent: 'olive',
            drop: 'bud',
            glints: true,
        },
    },
    {
        occasion: 'engagement',
        culture: 'sikh',
        greeting: 'ik-onkar',
        lang: 'pa',
        look: {
            ...MARIGOLD,
            beads: ['#f08a00', '#fbf3e4'],
            stroke: '#b86200',
        },
    },
    {
        occasion: 'anniversary',
        culture: 'christian',
        greeting: 'love-is-patient',
        lang: 'en',
        look: {
            beads: ['#f3c4c9', '#fbf3ec'],
            stroke: '#c98a93',
            bead: 'rose',
            accent: 'leaf',
            drop: 'rose',
            glints: true,
        },
    },
    {
        occasion: 'naming',
        culture: 'islamic',
        greeting: 'bismillah',
        lang: 'ar',
        look: {
            ...GOLD_CHAIN,
            accent: 'star',
            drop: 'lantern',
        },
    },
    {
        occasion: 'baby_shower',
        culture: 'jewish',
        greeting: 'mazel-tov',
        lang: 'he',
        look: {
            beads: ['#f6d7de', '#d6e6f3', '#fbf3e4'],
            stroke: '#b9a7b0',
            bead: 'pearl',
            accent: 'none',
            drop: 'star',
            glints: true,
        },
    },
    {
        occasion: 'griha_pravesh',
        culture: 'jain',
        greeting: 'jai-jinendra',
        lang: 'hi',
        look: {
            ...MARIGOLD,
            beads: ['#fbf6e9', '#f3d36b'],
            stroke: '#c9b27a',
            drop: 'diya',
        },
    },
    {
        occasion: 'birthday',
        culture: 'universal',
        lang: 'en',
        look: {
            beads: ['#e8780c', '#c39a4e', '#b8324f', '#f3c4c9', '#5f8f4e'],
            stroke: '#7a5a12',
            bead: 'flag',
            accent: 'none',
            drop: 'star',
            glints: true,
        },
    },
    {
        occasion: 'retirement',
        culture: 'universal',
        lang: 'en',
        look: GOLD_CHAIN,
    },
    {
        occasion: 'puja',
        culture: 'hindu',
        greeting: 'shree-ganeshay-namah',
        lang: 'hi',
        look: {
            ...MARIGOLD,
            drop: 'diya',
        },
    },
    {
        occasion: 'upanayan',
        culture: 'hindu',
        lang: 'hi',
        look: {
            ...MARIGOLD,
            beads: ['#f6a10a', '#fbf3e4'],
        },
    },
    {
        occasion: 'mundan',
        culture: 'hindu',
        lang: 'hi',
        look: {
            ...MARIGOLD,
            accent: 'leaf',
        },
    },
    {
        occasion: 'demise_notice',
        culture: 'hindu',
        greeting: 'shraddhanjali',
        lang: 'hi',
        look: {
            ...TUBEROSE,
            drop: 'diya',
        },
    },
    {
        occasion: 'prayer_meet',
        culture: 'islamic',
        greeting: 'inna-lillahi',
        lang: 'ar',
        look: {
            ...TUBEROSE,
            bead: 'chain',
            accent: 'none',
            drop: 'lantern',
        },
    },
    {
        occasion: 'death_anniversary',
        culture: 'christian',
        greeting: 'blessed-mourn',
        lang: 'en',
        look: {
            ...TUBEROSE,
            bead: 'rose',
            drop: 'lantern',
        },
    },
    // Jewish mourning keeps flowers away: a plain cord and olive leaves only.
    {
        occasion: 'demise_notice',
        culture: 'jewish',
        greeting: 'baruch-dayan-haemet',
        lang: 'he',
        look: {
            ...TUBEROSE,
            beads: ['#c9c1b0'],
            bead: 'chain',
            accent: 'olive',
            drop: 'none',
        },
    },
    {
        occasion: 'corporate',
        culture: 'universal',
        lang: 'en',
        look: {
            ...GOLD_CHAIN,
            glints: false,
        },
    },
];

// Lead with the visitor's own celebrations; everything else (their remembrance slides included) keeps
// its usual place, so a solemn notice never comes up in the first few turns.
function orderFor(lead: readonly CultureId[]): Slide[] {
    if (!lead.length) return SLIDES;
    const first = lead.flatMap((c) => SLIDES.filter((s) => s.culture === c && !s.look.calm));
    return [...first, ...SLIDES.filter((s) => !first.includes(s))];
}

const noSubscribe = () => () => undefined;

// The panel-wide motif for each moment.
function sceneOf({ occasion, culture }: Slide): SceneId {
    switch (occasion) {
        case 'wedding':
            return culture === 'islamic'
                ? 'crescent'
                : culture === 'hindu'
                  ? 'om-swastik'
                  : 'rings';
        case 'naming':
            return culture === 'islamic' ? 'crescent' : 'bubbles';
        case 'engagement':
            return 'rings';
        case 'anniversary':
            return 'hearts';
        case 'baby_shower':
            return 'bubbles';
        case 'birthday':
            return 'balloons';
        case 'retirement':
            return 'sun';
        case 'puja':
            return 'diya';
        case 'griha_pravesh':
        case 'upanayan':
        case 'mundan':
            return 'rangoli';
        // Jewish mourning keeps flowers away: a memorial candle instead of a rose.
        case 'demise_notice':
        case 'death_anniversary':
            return culture === 'jewish' ? 'candle' : 'rose';
        case 'corporate':
            return 'handshake';
        default:
            return 'motes';
    }
}

const RTL = new Set(['ar', 'ur', 'he']);
type Texts = Record<string, string | undefined> | undefined;

function wordsOf(s: Slide) {
    const occasion = occasions[s.occasion];
    const g = s.greeting
        ? cultures[s.culture].greetings.find((x) => x.key === s.greeting)
        : undefined;
    const text = (g?.text ?? occasion.name) as Texts;
    const own = text?.[s.lang];
    const native = own ?? text?.en ?? '';
    const latin = g?.transliteration ?? text?.en;
    const occasionName = (occasion.name as Texts)?.en ?? s.occasion;
    return {
        native,
        lang: own ? s.lang : 'en',
        dir: own && RTL.has(s.lang) ? 'rtl' : 'ltr',
        // Skip the Latin line when it would only repeat the greeting.
        latin: latin && latin !== native ? latin : undefined,
        meaning: g?.meaning ?? (occasion.starter.closing as Texts)?.en ?? '',
        label:
            s.culture === 'universal'
                ? `Every tradition · ${occasionName}`
                : `${cultures[s.culture].name.en} · ${occasionName}`,
    };
}

// ---- Geometry ----------------------------------------------------------------------------------

const W = 800;
const MID = W / 2;
const BAND = 16;
const ANCHORS = [0, 160, 320, 480, 640, 800];
const sagOf = (i: number) => 34 + (i % 2) * 6;

// Point on the festoon hung between anchors a and b.
function swagPoint(a: number, b: number, t: number, sag: number): [number, number] {
    const x = (1 - t) ** 2 * a + 2 * (1 - t) * t * ((a + b) / 2) + t ** 2 * b;
    return [x, BAND + 4 * (1 - t) * t * sag];
}

const festoon = (from: number, to: number) => {
    const pts: [number, number][] = [];
    ANCHORS.slice(0, -1).forEach((a, i) => {
        const b = ANCHORS[i + 1] ?? W;
        for (let k = 0; k <= 24; k++) pts.push(swagPoint(a, b, k / 24, sagOf(i)));
    });
    const half = pts.filter(([x]) => (from < to ? x >= from && x <= to : x <= from && x >= to));
    if (from > to) half.reverse();
    return half.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
};
// Drawn as two halves from the centre outward.
const CORD_RIGHT = festoon(MID, W);
const CORD_LEFT = festoon(MID, 0);

const LEAVES = Array.from({ length: 40 }, (_, i) => 10 + i * 20).filter(
    (x) => !ANCHORS.some((a) => Math.abs(a - x) < 12),
);
const GLINTS = [
    [92, 46],
    [214, 52],
    [287, 70],
    [372, 52],
    [452, 88],
    [540, 50],
    [616, 98],
    [700, 48],
    [128, 92],
] as const;

// ---- Motion ------------------------------------------------------------------------------------

const REDUCE = '(prefers-reduced-motion: reduce)';
const subscribeReduce = (cb: () => void) => {
    const mq = window.matchMedia(REDUCE);
    mq.addEventListener('change', cb);
    return () => {
        mq.removeEventListener('change', cb);
    };
};
const useReducedMotion = () =>
    useSyncExternalStore(
        subscribeReduce,
        () => window.matchMedia(REDUCE).matches,
        () => false,
    );

interface Motion {
    reduced: boolean;
    calm: boolean;
}

// How long the cord takes to reach the panel's edge, and when it passes x.
const cordTime = (m: Motion) => (m.calm ? 1.8 : 0.9);
const reach = (x: number, m: Motion) => 0.15 + (Math.abs(x - MID) / MID) * cordTime(m);

const play = (m: Motion, animation: string, origin = '50% 50%'): CSSProperties =>
    m.reduced
        ? {}
        : {
              animation,
              transformBox: 'fill-box',
              transformOrigin: origin,
          };

const popIn = (m: Motion, delay: number) =>
    play(
        m,
        m.calm
            ? `bead-fade 900ms ease-out ${String(delay)}s both`
            : `bead-pop 420ms cubic-bezier(0.3,1.5,0.5,1) ${String(delay)}s both`,
    );

// Swing in, settle, then (for drops) breathe very slowly.
const swingIn = (m: Motion, delay: number, breathe: boolean) =>
    play(
        m,
        [
            `drop-settle ${m.calm ? '1.8s' : '1.1s'} ease-out ${String(delay)}s both`,
            breathe
                ? `drop-breathe ${m.calm ? '9s' : '6s'} ease-in-out ${String(delay + 1.2)}s infinite`
                : '',
        ]
            .filter(Boolean)
            .join(', '),
        '50% 0%',
    );

// ---- Pieces ------------------------------------------------------------------------------------

interface BeadProps {
    x: number;
    y: number;
    k: number;
    look: Look;
    kind?: Bead;
    r?: number;
}

function BeadShape({ x, y, k, look, kind = look.bead, r = 6 }: BeadProps) {
    const fill = look.beads[k % look.beads.length];
    switch (kind) {
        case 'chain':
            return <circle cx={x} cy={y} r={r * 0.45} fill={fill} />;
        case 'pearl':
            return (
                <g>
                    <circle
                        cx={x}
                        cy={y}
                        r={r * 0.8}
                        fill={fill}
                        stroke={look.stroke}
                        strokeWidth="0.4"
                    />
                    <circle
                        cx={x - r * 0.25}
                        cy={y - r * 0.25}
                        r={r * 0.22}
                        fill="#fff"
                        opacity="0.8"
                    />
                </g>
            );
        case 'flag':
            return (
                <path
                    d={`M${String(x - 7)} ${String(y - 3)} H${String(x + 7)} L${String(x)} ${String(y + 10)} Z`}
                    fill={fill}
                    opacity="0.95"
                />
            );
        case 'rose':
            return (
                <g>
                    <circle
                        cx={x}
                        cy={y}
                        r={r}
                        fill={fill}
                        stroke={look.stroke}
                        strokeWidth="0.6"
                    />
                    <circle cx={x} cy={y} r={r * 0.45} fill={look.stroke} opacity="0.55" />
                </g>
            );
        default:
            return (
                <circle cx={x} cy={y} r={r} fill={fill} stroke={look.stroke} strokeWidth="0.5" />
            );
    }
}

function AccentShape({ x, accent }: { x: number; accent: Accent }) {
    if (accent === 'none') return null;
    if (accent === 'star')
        return (
            <g>
                <path d={`M${String(x)} ${String(BAND)} V26`} stroke="#d9b25f" strokeWidth="0.6" />
                <path
                    d={`M${String(x)} 25 l2 4.6 5 .5 -3.8 3.3 1.2 4.9 -4.4 -2.7 -4.4 2.7 1.2 -4.9 -3.8 -3.3 5 -.5 Z`}
                    fill="#e9d29a"
                />
            </g>
        );
    const [fill, stroke, len] =
        accent === 'olive'
            ? ['#7d8f5a', '#4f5d36', 18]
            : accent === 'leaf'
              ? ['#5f8f4e', '#3d6331', 20]
              : ['#3f7d2e', '#244f19', 26];
    return (
        <g>
            <path
                d={`M${String(x)} ${String(BAND)} q-6 ${String(len * 0.4)} 0 ${String(len)} q6 -${String(len * 0.6)} 0 -${String(len)} Z`}
                fill={fill}
                stroke={stroke}
                strokeWidth="0.6"
            />
            <path
                d={`M${String(x)} ${String(BAND + 2)} V${String(BAND + len - 3)}`}
                stroke="#c39a4e"
                strokeWidth="0.4"
                opacity="0.6"
            />
        </g>
    );
}

function Flame({ x, y, m }: { x: number; y: number; m: Motion }) {
    return (
        <g>
            <circle cx={x} cy={y - 3} r="13" fill="url(#crown-glow)" />
            <g
                style={play(
                    m,
                    `flame-flicker ${m.calm ? '2.4s' : '1.4s'} ease-in-out infinite`,
                    '50% 100%',
                )}
            >
                <path
                    d={`M${String(x)} ${String(y)} q-4.5 -4 0 -11 q4.5 7 0 11 Z`}
                    fill="#ffb53d"
                />
                <path d={`M${String(x)} ${String(y)} q-2 -2.5 0 -6 q2 3.5 0 6 Z`} fill="#fff2c2" />
            </g>
        </g>
    );
}

function DropShape({ x, y, look, m }: { x: number; y: number; look: Look; m: Motion }) {
    switch (look.drop) {
        case 'none':
            return null;
        case 'lantern':
            return (
                <g>
                    <path d={`M${String(x - 3)} ${String(y)} h6 l1.6 3 h-9.2 Z`} fill="#d9b25f" />
                    <path
                        d={`M${String(x - 5.5)} ${String(y + 3)} h11 l2.6 10 -2.6 9 h-11 l-2.6 -9 Z`}
                        fill={look.calm ? '#f4efe4' : '#ffe6a3'}
                        fillOpacity="0.85"
                        stroke="#d9b25f"
                        strokeWidth="1"
                    />
                    <Flame x={x} y={y + 17} m={m} />
                    <circle cx={x} cy={y + 25} r="1.5" fill="#d9b25f" />
                </g>
            );
        case 'diya':
            return (
                <g>
                    <path
                        d={`M${String(x - 9)} ${String(y + 8)} q9 9 18 0 Z`}
                        fill="#b5652b"
                        stroke="#7a3f16"
                        strokeWidth="0.6"
                    />
                    <path
                        d={`M${String(x - 9)} ${String(y + 8)} h18`}
                        stroke="#d9b25f"
                        strokeWidth="1"
                    />
                    <Flame x={x} y={y + 7} m={m} />
                </g>
            );
        case 'rose':
        case 'bud': {
            const big = look.drop === 'rose';
            return (
                <g>
                    <circle
                        cx={x}
                        cy={y + 4}
                        r={big ? 7 : 5}
                        fill={look.beads[0]}
                        stroke={look.stroke}
                        strokeWidth="0.7"
                    />
                    <circle cx={x} cy={y + 4} r={big ? 3.2 : 2} fill={look.stroke} opacity="0.6" />
                </g>
            );
        }
        case 'star':
            return (
                <path
                    d={`M${String(x)} ${String(y - 1)} l2.6 6 6.5 .6 -4.9 4.3 1.5 6.4 -5.7 -3.4 -5.7 3.4 1.5 -6.4 -4.9 -4.3 6.5 -.6 Z`}
                    fill="#e9c46a"
                    stroke="#a07a2c"
                    strokeWidth="0.5"
                />
            );
        case 'diamond':
            return (
                <g>
                    <path
                        d={`M${String(x)} ${String(y)} l6 9 -6 10 -6 -10 Z`}
                        fill="#d9b25f"
                        stroke="#8a6a24"
                        strokeWidth="0.6"
                    />
                    <path
                        d={`M${String(x)} ${String(y)} l-6 9 h12 Z`}
                        fill="#f1e4c0"
                        opacity="0.55"
                    />
                </g>
            );
        default:
            return (
                <g>
                    <path
                        d={`M${String(x - 5)} ${String(y + 9)} q0 -11 5 -11 q5 0 5 11 Z`}
                        fill="#d9b25f"
                        stroke="#8a6a24"
                        strokeWidth="0.6"
                    />
                    <circle cx={x} cy={y + 11} r="1.6" fill="#8a6a24" />
                </g>
            );
    }
}

// Everything that hangs from the band for one slide.
function Hangings({ look, leaving, reduced }: { look: Look; leaving: boolean; reduced: boolean }) {
    const m: Motion = {
        reduced,
        calm: Boolean(look.calm),
    };
    const perSwag = look.bead === 'chain' ? 32 : look.bead === 'flag' ? 9 : 15;
    const cord = look.bead === 'chain' ? (look.beads[0] ?? '#d9b25f') : '#7a5a12';
    const draw = (delay: number, dur: number): CSSProperties =>
        reduced
            ? {}
            : {
                  strokeDasharray: 1,
                  animation: `cord-draw ${String(dur)}s ease-out ${String(delay)}s both`,
              };

    return (
        <g
            style={
                leaving && !reduced ? { animation: 'crown-out 500ms ease-in forwards' } : undefined
            }
        >
            {LEAVES.map((x) => (
                <g key={x} style={swingIn(m, reach(x, m) * 0.8, false)}>
                    <AccentShape x={x} accent={look.accent} />
                </g>
            ))}

            {[CORD_LEFT, CORD_RIGHT].map((d, side) => (
                <path
                    key={side}
                    d={d}
                    pathLength={1}
                    fill="none"
                    stroke={cord}
                    strokeWidth="1.2"
                    style={draw(0.15, cordTime(m))}
                />
            ))}
            {ANCHORS.slice(0, -1).map((a, i) => {
                const b = ANCHORS[i + 1] ?? W;
                return Array.from({ length: perSwag }, (_, k) => {
                    const [x, y] = swagPoint(a, b, (k + 0.5) / perSwag, sagOf(i));
                    return (
                        <g key={`${String(a)}-${String(k)}`} style={popIn(m, reach(x, m))}>
                            <BeadShape x={x} y={y} k={k + i} look={look} />
                        </g>
                    );
                });
            })}

            {ANCHORS.map((x, i) => {
                const beads = i % 2 ? 6 : 8;
                const end = 22 + beads * 11;
                const start = reach(x, m) + 0.1;
                const step = m.calm ? 0.12 : 0.06;
                return (
                    <g key={x}>
                        <path
                            d={`M${String(x)} ${String(BAND)} V${String(end)}`}
                            pathLength={1}
                            stroke={cord}
                            strokeWidth="0.8"
                            style={draw(start, beads * step)}
                        />
                        {Array.from({ length: beads }, (_, k) => (
                            <g key={k} style={popIn(m, start + k * step)}>
                                <BeadShape
                                    x={x}
                                    y={24 + k * 11}
                                    k={k}
                                    look={look}
                                    kind={look.bead === 'flag' ? 'pearl' : look.bead}
                                    r={5.6}
                                />
                            </g>
                        ))}
                        <g style={swingIn(m, start + beads * step, true)}>
                            <DropShape x={x} y={end} look={look} m={m} />
                        </g>
                    </g>
                );
            })}

            {look.glints &&
                !look.calm &&
                !reduced &&
                GLINTS.map(([x, y], k) => (
                    <path
                        key={k}
                        d={`M${String(x)} ${String(y - 5)} L${String(x + 1.2)} ${String(y - 1.2)} L${String(x + 5)} ${String(y)} L${String(x + 1.2)} ${String(y + 1.2)} L${String(x)} ${String(y + 5)} L${String(x - 1.2)} ${String(y + 1.2)} L${String(x - 5)} ${String(y)} L${String(x - 1.2)} ${String(y - 1.2)} Z`}
                        fill="#fff6dc"
                        style={{
                            opacity: 0,
                            transformBox: 'fill-box',
                            transformOrigin: '50% 50%',
                            animation: `glint 2.6s ease-in-out ${String(1.4 + ((k * 0.73) % 2.6))}s infinite`,
                        }}
                    />
                ))}
        </g>
    );
}

// ---- Crown -------------------------------------------------------------------------------------

const TURN_MS = 5500;

export function LoginCrown({
    className,
    compact = false,
    country,
}: {
    className?: string;
    compact?: boolean;
    // Visitor's country from the request (Cloudflare); null when the host doesn't say.
    country?: string | null;
}) {
    const reduced = useReducedMotion();
    // Which traditions lead: the request's country when known, else the device's time zone. The time
    // zone is browser-only, so the server renders "not decided yet" and the crown strings itself
    // only once the order is settled; no wrong garland ever flashes.
    const fromDevice = useSyncExternalStore(
        noSubscribe,
        () => browserCultures().join(','),
        () => null,
    );
    const lead = country ? culturesForCountry(country).join(',') : fromDevice;
    const ready = lead !== null;
    const slides = useMemo(() => orderFor(lead ? (lead.split(',') as CultureId[]) : []), [lead]);
    const [{ i, prev }, setTurn] = useState<{ i: number; prev: number | null }>({
        i: 0,
        prev: null,
    });
    const go = (to: number) => {
        setTurn((s) => {
            const n = (to + slides.length) % slides.length;
            return n === s.i
                ? s
                : {
                      i: n,
                      prev: s.i,
                  };
        });
    };
    // Swipe (finger or mouse drag): left for the next slide, right for the previous; the text follows
    // the pointer while dragging. Vertical drags are left to the page so phones still scroll.
    const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
    const [dx, setDx] = useState(0);
    const SWIPE = 50;
    const onDown = (e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        drag.current = {
            x: e.clientX,
            y: e.clientY,
            moved: false,
        };
    };
    const onMove = (e: PointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        if (!d) return;
        const x = e.clientX - d.x;
        if (!d.moved) {
            if (Math.abs(x) < 8 || Math.abs(x) < Math.abs(e.clientY - d.y)) return;
            // Only now take the pointer, so taps on the arrows and dots still click normally.
            d.moved = true;
            e.currentTarget.setPointerCapture(e.pointerId);
        }
        setDx(x);
    };
    const onUp = (e: PointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        drag.current = null;
        setDx(0);
        if (!d?.moved) return;
        const x = e.clientX - d.x;
        if (Math.abs(x) < SWIPE) return;
        const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
        go(i + (x < 0 !== rtl ? 1 : -1));
    };
    const onCancel = () => {
        drag.current = null;
        setDx(0);
    };

    // Turn on a timer that restarts whenever the slide changes, so a picked slide gets its full turn.
    useEffect(() => {
        const t = setTimeout(() => {
            setTurn((s) => ({
                i: (s.i + 1) % slides.length,
                prev: s.i,
            }));
        }, TURN_MS);
        return () => {
            clearTimeout(t);
        };
    }, [i, slides.length]);
    // Let the outgoing toran fade while the new one strings itself, then drop it.
    useEffect(() => {
        if (prev === null) return;
        const t = setTimeout(() => {
            setTurn((s) => ({
                ...s,
                prev: null,
            }));
        }, 550);
        return () => {
            clearTimeout(t);
        };
    }, [prev]);

    const slide = slides[i] ?? slides[0];
    const out = prev === null ? undefined : slides[prev];
    if (!slide) return null;
    const words = wordsOf(slide);
    const calm = Boolean(slide.look.calm);

    return (
        <div
            className={cn('touch-pan-y select-none', className)}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onCancel}
        >
            {/* Makes the whole panel a swipe surface, not just the text. */}
            <div className="absolute inset-0 touch-pan-y" />
            {ready && (
                <LoginScene
                    key={`scene-${lead}-${String(i)}`}
                    id={sceneOf(slide)}
                    compact={compact}
                />
            )}
            <svg
                viewBox={`0 0 ${String(W)} 140`}
                preserveAspectRatio="xMidYMin slice"
                className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 w-full overflow-visible',
                    compact ? 'h-26' : 'h-36',
                )}
                aria-hidden
            >
                <defs>
                    <radialGradient id="crown-glow">
                        <stop offset="0" stopColor="#ffcf6b" stopOpacity="0.55" />
                        <stop offset="1" stopColor="#ffcf6b" stopOpacity="0" />
                    </radialGradient>
                </defs>
                {ready && out && (
                    <Hangings
                        key={`out-${String(prev)}`}
                        look={out.look}
                        leaving
                        reduced={reduced}
                    />
                )}
                {ready && (
                    <Hangings
                        key={`${lead}-${String(i)}`}
                        look={slide.look}
                        leaving={false}
                        reduced={reduced}
                    />
                )}
                {/* Embroidered band with mirror-work, drawn last so strands tuck under it. */}
                <rect x="0" y="0" width={W} height={BAND} fill="#5b1424" />
                <path
                    d={`M0 2.5 H${String(W)} M0 13.5 H${String(W)}`}
                    stroke="#c39a4e"
                    strokeWidth="1"
                />
                {Array.from({ length: 40 }, (_, k) => (
                    <circle key={k} cx={10 + k * 20} cy="8" r="2.2" fill="#e9d29a" opacity="0.85" />
                ))}
            </svg>

            <div
                className={cn(
                    'relative space-y-3',
                    !ready && 'invisible',
                    compact ? 'mt-30' : 'mt-32',
                    dx === 0 && 'transition-[translate,opacity] duration-300 ease-out',
                )}
                style={{
                    translate: `${String(dx * 0.45)}px 0`,
                    opacity: 1 - Math.min(Math.abs(dx) / 400, 0.5),
                }}
            >
                <div className="flex items-center gap-3 text-gold-bright/80">
                    <span className="h-px w-8 bg-current" />
                    <span
                        key={`${String(lead)}-${String(i)}`}
                        className="animate-[fade-in_700ms_ease-out] text-[10px] tracking-[0.35em] uppercase motion-reduce:animate-none"
                    >
                        {words.label}
                    </span>
                </div>
                <div
                    key={`${String(lead)}-${String(i)}`}
                    className={cn(
                        'motion-reduce:animate-none',
                        compact ? 'min-h-20' : 'min-h-24',
                        calm
                            ? 'animate-[fade-in_1400ms_ease-out_both]'
                            : 'animate-[blessing-in_900ms_ease-out_both]',
                    )}
                >
                    <p
                        dir={words.dir}
                        lang={words.lang}
                        className={cn(
                            'w-fit font-display leading-snug text-balance',
                            calm
                                ? 'text-ivory/90'
                                : 'bg-[linear-gradient(100deg,var(--color-gold-bright)_42%,#fff6dc_50%,var(--color-gold-bright)_58%)] bg-size-[260%_100%] bg-clip-text text-transparent motion-safe:animate-[gold-sweep_1.8s_ease-out_0.5s_both]',
                            words.native.length > 24
                                ? compact
                                    ? 'text-xl'
                                    : 'text-2xl'
                                : compact
                                  ? 'text-3xl'
                                  : 'text-4xl',
                        )}
                    >
                        {words.native}
                    </p>
                    <p
                        className={cn(
                            'font-display text-ivory/60 italic',
                            compact ? 'text-base' : 'text-lg',
                        )}
                    >
                        {words.latin && (
                            <span className="text-ivory/80 not-italic">{words.latin} · </span>
                        )}
                        {words.meaning}
                    </p>
                </div>
                <div className="-ms-2 flex items-center gap-1">
                    <button
                        type="button"
                        aria-label="Previous occasion"
                        onClick={() => {
                            go(i - 1);
                        }}
                        className="grid size-7 place-items-center rounded-full text-ivory/60 transition hover:bg-ivory/10 hover:text-ivory focus-visible:ring-2 focus-visible:ring-gold-bright/60 focus-visible:outline-none"
                    >
                        <ChevronLeft className="size-4 rtl:rotate-180" />
                    </button>
                    <div className="flex items-center">
                        {slides.map((s, k) => (
                            <button
                                key={`${s.occasion}-${s.culture}`}
                                type="button"
                                aria-label={wordsOf(s).label}
                                aria-current={k === i}
                                onClick={() => {
                                    go(k);
                                }}
                                className="group grid h-5 place-items-center px-0.5"
                            >
                                <span
                                    className={cn(
                                        'block h-1 rounded-full transition-all duration-500 group-hover:opacity-80',
                                        s.look.calm ? 'bg-ivory' : 'bg-gold-bright',
                                        k === i ? 'w-5 opacity-90' : 'w-1 opacity-30',
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        aria-label="Next occasion"
                        onClick={() => {
                            go(i + 1);
                        }}
                        className="grid size-7 place-items-center rounded-full text-ivory/60 transition hover:bg-ivory/10 hover:text-ivory focus-visible:ring-2 focus-visible:ring-gold-bright/60 focus-visible:outline-none"
                    >
                        <ChevronRight className="size-4 rtl:rotate-180" />
                    </button>
                </div>
            </div>
        </div>
    );
}
