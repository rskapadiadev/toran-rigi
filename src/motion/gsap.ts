import type { gsap as GsapType } from 'gsap';

let loading: Promise<typeof GsapType> | undefined;

// GSAP is fetched only when an opening ritual starts, keeping first paint light.
export function loadGsap(): Promise<typeof GsapType> {
    loading ??= import('gsap').then((m) => m.gsap);
    return loading;
}
