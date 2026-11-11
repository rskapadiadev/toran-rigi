import type { WishInput } from '@shared/schemas/guest';
import { upiLink } from '@shared/upi';
import { type SyntheticEvent, useMemo, useState } from 'react';
import { renderSVG } from 'uqr';

import { formString } from '../../motion/hooks';
import { Reveal } from '../../motion/Reveal';
import { useInvite } from '../context';
import { s } from '../strings';

const field =
    'w-full rounded-xl border border-(--inv-gold)/40 bg-(--inv-bg)/60 px-4 py-3 text-base outline-none focus:border-(--inv-gold)';

export function Wishes() {
    const { data, locale, guest } = useInvite();
    const [sent, setSent] = useState(false);
    if (data.invitation.extras.wishes?.enabled === false) return null;

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const body: WishInput = {
            name: formString(form, 'name'),
            message: formString(form, 'message'),
            guestToken: guest?.token,
        };
        const res = await fetch(`/api/i/${data.invitation.slug}/wishes`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        }).catch(() => null);
        if (res?.ok) setSent(true);
    };

    return (
        <section className="px-5 py-20">
            <Reveal className="mb-10 text-center">
                <h2 className="inv-display text-[clamp(1.8rem,5vw,3rem)]">
                    {s('wishesTitle', locale)}
                </h2>
            </Reveal>
            {data.wishes.length > 0 && (
                <div className="mx-auto mb-10 flex max-w-5xl snap-x gap-4 overflow-x-auto pb-4">
                    {data.wishes.map((w) => (
                        <figure
                            key={w.id}
                            className="inv-card min-w-64 snap-center rounded-2xl p-5"
                        >
                            <blockquote className="leading-relaxed">“{w.message}”</blockquote>
                            <figcaption className="mt-3 text-sm text-(--inv-gold)">
                                — {w.name}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            )}
            <div className="mx-auto max-w-xl">
                {sent ? (
                    <p className="text-center">{s('wishPending', locale)}</p>
                ) : (
                    <form
                        onSubmit={(e) => void submit(e)}
                        className="inv-card space-y-4 rounded-3xl p-6"
                    >
                        <input
                            name="name"
                            required
                            maxLength={120}
                            defaultValue={guest?.name}
                            placeholder={s('yourName', locale)}
                            aria-label={s('yourName', locale)}
                            className={field}
                        />
                        <textarea
                            name="message"
                            required
                            minLength={2}
                            maxLength={600}
                            rows={3}
                            placeholder={s('leaveWish', locale)}
                            aria-label={s('leaveWish', locale)}
                            className={field}
                        />
                        <button
                            type="submit"
                            className="w-full rounded-full border border-(--inv-gold) px-6 py-3 text-xs tracking-[0.3em] uppercase"
                        >
                            {s('leaveWish', locale)}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}

export function Shagun() {
    const { data, locale } = useInvite();
    const shagun = data.invitation.extras.shagun;
    const link = shagun ? upiLink(shagun.upiId, shagun.payeeName, shagun.note) : '';
    const qr = useMemo(
        () =>
            link
                ? renderSVG(link, {
                      border: 1,
                      whiteColor: 'transparent',
                      blackColor: 'currentColor',
                  })
                : '',
        [link],
    );
    if (!shagun) return null;
    return (
        <section className="px-5 py-20 text-center">
            <Reveal>
                <h2 className="inv-display text-[clamp(1.8rem,5vw,3rem)]">
                    {s('shagunTitle', locale)}
                </h2>
            </Reveal>
            <Reveal
                delay={120}
                className="inv-card mx-auto mt-8 flex max-w-sm flex-col items-center gap-5 rounded-3xl p-7"
            >
                <div className="w-44 text-(--inv-ink)" dangerouslySetInnerHTML={{ __html: qr }} />
                <p className="text-sm opacity-80" dir="ltr">
                    {shagun.upiId}
                </p>
                <a
                    href={link}
                    className="rounded-full bg-(--inv-primary) px-7 py-3 text-xs tracking-[0.3em] text-(--inv-bg) uppercase"
                >
                    {s('shagunCta', locale)}
                </a>
                <p className="text-xs opacity-60">{s('shagunNote', locale)}</p>
            </Reveal>
        </section>
    );
}

export function Live() {
    const { data, locale } = useInvite();
    const live = data.invitation.extras.live;
    if (!live) return null;
    const id = /(?:v=|youtu\.be\/|live\/)([\w-]{11})/.exec(live.youtubeUrl)?.[1];
    if (!id) return null;
    return (
        <section className="px-5 py-16 text-center">
            <p className="mb-6 text-xs tracking-[0.4em] text-(--inv-gold) uppercase">
                {s('happeningNow', locale)}
            </p>
            <div className="mx-auto aspect-video max-w-3xl overflow-hidden rounded-3xl">
                <iframe
                    className="size-full"
                    src={`https://www.youtube-nocookie.com/embed/${id}`}
                    title="Live stream"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                />
            </div>
        </section>
    );
}

export function Travel() {
    const { data, t } = useInvite();
    const blocks = data.invitation.extras.travel;
    if (!blocks?.length) return null;
    return (
        <section className="px-5 py-20">
            <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
                {blocks.map((b, i) => (
                    <Reveal key={i} delay={i * 100} className="inv-card rounded-2xl p-6">
                        <h3 className="inv-display text-2xl text-(--inv-primary)">{t(b.title)}</h3>
                        <p className="mt-2 text-sm leading-relaxed opacity-80">{t(b.body)}</p>
                        {b.link && (
                            <a
                                href={b.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-block text-xs tracking-[0.25em] text-(--inv-gold) uppercase"
                            >
                                →
                            </a>
                        )}
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

export function Gallery() {
    const { data } = useInvite();
    const photos = data.invitation.content.gallery;
    const [open, setOpen] = useState<string | null>(null);
    if (photos.length === 0) return null;
    return (
        <section className="px-3 py-20">
            <div className="mx-auto max-w-6xl columns-2 gap-3 md:columns-3">
                {photos.map((key, i) => (
                    <Reveal key={key} delay={(i % 6) * 80} className="mb-3 break-inside-avoid">
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(key);
                            }}
                            className="block w-full overflow-hidden rounded-2xl"
                        >
                            <img
                                src={`/media/${key}`}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-full transition duration-700 hover:scale-105"
                            />
                        </button>
                    </Reveal>
                ))}
            </div>
            {open && (
                <button
                    type="button"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
                    onClick={() => {
                        setOpen(null);
                    }}
                    aria-label="Close"
                >
                    <img
                        src={`/media/${open}`}
                        alt=""
                        className="max-h-full max-w-full rounded-xl"
                    />
                </button>
            )}
        </section>
    );
}
