// Ceremony props: one drawing per file, registered here by the id used in shared/props.ts.
import type { CeremonyPropId } from '@shared/props';
import { propFor } from '@shared/props';
import { type ReactNode, useId } from 'react';

import { Agni } from './agni';
import { Bangles } from './bangles';
import { Bhojan } from './bhojan';
import { Cake } from './cake';
import { Chuppah } from './chuppah';
import { Cradle } from './cradle';
import { Dandiya } from './dandiya';
import { Diya } from './diya';
import { Dove } from './dove';
import { Flutes } from './flutes';
import { Ghungroo } from './ghungroo';
import { Gifts } from './gifts';
import { Haldi } from './haldi';
import { Kalash } from './kalash';
import { Kaleere } from './kaleere';
import type { Art } from './kit';
import { Lantern } from './lantern';
import { Lily } from './lily';
import { MehndiCones } from './mehndi';
import { Mic } from './mic';
import { RingBox } from './rings';
import { Safa } from './safa';
import { Thali } from './thali';
import { Varmala } from './varmala';

export { propFor };

const shadow = 'drop-shadow(0 10px 14px rgba(0,0,0,0.28))';

const drawings: Record<CeremonyPropId, (props: Art) => ReactNode> = {
    mehndi: MehndiCones,
    kalash: Kalash,
    rings: RingBox,
    ghungroo: Ghungroo,
    bangles: Bangles,
    diya: Diya,
    haldi: Haldi,
    kaleere: Kaleere,
    gifts: Gifts,
    dandiya: Dandiya,
    safa: Safa,
    varmala: Varmala,
    agni: Agni,
    flutes: Flutes,
    lantern: Lantern,
    chuppah: Chuppah,
    thali: Thali,
    bhojan: Bhojan,
    cradle: Cradle,
    cake: Cake,
    dove: Dove,
    lily: Lily,
    mic: Mic,
};

interface CeremonyPropProps {
    kind: CeremonyPropId;
    className?: string;
}

export function CeremonyProp({ kind, className }: CeremonyPropProps) {
    const id = `prop-${useId().replace(/:/g, '')}`;
    const Drawing = drawings[kind];
    return (
        <svg viewBox="0 0 120 130" className={className} style={{ filter: shadow }} aria-hidden>
            <Drawing id={id} />
        </svg>
    );
}
