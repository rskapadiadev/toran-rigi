// AI pre-wedding portraits: the scenes on offer and the words each model is given. The words never
// carry anything about the couple but their photos; rituals, deities and sacred places are never
// drawn (see CLAUDE.md rule 6 and the cultural-respect rules).
export const portraitProviders = ['flux', 'gemini'] as const;
export type PortraitProvider = (typeof portraitProviders)[number];

interface ProviderInfo {
    label: string;
    model: string;
}

export const providerInfo: Record<PortraitProvider, ProviderInfo> = {
    flux: {
        label: 'Cloudflare FLUX.2',
        model: '@cf/black-forest-labs/flux-2-dev',
    },
    gemini: {
        label: 'Google Gemini',
        model: 'gemini-nano-banana-2.1',
    },
};

export interface PortraitScene {
    id: string;
    label: string;
    // Where they are and how it feels; the faces and bodies come from their photos.
    scene: string;
}

export const portraitScenes: PortraitScene[] = [
    {
        id: 'palace',
        label: 'Palace courtyard',
        scene: 'standing together in a sunlit Rajasthani palace courtyard with carved sandstone arches and jharokha windows, warm golden-hour light',
    },
    {
        id: 'garden',
        label: 'Rose garden',
        scene: 'walking hand in hand along a path in a blooming rose garden, soft morning light, gentle bokeh',
    },
    {
        id: 'beach',
        label: 'Beach at sunset',
        scene: 'barefoot on a quiet beach at sunset, the sea behind them, the light warm and low',
    },
    {
        id: 'monsoon',
        label: 'Monsoon',
        scene: 'sharing one umbrella on a rain-washed street in the monsoon, green trees, soft grey light and reflections',
    },
    {
        id: 'city',
        label: 'City at night',
        scene: 'on a rooftop terrace at night with city lights behind them, string lights overhead',
    },
    {
        id: 'haveli',
        label: 'Old haveli',
        scene: 'seated on the steps of an old painted haveli with colourful doors and potted plants, afternoon light',
    },
];

// The scene in their own invitation's look: its colours and motifs, never its sacred art.
export interface DesignLook {
    colours: string[];
    motif?: string;
}

export const designScene = (look: DesignLook): PortraitScene => ({
    id: 'design',
    label: 'In your invitation’s style',
    scene: `as an elegant illustrated portrait in the style of a luxury wedding invitation, painted in ${look.colours.slice(0, 4).join(', ')}${look.motif ? `, framed with ${look.motif} motifs` : ''}, with a soft painterly finish`,
});

// One prompt for both models: keep who they are exactly, change only the place and the light.
export const portraitPrompt = (scene: PortraitScene): string =>
    [
        'A tasteful pre-wedding portrait photograph of the two people shown in the reference images, as a couple,',
        scene.scene + '.',
        'Keep each person’s face, skin tone, hair, build and age exactly as in their own photo; do not change their identity.',
        'Both fully and modestly dressed in elegant clothes suited to the setting.',
        'No text, no logos, no religious symbols, deities, temples or rituals.',
        'Natural, flattering, realistic, high detail, 4:5 portrait framing.',
    ].join(' ');

// Portrait shape: 4:5, as phones and Instagram show a tall picture.
export const PORTRAIT_SIZE = {
    width: 1024,
    height: 1280,
};

// FLUX.2 on Workers AI takes reference photos under 512 px; Gemini takes larger ones.
export const REFERENCE_EDGE: Record<PortraitProvider, number> = {
    flux: 511,
    gemini: 1536,
};

export const MAX_REFERENCES = 4;
