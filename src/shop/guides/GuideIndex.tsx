import { Link } from '@tanstack/react-router';

import { GuideSection } from './kit';

interface Group {
    category: string;
    label: string;
    guides: {
        slug: string;
        name: string;
        lead: string;
        designs: number;
        words: number;
    }[];
}

interface GuideIndexProps {
    groups: readonly Group[];
    of: 'wording' | 'invitations';
}

const counted = (n: number, one: string, many: string) => `${String(n)} ${n === 1 ? one : many}`;

// Every guide by kind of occasion.
export function GuideIndex({ groups, of }: GuideIndexProps) {
    const to = of === 'wording' ? '/wording/$page' : '/invitations/$page';
    return groups.map((group) => {
        const rows = of === 'wording' ? group.guides : group.guides.filter((g) => g.designs > 0);
        if (rows.length === 0) return null;
        return (
            <GuideSection key={group.category} title={group.label}>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {rows.map((g) => (
                        <li key={g.slug}>
                            <Link
                                to={to}
                                params={{ page: g.slug }}
                                className="block h-full rounded-[22px] border border-white/10 bg-white/[0.03] p-5 transition hover:border-gold/40"
                            >
                                <span className="block font-display text-2xl text-ivory">
                                    {g.name}
                                </span>
                                <span className="mt-1 block text-[11px] tracking-[0.2em] text-gold uppercase">
                                    {of === 'wording'
                                        ? counted(g.words, 'sample', 'samples')
                                        : counted(g.designs, 'design', 'designs')}
                                </span>
                                {of === 'wording' && (
                                    <span className="mt-3 line-clamp-3 block text-sm leading-relaxed text-ivory/60">
                                        {g.lead}
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </GuideSection>
        );
    });
}
