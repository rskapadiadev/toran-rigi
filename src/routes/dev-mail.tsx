import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { api } from '../lib/api';

interface DevMail {
    to: string;
    subject: string;
    text: string;
    sentAt: string;
}

export const Route = createFileRoute('/dev-mail')({
    ssr: false,
    head: () => ({
        meta: [
            { title: 'Dev mail' },
            {
                name: 'robots',
                content: 'noindex',
            },
        ],
    }),
    component: DevMailPage,
});

// Development-only inbox for the console mailer (the API returns 404 outside development).
function DevMailPage() {
    const [mails, setMails] = useState<DevMail[] | null>(null);
    useEffect(() => {
        const load = () => {
            void api<DevMail[]>('/dev/mail')
                .then(setMails)
                .catch(() => {
                    setMails([]);
                });
        };
        load();
        const id = window.setInterval(load, 3000);
        return () => {
            window.clearInterval(id);
        };
    }, []);
    return (
        <main className="mx-auto max-w-2xl px-4 py-10">
            <h1 className="font-display text-3xl">Dev mail</h1>
            <p className="mb-6 text-sm text-smoke">
                Emails sent by the console mailer. Refreshes every 3 seconds.
            </p>
            <div className="space-y-3">
                {mails?.map((m) => (
                    <article
                        key={m.sentAt + m.subject}
                        className="rounded-2xl border border-champagne bg-white p-4"
                    >
                        <p className="text-xs text-smoke">
                            {new Date(m.sentAt).toLocaleString()} → {m.to}
                        </p>
                        <h2 className="mt-1 font-medium">{m.subject}</h2>
                        <p className="mt-2 text-sm whitespace-pre-wrap text-ink/80">{m.text}</p>
                    </article>
                ))}
                {mails?.length === 0 && <p className="text-sm text-smoke">No mail yet.</p>}
            </div>
        </main>
    );
}
