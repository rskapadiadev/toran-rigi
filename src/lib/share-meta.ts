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

export function shareMeta({ source, origin, path, image, guestName, lang }: ShareMetaInput) {
    const facts = shareFacts(source, guestName, lang);
    const base = origin.replace(/\/$/, '');
    const url = `${base}${path}`;
    const imageUrl = `${base}${image}`;
    const secure = imageUrl.startsWith('https:');
    return [
        { title: facts.title },
        {
            name: 'description',
            content: facts.description,
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
            content: facts.title,
        },
        {
            property: 'og:description',
            content: facts.description,
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
            content: 'image/png',
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
            content: facts.imageAlt,
        },
        {
            name: 'twitter:card',
            content: 'summary_large_image',
        },
        {
            name: 'twitter:title',
            content: facts.title,
        },
        {
            name: 'twitter:description',
            content: facts.description,
        },
        {
            name: 'twitter:image',
            content: imageUrl,
        },
        {
            name: 'twitter:image:alt',
            content: facts.imageAlt,
        },
        {
            name: 'theme-color',
            content: source.invitation.design.palette.bg,
        },
    ];
}
