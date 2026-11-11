import type { InvitationDesign } from '@shared/types';
import type { ComponentType } from 'react';

import { BloomOpening } from './BloomOpening';
import { ChuppahOpening } from './ChuppahOpening';
import { CurtainOpening } from './CurtainOpening';
import { DiyaOpening } from './DiyaOpening';
import { DoorsOpening } from './DoorsOpening';
import { EnvelopeOpening } from './EnvelopeOpening';
import { LanternOpening } from './LanternOpening';
import type { OpeningProps } from './types';

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
};

export function Opening({ kind, ...props }: OpeningProps & { kind: InvitationDesign['opening'] }) {
    const Component = registry[kind];
    return <Component {...props} />;
}
