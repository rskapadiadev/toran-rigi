// The PDF's last page: what paper can't do (reply, leave a wish, hear the music) lives online, one
// scan away.
import { useMemo } from 'react';
import { renderSVG } from 'uqr';

import { Branding } from './Branding';
import { useInvite } from './context';

export function PrintClosing({ url }: { url: string }) {
    const { names } = useInvite();
    const qr = useMemo(
        () =>
            renderSVG(url, {
                border: 1,
                whiteColor: '#ffffff',
                blackColor: '#1d1416',
            }),
        [url],
    );
    return (
        <section className="flex flex-col" data-print-closing>
            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-16 text-center">
                <p className="text-[11px] tracking-[0.4em] uppercase opacity-70">With love</p>
                <p className="inv-display text-4xl">{names.title}</p>
                <div
                    className="w-48 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/10"
                    // The SVG is generated locally from the invitation's own link.
                    dangerouslySetInnerHTML={{ __html: qr }}
                />
                <p className="max-w-xs text-base leading-relaxed">
                    Scan to open the living invitation: hear the music, reply and leave your wishes.
                </p>
                <a href={url} className="text-sm break-all underline underline-offset-4">
                    {url.replace(/^https?:\/\//, '')}
                </a>
            </div>
            <Branding />
        </section>
    );
}
