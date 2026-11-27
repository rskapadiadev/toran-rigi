// The policy pages: plain words on the shop's night, one column that reads well on a phone.
import { brand } from '@shared/brand';
import { GRIEVANCE_ACK_HOURS, GRIEVANCE_DAYS, POLICIES_UPDATED } from '@shared/policies';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { canonical, pageMeta } from '@/lib/share-meta';
import { IndexHeader } from '@/shop/guides/kit';
import { ShopShell } from '@/shop/ShopShell';

export const textLink = 'text-gold-bright underline underline-offset-4 hover:text-ivory';

interface PolicyPageProps {
    before: string;
    accent: string;
    lead: string;
    children: ReactNode;
    // Help pages aren't promises, so they carry no date.
    dated?: boolean;
}

export function PolicyPage({ before, accent, lead, children, dated = true }: PolicyPageProps) {
    return (
        <ShopShell tone="dark">
            <main>
                <IndexHeader before={before} accent={accent} lead={lead} />
                <div className="mx-auto max-w-6xl px-4 sm:px-5">
                    <div className="max-w-2xl">
                        {children}
                        <p className="mt-12 border-t border-white/10 pt-6 text-sm text-ivory/55">
                            {dated && `Last updated ${POLICIES_UPDATED}. `}Questions? Write to{' '}
                            <a href={`mailto:${brand.email}`} className={textLink}>
                                {brand.email}
                            </a>{' '}
                            or see{' '}
                            <Link to="/contact" className={textLink}>
                                Contact
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </main>
        </ShopShell>
    );
}

interface PartProps {
    title: string;
    children: ReactNode;
    id?: string;
    // h3 when the part sits under a heading of its own, as help articles do.
    level?: 'h2' | 'h3';
}

export function Part({ title, children, id, level = 'h2' }: PartProps) {
    const Heading = level;
    return (
        <section id={id} className="scroll-mt-24 pt-10">
            <Heading className="font-display text-2xl text-ivory md:text-3xl">{title}</Heading>
            <div className="mt-3 space-y-3 leading-relaxed text-ivory/70">{children}</div>
        </section>
    );
}

// Who takes complaints, as the e-commerce and IT rules ask every shop to say.
export function Grievance() {
    return (
        <>
            <p>
                If something has gone wrong and we haven’t put it right, write to our{' '}
                {brand.grievanceTitle.toLowerCase()}:
            </p>
            <address className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 not-italic">
                <span className="block text-ivory">{brand.grievanceOfficer}</span>
                <span className="block text-sm text-ivory/55">
                    {brand.grievanceTitle}, {brand.legalName}
                </span>
                <a href={`mailto:${brand.email}`} className={`${textLink} mt-2 block break-words`}>
                    {brand.email}
                </a>
                <span className="block">{brand.phone}</span>
                <span className="block">{brand.address}</span>
            </address>
            <p>
                We tell you we have your complaint within {GRIEVANCE_ACK_HOURS} hours and settle it
                within {GRIEVANCE_DAYS} days.
            </p>
        </>
    );
}

export function Points({ children }: { children: ReactNode }) {
    return <ul className="list-disc space-y-2 ps-5 marker:text-gold">{children}</ul>;
}

interface HeadInput {
    title: string;
    lead: string;
    path: string;
    origin?: string;
}

export const policyHead = ({ title, lead, path, origin = '' }: HeadInput) => ({
    links: [canonical(origin, path)],
    meta: pageMeta({
        title: `${title} · Toran`,
        description: lead,
        path,
        origin,
        image: '/share/toran.jpg?v=1',
        imageType: 'image/jpeg',
        imageAlt: 'Three Toran invitations on phones',
    }),
});

interface PayTermsProps {
    className?: string;
}

// Beside every Pay button. Opens in a new tab so nobody loses the words they just wrote.
export function PayTerms({ className }: PayTermsProps) {
    const link = 'underline underline-offset-2 hover:text-foreground';
    return (
        <p className={className}>
            By paying you agree to our{' '}
            <a href="/terms" target="_blank" rel="noreferrer" className={link}>
                terms
            </a>{' '}
            and{' '}
            <a href="/refund" target="_blank" rel="noreferrer" className={link}>
                refund rule
            </a>
            .
        </p>
    );
}
