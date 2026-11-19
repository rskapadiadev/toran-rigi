// Sections on the film's timeline: each rests on a second of the film (its own `filmAt`, or the one
// before it). Moving one in time keeps the page in the same order as the film.
import type { SectionConfig } from '@shared/types';

// Every section's second, in page order; hidden ones keep the second of the section before them.
export function sectionTimes(sections: SectionConfig[], first: number): number[] {
    let at = first;
    return sections.map((s) => {
        if (s.enabled && s.filmAt !== undefined) at = s.filmAt;
        return at;
    });
}

// Puts section `index` at second `at`, then sorts the page by time (stable, so sections sharing a
// second keep their order) and keeps a second only where a new chapter starts.
export function retime(sections: SectionConfig[], index: number, at: number, first: number) {
    const times = sectionTimes(sections, first);
    const timed = sections.map((s, k) => ({
        section: s,
        at: k === index ? at : (times[k] ?? first),
        // A moved section goes after the others already at its new second.
        order: k === index ? Number.MAX_SAFE_INTEGER : k,
    }));
    timed.sort((a, b) => a.at - b.at || a.order - b.order);
    let previous = first;
    return timed.map(({ section, at: second }, k) => {
        const rest = Object.fromEntries(
            Object.entries(section).filter(([key]) => key !== 'filmAt'),
        ) as SectionConfig;
        const starts = k === 0 || Math.abs(second - previous) > 1e-6;
        previous = second;
        return starts
            ? {
                  ...rest,
                  filmAt: second,
              }
            : rest;
    });
}

// A new section placed at a second (at the end of the sections already resting there).
export function addAt(
    sections: SectionConfig[],
    section: SectionConfig,
    at: number,
    first: number,
) {
    return retime([...sections, section], sections.length, at, first);
}
