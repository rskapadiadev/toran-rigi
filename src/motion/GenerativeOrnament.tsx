import { generateOrnament, type GenerativeKind, type StrokeRole } from '@shared/generative';
import { useMemo } from 'react';

const roleColor: Record<StrokeRole, string> = {
    gold: 'var(--inv-gold)',
    primary: 'var(--inv-primary)',
    accent: 'var(--inv-accent)',
    ink: 'var(--inv-ink)',
};

interface GenerativeOrnamentProps {
    kind: GenerativeKind;
    seed: number;
    className?: string;
    draw?: boolean;
    duration?: number;
    spin?: boolean;
    label?: string;
}

// Each couple's unique medallion; drawing is pure CSS (pathLength=1 + dashoffset), no JS animation cost.
export function GenerativeOrnament({
    kind,
    seed,
    className = '',
    draw = true,
    duration = 2600,
    spin = false,
    label,
}: GenerativeOrnamentProps) {
    const ornament = useMemo(() => generateOrnament(kind, seed), [kind, seed]);
    const step = duration / Math.max(1, ornament.layers + 1);
    return (
        <svg
            viewBox={`0 0 ${ornament.size} ${ornament.size}`}
            className={`${className} ${spin ? 'animate-[spin_120s_linear_infinite]' : ''}`}
            role={label ? 'img' : 'presentation'}
            aria-label={label}
            aria-hidden={label ? undefined : true}
        >
            {ornament.paths.map((p, i) => (
                <path
                    key={i}
                    d={p.d}
                    pathLength={1}
                    fill={p.fill ? roleColor[p.role] : 'none'}
                    stroke={p.fill ? 'none' : roleColor[p.role]}
                    strokeWidth={p.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={draw ? 'ornament-draw' : ''}
                    style={{
                        animationDelay: `${p.layer * step}ms`,
                        animationDuration: `${step * 2.2}ms`,
                    }}
                />
            ))}
        </svg>
    );
}
