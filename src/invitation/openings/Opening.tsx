import type { InvitationDesign } from '@shared/types';
import type { ComponentType } from 'react';

import { BloomOpening } from './BloomOpening';
import { ChuppahOpening } from './ChuppahOpening';
import { CurtainOpening } from './CurtainOpening';
import { DiyaOpening } from './DiyaOpening';
import { DoorsOpening } from './DoorsOpening';
import { EnvelopeOpening } from './EnvelopeOpening';
import { FireworksOpening } from './FireworksOpening';
import { InkOpening } from './InkOpening';
import { LanternOpening } from './LanternOpening';
import { LiquidGoldOpening } from './LiquidGoldOpening';
import { OrigamiOpening } from './OrigamiOpening';
import { ScratchOpening } from './ScratchOpening';
import type { OpeningProps } from './types';
import { WarpOpening } from './WarpOpening';

const registry: Record<InvitationDesign['opening'], ComponentType<OpeningProps>> = {
    doors: DoorsOpening,
    mashrabiya: DoorsOpening,
    'garden-arch': DoorsOpening,
    envelope: EnvelopeOpening,
    curtain: CurtainOpening,
    bandhani: BloomOpening,
    lotus: BloomOpening,
    phulkari: BloomOpening,
    stitch: BloomOpening,
    lantern: LanternOpening,
    chuppah: ChuppahOpening,
    diya: DiyaOpening,
    scratch: ScratchOpening,
    'liquid-gold': LiquidGoldOpening,
    ink: InkOpening,
    origami: OrigamiOpening,
    warp: WarpOpening,
    fireworks: FireworksOpening,
};

type Props = OpeningProps & { kind: InvitationDesign['opening'] };

// Every ritual can be skipped (returning guests, accessibility); the skip still counts as the audio gesture.
export function Opening({ kind, ...props }: Props) {
    const Component = registry[kind];
    return (
        <>
            <Component {...props} />
            {kind !== 'envelope' && (
                <button
                    type="button"
                    data-skip-opening
                    onClick={() => {
                        props.onBegin();
                        props.onOpened();
                    }}
                    className="fixed end-5 bottom-5 z-[60] rounded-full bg-black/25 px-4 py-2 text-[10px] tracking-[0.35em] text-white uppercase backdrop-blur-sm"
                >
                    Skip ›
                </button>
            )}
        </>
    );
}
