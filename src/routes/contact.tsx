import { brand } from '@shared/brand';
import { createFileRoute } from '@tanstack/react-router';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

import { Part, policyHead, PolicyPage, textLink } from '@/shop/policies/kit';

import { fetchOrigin } from '../server-fns/store';

const LEAD = 'Stuck on a design, a payment or a date? Write or call, and a person will answer.';

export const Route = createFileRoute('/contact')({
    loader: () => fetchOrigin(),
    head: ({ loaderData }) =>
        policyHead({
            title: 'Contact us',
            lead: LEAD,
            path: '/contact',
            origin: loaderData?.origin,
        }),
    component: Contact,
});

const ways = [
    {
        icon: MessageCircle,
        label: 'WhatsApp',
        text: brand.phone,
        href: `https://wa.me/${brand.whatsapp.replace('+', '')}`,
    },
    {
        icon: Phone,
        label: 'Phone',
        text: brand.phone,
        href: `tel:${brand.whatsapp}`,
    },
    {
        icon: Mail,
        label: 'Email',
        text: brand.email,
        href: `mailto:${brand.email}`,
    },
];

function Contact() {
    return (
        <PolicyPage before="Talk to" accent="us" lead={LEAD}>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                {ways.map(({ icon: Icon, label, text, href }) => (
                    <li key={label}>
                        <a
                            href={href}
                            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:border-gold/50"
                        >
                            <Icon aria-hidden className="size-5 shrink-0 text-gold" />
                            <span className="min-w-0">
                                <span className="block text-xs text-ivory/55">{label}</span>
                                <span className="block break-words text-ivory">{text}</span>
                            </span>
                        </a>
                    </li>
                ))}
                <li className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                    <MapPin aria-hidden className="size-5 shrink-0 text-gold" />
                    <address className="min-w-0 not-italic">
                        <span className="block text-xs text-ivory/55">{brand.legalName}</span>
                        <span className="block text-ivory">{brand.address}</span>
                    </address>
                </li>
            </ul>
            <Part title="Complaints">
                <p>
                    If something has gone wrong and we haven’t put it right, write to{' '}
                    {brand.grievanceOfficer}, Grievance Officer, at{' '}
                    <a href={`mailto:${brand.email}`} className={textLink}>
                        {brand.email}
                    </a>{' '}
                    or {brand.phone}. We reply within 48 hours and settle every complaint within one
                    month.
                </p>
            </Part>
        </PolicyPage>
    );
}
