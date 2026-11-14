import { useId } from 'react';

import { cn } from '@/lib/utils';

// Five-point star centred on (cx, cy).
function star(cx: number, cy: number, outer: number, inner: number): string {
    const points = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 ? inner : outer;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    });
    return `M${points.join(' L')} Z`;
}

// Point on the ring at `deg` (0° = right, 90° = bottom, as on screen).
const onRing = (deg: number, r = 74): [number, number] => {
    const a = (deg * Math.PI) / 180;
    return [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
};

// Ring stars flank RIGI along the lower arc, as on the original stamp.
const ringStars = [18, 40, 140, 162].map((deg) => onRing(deg));

interface ToranSealProps {
    className?: string;
    // Small sizes (sidebar, buttons) drop the lettering, which would be illegible anyway.
    compact?: boolean;
    title?: string;
}

// The Toran stamp: double ring, TORAN arched over the top, RIGI along the bottom, star at the heart.
// Drawn in currentColor so it reads in gold on dark surfaces and in ink on light ones.
export function ToranSeal({ className, compact = false, title = 'Toran by Rigi' }: ToranSealProps) {
    const id = useId().replace(/:/g, '');
    return (
        <svg
            viewBox="0 0 200 200"
            className={cn('shrink-0', className)}
            role="img"
            aria-label={title}
            fill="currentColor"
        >
            <title>{title}</title>
            <defs>
                {/* Top text runs clockwise over the crown; bottom text runs along the base, upright. */}
                <path id={`${id}-top`} d="M44 100 A56 56 0 0 1 156 100" />
                <path id={`${id}-bottom`} d="M24 100 A76 76 0 0 0 176 100" />
            </defs>
            <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="6" />
            <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <circle
                cx="100"
                cy="100"
                r={compact ? 52 : 42}
                fill="none"
                stroke="currentColor"
                strokeWidth={compact ? 5 : 3.5}
            />
            <path d={compact ? star(100, 102, 34, 14) : star(100, 102, 28, 11.5)} />
            {!compact && (
                <>
                    <text
                        fontFamily="'Fraunces Variable', Fraunces, Georgia, serif"
                        fontWeight="800"
                        fontSize="27"
                        letterSpacing="4"
                    >
                        <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">
                            TORAN
                        </textPath>
                    </text>
                    <text
                        fontFamily="'Fraunces Variable', Fraunces, Georgia, serif"
                        fontWeight="800"
                        fontSize="19"
                        letterSpacing="7"
                    >
                        <textPath href={`#${id}-bottom`} startOffset="50%" textAnchor="middle">
                            RIGI
                        </textPath>
                    </text>
                    {ringStars.map(([x, y]) => (
                        <path
                            key={`${x.toFixed(1)}-${y.toFixed(1)}`}
                            d={star(x, y - 2, 6.5, 2.7)}
                        />
                    ))}
                    {[0, 180].map((deg) => {
                        const [x, y] = onRing(deg);
                        return <circle key={deg} cx={x} cy={y} r="2.6" />;
                    })}
                </>
            )}
        </svg>
    );
}
