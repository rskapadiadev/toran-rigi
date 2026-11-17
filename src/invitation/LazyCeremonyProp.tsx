// The ceremony prop drawings are heavy and only Stacked arches (and the Library) show them, so they
// load in their own chunk on demand instead of with every invitation.
import type { CeremonyPropId } from '@shared/props';
import { lazy, Suspense } from 'react';

const Drawing = lazy(() => import('./props').then((mod) => ({ default: mod.CeremonyProp })));

interface Props {
    kind: CeremonyPropId;
    className?: string;
}

export function LazyCeremonyProp({ kind, className }: Props) {
    return (
        <Suspense fallback={null}>
            <Drawing kind={kind} className={className} />
        </Suspense>
    );
}
