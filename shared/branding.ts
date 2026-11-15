// The small "Created with Toran" mark at the foot of every invitation. Each style is a different
// look for the same quiet credit; guests who tap it land on the studio's site.
export const brandingStyles = ['line', 'seal', 'pill', 'signature', 'stamp'] as const;
export type BrandingStyle = (typeof brandingStyles)[number];

export const DEFAULT_BRANDING: BrandingStyle = 'line';

interface BrandingInfo {
    label: string;
    hint: string;
}

export const brandingInfo: Record<BrandingStyle, BrandingInfo> = {
    line: {
        label: 'Quiet line',
        hint: 'The turning Toran seal and one small line: “Created with Toran · by TheRigi”',
    },
    seal: {
        label: 'Gold seal',
        hint: 'A larger turning seal in gold beside the credit',
    },
    pill: {
        label: 'Glass pill',
        hint: 'A frosted pill that floats above the page',
    },
    signature: {
        label: 'Signature',
        hint: 'Toran written in script, “by TheRigi” beneath',
    },
    stamp: {
        label: 'Embossed stamp',
        hint: 'A small round stamp with the seal turning faintly behind it',
    },
};

// Where the mark leads: the studio's landing page, tagged so we know an invitation sent the visit.
export const brandingHref = (slug: string) =>
    `/?utm_source=invitation&utm_medium=footer&utm_campaign=${encodeURIComponent(slug)}`;
