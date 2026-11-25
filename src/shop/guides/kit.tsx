// Pieces of the public guides (designs and wording pages): plain, quick text on the shop's night.
import type { GuideFaq } from '@shared/guides';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

interface GuideHeaderProps {
    // The index this page belongs to.
    parent: 'wording' | 'invitations';
    name: string;
    before: string;
    accent: string;
    lead: string;
    children?: ReactNode;
}

const parents = {
    wording: {
        to: '/wording',
        label: 'Wording',
    },
    invitations: {
        to: '/invitations',
        label: 'Designs by occasion',
    },
} as const;

// No fade-in: the heading is what people and search engines came for.
export function GuideHeader({ parent, name, before, accent, lead, children }: GuideHeaderProps) {
    const up = parents[parent];
    return (
        <header className="relative isolate">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(circle_at_20%_0%,rgba(195,154,78,0.2),transparent_55%),radial-gradient(circle_at_90%_10%,rgba(110,26,46,0.6),transparent_55%)] [mask-image:linear-gradient(black_40%,transparent)]" />
            <div className="relative mx-auto max-w-6xl px-4 pt-28 sm:px-5 sm:pt-32">
                <nav aria-label="Breadcrumb" className="text-xs text-ivory/55">
                    <ol className="flex flex-wrap gap-1.5">
                        <li>
                            <Link to="/" className="hover:text-ivory">
                                Toran
                            </Link>{' '}
                            <span aria-hidden>/</span>
                        </li>
                        <li>
                            <Link to={up.to} className="hover:text-ivory">
                                {up.label}
                            </Link>{' '}
                            <span aria-hidden>/</span>
                        </li>
                        <li aria-current="page" className="text-ivory/80">
                            {name}
                        </li>
                    </ol>
                </nav>
                <h1 className="mt-5 font-display text-4xl leading-[1.05] text-balance text-ivory sm:text-5xl md:text-6xl">
                    {before} <em className="text-gold-bright">{accent}</em>
                </h1>
                <p className="mt-4 max-w-2xl leading-relaxed text-ivory/70">{lead}</p>
                {children}
            </div>
        </header>
    );
}

interface SectionProps {
    title: string;
    children: ReactNode;
    id?: string;
}

export function GuideSection({ title, children, id }: SectionProps) {
    return (
        <section id={id} className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 sm:px-5 sm:pt-20">
            <h2 className="font-display text-3xl text-ivory md:text-4xl">{title}</h2>
            <div className="mt-6">{children}</div>
        </section>
    );
}

interface FaqsProps {
    faqs: readonly GuideFaq[];
}

export function GuideFaqs({ faqs }: FaqsProps) {
    return (
        <GuideSection title="Questions people ask">
            <div className="max-w-3xl divide-y divide-white/10 border-y border-white/10">
                {faqs.map((f) => (
                    <details key={f.q} className="group py-5">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl text-ivory">
                            {f.q}
                            <span aria-hidden className="text-gold transition group-open:rotate-45">
                                +
                            </span>
                        </summary>
                        <p className="mt-3 text-sm leading-relaxed text-ivory/65">{f.a}</p>
                    </details>
                ))}
            </div>
        </GuideSection>
    );
}

interface GuideLinksProps {
    title: string;
    to: '/wording/$page' | '/invitations/$page';
    guides: readonly {
        slug: string;
        name: string;
    }[];
}

export function GuideLinks({ title, to, guides }: GuideLinksProps) {
    if (guides.length === 0) return null;
    return (
        <GuideSection title={title}>
            <ul className="flex flex-wrap gap-2">
                {guides.map((g) => (
                    <li key={g.slug}>
                        <Link
                            to={to}
                            params={{ page: g.slug }}
                            className="inline-block rounded-full border border-white/15 px-4 py-2 text-sm text-ivory/75 transition hover:border-gold/50 hover:text-ivory"
                        >
                            {g.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </GuideSection>
    );
}

export const goldButton =
    'inline-flex items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 py-3 text-sm font-semibold text-night transition hover:brightness-105';
export const quietButton =
    'inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm text-ivory/80 transition hover:border-white/30 hover:text-ivory';

interface IndexHeaderProps {
    before: string;
    accent: string;
    lead: string;
}

export function IndexHeader({ before, accent, lead }: IndexHeaderProps) {
    return (
        <header className="relative isolate">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(circle_at_20%_0%,rgba(195,154,78,0.2),transparent_55%),radial-gradient(circle_at_90%_10%,rgba(110,26,46,0.6),transparent_55%)] [mask-image:linear-gradient(black_40%,transparent)]" />
            <div className="relative mx-auto max-w-6xl px-4 pt-28 sm:px-5 sm:pt-32">
                <h1 className="font-display text-4xl leading-[1.05] text-balance text-ivory sm:text-5xl md:text-6xl">
                    {before} <em className="text-gold-bright">{accent}</em>
                </h1>
                <p className="mt-4 max-w-2xl leading-relaxed text-ivory/70">{lead}</p>
            </div>
        </header>
    );
}
