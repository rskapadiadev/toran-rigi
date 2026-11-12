import { newId } from '@shared/ids';

import { getPlatform } from '../platform/context';

export interface StoredMail extends Mail {
    sentAt: string;
}

export interface Mail {
    to: string;
    subject: string;
    html: string;
    text: string;
}

// console driver: stores mail in blob storage (works on Workers and Node) for the /admin/dev-mail viewer.
export async function sendMail(mail: Mail): Promise<void> {
    const { config, blob } = getPlatform();
    if (config.MAILER_DRIVER === 'resend' && config.RESEND_API_KEY) {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                authorization: `Bearer ${config.RESEND_API_KEY}`,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                from: config.MAIL_FROM,
                to: mail.to,
                subject: mail.subject,
                html: mail.html,
                text: mail.text,
            }),
        });
        if (!res.ok) throw new Error(`Resend failed: ${res.status}`);
        return;
    }
    const key = `dev-mail/${new Date().toISOString()}-${newId()}.json`;
    await blob.put(
        key,
        new TextEncoder().encode(
            JSON.stringify({
                ...mail,
                sentAt: new Date().toISOString(),
            }),
        ),
        { contentType: 'application/json' },
    );
    console.log(`[mail:console] to=${mail.to} subject="${mail.subject}"`);
}

export async function listDevMail(limit = 30) {
    const { blob } = getPlatform();
    const keys = (await blob.list('dev-mail/')).sort().reverse().slice(0, limit);
    const mails = await Promise.all(
        keys.map(async (key) => {
            const object = await blob.get(key);
            if (!object) return null;
            const stored: StoredMail = await new Response(object.body).json();
            return stored;
        }),
    );
    return mails.filter((m) => m !== null);
}
