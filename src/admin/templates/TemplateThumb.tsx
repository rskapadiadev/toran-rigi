// A small "printed card" built from the template's own palette and display font.
import { fontStack } from '@shared/fonts';
import type { InvitationDesign } from '@shared/types';

import { cn } from '@/lib/utils';

interface TemplateThumbProps {
    design: InvitationDesign;
    name: string;
    caption?: string;
    className?: string;
}

export function TemplateThumb({ design, name, caption, className }: TemplateThumbProps) {
    const p = design.palette;
    return (
        <div
            className={cn('relative flex items-center justify-center overflow-hidden', className)}
            style={{ background: `radial-gradient(120% 90% at 50% 0%, ${p.surface}, ${p.bg})` }}
        >
            {/* Arch frame in the theme's gold, like the cover of a printed card. */}
            <svg
                viewBox="0 0 100 120"
                className="absolute inset-x-[18%] top-[10%] bottom-[10%] h-[80%] w-[64%]"
                aria-hidden
            >
                <path
                    d="M6 118 V44 A44 44 0 0 1 94 44 V118"
                    fill="none"
                    stroke={p.gold}
                    strokeWidth="1.2"
                />
                <path
                    d="M12 118 V46 A38 38 0 0 1 88 46 V118"
                    fill="none"
                    stroke={p.gold}
                    strokeOpacity="0.45"
                    strokeWidth="0.6"
                />
                <circle cx="50" cy="22" r="2.2" fill={p.primary} />
            </svg>
            <div className="relative px-6 text-center">
                <p
                    className="text-[clamp(15px,2.2vw,20px)] leading-tight"
                    style={{
                        color: p.ink,
                        fontFamily: fontStack(design.fonts.display),
                    }}
                >
                    {name}
                </p>
                {caption && (
                    <p
                        className="mt-1 text-[10px] tracking-[0.2em] uppercase"
                        style={{ color: p.muted }}
                    >
                        {caption}
                    </p>
                )}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex h-1.5">
                {[p.primary, p.accent, p.gold].map((c, i) => (
                    <span key={`${c}-${String(i)}`} className="flex-1" style={{ background: c }} />
                ))}
            </div>
        </div>
    );
}
