import { fontStack } from '@shared/fonts';
import { paletteToCssVars } from '@shared/palette';
import type { InvitationDesign } from '@shared/types';
import type { CSSProperties } from 'react';

export function designStyle(design: InvitationDesign): CSSProperties {
    return {
        ...paletteToCssVars(design.palette),
        '--inv-display': fontStack(design.fonts.display),
        '--inv-body': fontStack(design.fonts.body),
        '--inv-script': fontStack(design.fonts.script ?? design.fonts.display),
    } as CSSProperties;
}

export const isDarkDesign = (design: InvitationDesign) => {
    const hex = design.palette.bg.replace('#', '');
    const n = Number.parseInt(hex.length === 3 ? hex.replace(/./g, '$&$&') : hex, 16);
    const lum = 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
    return lum < 110;
};
