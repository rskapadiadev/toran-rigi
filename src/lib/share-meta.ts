// Open Graph + Twitter tags for an invitation link: WhatsApp, iMessage, Instagram, Facebook, Telegram,
// LinkedIn, Slack and X all read these to draw the preview card.
import { shareFacts, type ShareSource } from '@shared/share';

interface ShareMetaInput {
    source: ShareSource;
    origin: string;
    // Page path, e.g. "/demo-rajwada".
    path: string;
    // Image path without origin, e.g. "/og/demo-rajwada.png?v=3".
    image: string;
    guestName?: string;
    lang?: string;
}

interface PageMetaInput {
    title: string;
    description: string;
    // Page path, e.g. "/".
    path: string;
    origin: string;
    // Image path without origin; 1200×630.
    image: string;
    imageType: 'image/png' | 'image/jpeg';
    imageAlt: string;
}

// The tags of one page: its title, description and preview card.
export function pageMeta({
    title,
    description,
    path,
    origin,
    image,
    imageType,
    imageAlt,
}: PageMetaInput) {
    const base = origin.replace(/\/$/, '');
    const url = `${base}${path}`;
    const imageUrl = `${base}${image}`;
    const secure = imageUrl.startsWith('https:');
    return [
        { title },
        {
            name: 'description',
            content: description,
        },
        {
            property: 'og:site_name',
            content: 'Toran',
        },
        {
            property: 'og:type',
            content: 'website',
        },
        {
            property: 'og:url',
            content: url,
        },
        {
            property: 'og:title',
            content: title,
        },
        {
            property: 'og:description',
            content: description,
        },
        {
            property: 'og:image',
            content: imageUrl,
        },
        ...(secure
            ? [
                  {
                      property: 'og:image:secure_url',
                      content: imageUrl,
                  },
              ]
            : []),
        {
            property: 'og:image:type',
            content: imageType,
        },
        {
            property: 'og:image:width',
            content: '1200',
        },
        {
            property: 'og:image:height',
            content: '630',
        },
        {
            property: 'og:image:alt',
            content: imageAlt,
        },
        {
            name: 'twitter:card',
            content: 'summary_large_image',
        },
        {
            name: 'twitter:title',
            content: title,
        },
        {
            name: 'twitter:description',
            content: description,
        },
        {
            name: 'twitter:image',
            content: imageUrl,
        },
        {
            name: 'twitter:image:alt',
            content: imageAlt,
        },
    ];
}

// The one address search engines should list for a page.
export const canonical = (origin: string, path: string) => ({
    rel: 'canonical',
    href: `${origin.replace(/\/$/, '')}${path}`,
});

interface Crumb {
    name: string;
    path: string;
}

interface Question {
    q: string;
    a: string;
}

// "<" is escaped so no text can ever close the script it sits in.
const dataScript = (data: unknown) => ({
    type: 'application/ld+json',
    children: JSON.stringify(data).replaceAll('<', String.raw`\u003c`),
});

// What a guide is and where it sits, in the form search engines read.
export const guideData = (origin: string, crumbs: readonly Crumb[], faqs: readonly Question[]) => [
    dataScript({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: canonical(origin, c.path).href,
        })),
    }),
    dataScript({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.a,
            },
        })),
    }),
];

export function shareMeta({ source, origin, path, image, guestName, lang }: ShareMetaInput) {
    const facts = shareFacts(source, guestName, lang);
    return [
        ...pageMeta({
            title: facts.title,
            description: facts.description,
            path,
            origin,
            image,
            imageType: 'image/png',
            imageAlt: facts.imageAlt,
        }),
        {
            name: 'theme-color',
            content: source.invitation.design.palette.bg,
        },
    ];
}
