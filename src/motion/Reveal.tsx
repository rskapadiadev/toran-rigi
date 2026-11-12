import type { EnterPreset } from '@shared/types';
import { m, type TargetAndTransition, type Transition } from 'motion/react';
import { createContext, type ReactNode, use } from 'react';

import type { MotionTier } from './capability';

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
        case 'none':
            return {
                hidden: {},
                shown: {},
                transition: { duration: 0 },
            };
    }
}

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
    const chosen = preset ?? (from ? legacy[from] : settings.preset);
    if (settings.tier === 'static' || chosen === 'none')
        return <div className={className}>{children}</div>;
    const p = pose(chosen, settings.rtl);
    return (
        <m.div
            className={className}
            initial={p.hidden}
            whileInView={p.shown}
            // 'some' and no bottom inset: clip-path presets start as a sliver (the observer measures the
            // clipped area), and a sliver at the screen's foot must still count as "in view".
            viewport={{
                once: true,
                amount: 'some',
            }}
            transition={{
                ...p.transition,
                delay: delay / 1000,
            }}
        >
            {children}
        </m.div>
    );
}
