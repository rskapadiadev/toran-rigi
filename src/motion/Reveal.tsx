import type { EnterPreset } from '@shared/types';
import { m, type TargetAndTransition, type Transition } from 'motion/react';
import { createContext, type ReactNode, use, useRef } from 'react';

import type { MotionTier } from './capability';
import { useEntrance } from './stage';
import { TypeReveal, type TypingKind } from './TypeReveal';

export { StageContext, useEntrance } from './stage';

interface EnterSettings {
    preset: EnterPreset;
    tier: MotionTier;
    rtl: boolean;
}

// Each block tells its children how to enter; sections never hard-code an animation.
export const EnterContext = createContext<EnterSettings>({
    preset: 'rise',
    tier: 'full',
    rtl: false,
});

interface Pose {
    hidden: TargetAndTransition;
    shown: TargetAndTransition;
    transition: Transition;
}

const silk: Transition = {
    duration: 1.1,
    ease: [0.22, 1, 0.36, 1],
};

function pose(preset: EnterPreset, rtl: boolean): Pose {
    switch (preset) {
        case 'rise':
            return {
                hidden: {
                    opacity: 0,
                    y: 42,
                    filter: 'blur(8px)',
                },
                shown: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                },
                transition: silk,
            };
        case 'curtain':
            return {
                hidden: {
                    opacity: 0.2,
                    clipPath: 'inset(0% 47% 0% 47%)',
                },
                shown: {
                    opacity: 1,
                    clipPath: 'inset(0% 0% 0% 0%)',
                },
                transition: {
                    duration: 1.3,
                    ease: [0.83, 0, 0.17, 1],
                },
            };
        case 'unfold':
            return {
                hidden: {
                    opacity: 0,
                    rotateX: -78,
                    transformPerspective: 900,
                    originY: 0,
                },
                shown: {
                    opacity: 1,
                    rotateX: 0,
                    transformPerspective: 900,
                    originY: 0,
                },
                transition: {
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1],
                },
            };
        case 'bloom':
            return {
                hidden: {
                    opacity: 0,
                    scale: 0.7,
                    rotate: -6,
                },
                shown: {
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                },
                transition: {
                    type: 'spring',
                    stiffness: 120,
                    damping: 14,
                    mass: 0.9,
                },
            };
        case 'ink':
            return {
                hidden: {
                    opacity: 0,
                    scale: 1.06,
                    filter: 'blur(18px)',
                },
                shown: {
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)',
                },
                transition: {
                    duration: 1.8,
                    ease: [0.25, 0.1, 0.25, 1],
                },
            };
        case 'wipe':
            return {
                hidden: {
                    clipPath: 'inset(94% 0% 0% 0%)',
                    y: 24,
                },
                shown: {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    y: 0,
                },
                transition: {
                    duration: 1.1,
                    ease: [0.65, 0, 0.35, 1],
                },
            };
        case 'drift':
            return {
                hidden: {
                    opacity: 0,
                    x: rtl ? -90 : 90,
                },
                shown: {
                    opacity: 1,
                    x: 0,
                },
                transition: silk,
            };
        case 'tilt':
            return {
                hidden: {
                    opacity: 0,
                    rotateY: rtl ? -38 : 38,
                    rotateX: 12,
                    transformPerspective: 1000,
                    y: 30,
                },
                shown: {
                    opacity: 1,
                    rotateY: 0,
                    rotateX: 0,
                    transformPerspective: 1000,
                    y: 0,
                },
                transition: {
                    duration: 1.3,
                    ease: [0.16, 1, 0.3, 1],
                },
            };
        case 'iris':
            return {
                hidden: {
                    opacity: 0.3,
                    clipPath: 'circle(0% at 50% 50%)',
                },
                // 150% of the reference radius clears every corner, however tall the block.
                shown: {
                    opacity: 1,
                    clipPath: 'circle(150% at 50% 50%)',
                },
                transition: {
                    duration: 1.4,
                    ease: [0.65, 0, 0.35, 1],
                },
            };
        case 'sweep':
            // A triangle grows from the leading top corner until it covers the block.
            return {
                hidden: {
                    clipPath: rtl
                        ? 'polygon(100% 0%, 100% 0%, 100% 0%)'
                        : 'polygon(0% 0%, 0% 0%, 0% 0%)',
                },
                shown: {
                    clipPath: rtl
                        ? 'polygon(100% 0%, -100% 0%, 100% 200%)'
                        : 'polygon(0% 0%, 200% 0%, 0% 200%)',
                },
                transition: {
                    duration: 1.3,
                    ease: [0.65, 0, 0.35, 1],
                },
            };
        case 'zoom':
            return {
                hidden: {
                    opacity: 0,
                    scale: 1.22,
                },
                shown: {
                    opacity: 1,
                    scale: 1,
                },
                transition: {
                    duration: 2,
                    ease: [0.16, 1, 0.3, 1],
                },
            };
        case 'flip':
            return {
                hidden: {
                    opacity: 0,
                    rotateY: rtl ? 90 : -90,
                    transformPerspective: 1100,
                },
                shown: {
                    opacity: 1,
                    rotateY: 0,
                    transformPerspective: 1100,
                },
                transition: {
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                },
            };
        case 'petal':
            return {
                hidden: {
                    opacity: 0,
                    y: -46,
                    x: rtl ? 14 : -14,
                    rotate: -5,
                },
                // Overshoots sideways once on the way down, the way a petal rocks as it lands.
                shown: {
                    opacity: [0, 1, 1],
                    y: [-46, -10, 0],
                    x: rtl ? [14, -8, 0] : [-14, 8, 0],
                    rotate: [-5, 3, 0],
                },
                transition: {
                    duration: 1.8,
                    ease: 'easeOut',
                    times: [0, 0.6, 1],
                },
            };
        case 'stamp':
            return {
                hidden: {
                    opacity: 0,
                    scale: 1.7,
                    rotate: -8,
                },
                shown: {
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                },
                transition: {
                    type: 'spring',
                    stiffness: 420,
                    damping: 26,
                    mass: 1,
                },
            };
        case 'drop':
            return {
                hidden: {
                    clipPath: 'inset(0% 0% 94% 0%)',
                    y: -24,
                },
                shown: {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    y: 0,
                },
                transition: {
                    duration: 1.1,
                    ease: [0.65, 0, 0.35, 1],
                },
            };
        case 'glow':
            return {
                hidden: {
                    opacity: 0,
                    filter: 'brightness(2.4) blur(6px)',
                },
                shown: {
                    opacity: 1,
                    filter: 'brightness(1) blur(0px)',
                },
                transition: {
                    duration: 2,
                    ease: [0.25, 0.1, 0.25, 1],
                },
            };
        case 'swing':
            return {
                hidden: {
                    opacity: 0,
                    rotate: rtl ? 14 : -14,
                    originY: 0,
                },
                shown: {
                    opacity: 1,
                    rotate: 0,
                    originY: 0,
                },
                transition: {
                    type: 'spring',
                    stiffness: 90,
                    damping: 7,
                    mass: 1,
                },
            };
        case 'pop':
            return {
                hidden: {
                    opacity: 0,
                    scale: 0.4,
                },
                shown: {
                    opacity: 1,
                    scale: 1,
                },
                transition: {
                    type: 'spring',
                    stiffness: 320,
                    damping: 11,
                    mass: 0.8,
                },
            };
        // Typing presets render through TypeReveal; this pose is never used, it keeps the switch total.
        case 'typewriter':
        case 'words':
        case 'quill':
            return pose('ink', rtl);
        case 'none':
            return {
                hidden: {},
                shown: {},
                transition: { duration: 0 },
            };
    }
}

const isTyping = (preset: EnterPreset): preset is TypingKind =>
    preset === 'typewriter' || preset === 'words' || preset === 'quill';

const legacy: Record<NonNullable<RevealProps['from']>, EnterPreset> = {
    up: 'rise',
    down: 'rise',
    scale: 'bloom',
    blur: 'ink',
};

interface RevealProps {
    children: ReactNode;
    className?: string;
    // Stagger inside the block, in ms.
    delay?: number;
    // Pin a calm entrance (e.g. sacred text) regardless of the block's preset.
    from?: 'up' | 'down' | 'scale' | 'blur';
    preset?: EnterPreset;
}

export function Reveal({ children, className, delay = 0, from, preset }: RevealProps) {
    const settings = use(EnterContext);
    const ref = useRef<HTMLDivElement>(null);
    const play = useEntrance(ref);
    const chosen = preset ?? (from ? legacy[from] : settings.preset);
    if (settings.tier === 'static' || chosen === 'none')
        return <div className={className}>{children}</div>;
    if (isTyping(chosen))
        return (
            <TypeReveal kind={chosen} className={className} delay={delay}>
                {children}
            </TypeReveal>
        );
    const p = pose(chosen, settings.rtl);
    return (
        <m.div
            ref={ref}
            className={className}
            initial={p.hidden}
            animate={play ? p.shown : p.hidden}
            transition={{
                ...p.transition,
                delay: delay / 1000,
            }}
        >
            {children}
        </m.div>
    );
}
