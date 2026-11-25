// Which sections an invitation shows, and what a customer may do to them: switch them on or off, put
// them in order and bring back ones the occasion allows. How each is drawn stays the studio's.
import { isRendered, type RenderedSection, renderedSections } from './blocks';
import { allowedSection, type OccasionPack } from './occasions';
import type { SectionConfig, SectionType } from './types';

export interface SectionChoice {
    type: SectionType;
    enabled: boolean;
}

// The front door: an invitation without it has no names and nothing to open.
export const alwaysShown = (type: SectionType): boolean => type === 'cover';

export const showsSection = (sections: readonly SectionConfig[], type: SectionType): boolean =>
    sections.some((s) => s.type === type && s.enabled);

// Sections the invitation doesn't have yet that its occasion allows.
export const missingSections = (
    sections: readonly SectionConfig[],
    occasion: OccasionPack,
): RenderedSection[] => {
    const present = new Set(sections.map((s) => s.type));
    return renderedSections.filter((t) => !present.has(t) && allowedSection(occasion, t));
};

// The stored sections with the customer's choices applied. Their styling is never taken from the
// customer, and a section they didn't mention stays as it was.
export function chooseSections(
    stored: readonly SectionConfig[],
    wanted: readonly SectionChoice[],
    occasion: OccasionPack,
): SectionConfig[] {
    const own = new Map(stored.map((s) => [s.type, s]));
    const chosen = new Map<SectionType, SectionConfig>();
    for (const { type, enabled } of wanted) {
        const config = own.get(type);
        if (chosen.has(type) || (!config && !(isRendered(type) && allowedSection(occasion, type))))
            continue;
        chosen.set(type, {
            ...(config ?? { type }),
            enabled: enabled || alwaysShown(type),
        });
    }
    const kept = stored.filter((s) => !chosen.has(s.type));
    const all = [...chosen.values(), ...kept];
    return [...all.filter((s) => alwaysShown(s.type)), ...all.filter((s) => !alwaysShown(s.type))];
}
