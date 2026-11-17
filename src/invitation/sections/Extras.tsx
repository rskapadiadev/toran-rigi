import { photoUrl } from '@shared/photos';
import type { WishInput } from '@shared/schemas/guest';
import { upiLink } from '@shared/upi';
import { type CSSProperties, type ReactNode, type SyntheticEvent, useMemo, useState } from 'react';
import { renderSVG } from 'uqr';

import { formString } from '../../motion/hooks';
import { Reveal } from '../../motion/Reveal';
import { useInvite } from '../context';
import { HeartBurst, HeartIcon, HeartPill, useDoubleTap, useHearts } from '../hearts';
import type { PublicWishData } from '../types';

const field =
    'w-full rounded-xl border border-(--inv-gold)/40 bg-(--inv-bg)/60 px-4 py-3 text-base outline-none focus:border-(--inv-gold)';

type Hearts = ReturnType<typeof useHearts>;

interface WishCardProps {
    wish: PublicWishData;
    hearts: Hearts;
}

// A blessing card: double-tap it (or press the heart) to send love.
function WishCard({ wish, hearts }: WishCardProps) {
    const { copy } = useInvite();
    const target = `wish:${wish.id}`;
    const [burst, setBurst] = useState(0);
    const love = () => {
        setBurst((b) => b + 1);
        void hearts.send(target);
    };
    const tap = useDoubleTap(love);
    const liked = hearts.isLiked(target);
    return (
        <figure
            className="inv-card relative min-w-64 touch-manipulation snap-center rounded-2xl p-5 select-none"
            onPointerUp={hearts.enabled ? tap : undefined}
        >
            <blockquote className="leading-relaxed">“{wish.message}”</blockquote>
            <figcaption className="mt-3 flex items-center justify-between gap-3 text-sm text-(--inv-gold)">
                <span>— {wish.name}</span>
                {hearts.enabled && (
                    <button
                        type="button"
                        aria-label={copy('sendLove')}
                        aria-pressed={liked}
                        onPointerUp={(e) => {
                            e.stopPropagation();
                        }}
                        onClick={love}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 tabular-nums transition hover:bg-(--inv-gold)/10"
                    >
                        <HeartIcon
                            filled={liked}
                            className={`size-4 ${liked ? 'text-[#e0445e]' : ''}`}
                        />
                        {hearts.count(target) > 0 && hearts.count(target)}
                    </button>
                )}
            </figcaption>
            <HeartBurst burst={burst} />
        </figure>
    );
}

export function Wishes() {
    const { data, guest, copy } = useInvite();
    const [sent, setSent] = useState(false);
    const hearts = useHearts();
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
                <h2 className="inv-display text-[clamp(1.8rem,5cqw,3rem)]">
                    {copy('wishesTitle')}
                </h2>
            </Reveal>
            {data.wishes.length > 0 && (
                <div className="mx-auto mb-10 flex max-w-5xl snap-x gap-4 overflow-x-auto pb-4">
                    {data.wishes.map((w) => (
                        <WishCard key={w.id} wish={w} hearts={hearts} />
                    ))}
                </div>
            )}
            <div className="mx-auto max-w-xl">
                {sent ? (
                    <p className="text-center">{copy('wishPending')}</p>
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
                            placeholder={copy('yourName')}
                            aria-label={copy('yourName')}
                            className={field}
                        />
                        <textarea
                            name="message"
                            required
                            minLength={2}
                            maxLength={600}
                            rows={3}
                            placeholder={copy('leaveWish')}
                            aria-label={copy('leaveWish')}
                            className={field}
                        />
                        <button
                            type="submit"
                            className="w-full rounded-full border border-(--inv-gold) px-6 py-3 text-xs tracking-[0.3em] uppercase"
                        >
                            {copy('leaveWish')}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}

export function Shagun() {
    const { data, copy } = useInvite();
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
                <h2 className="inv-display text-[clamp(1.8rem,5cqw,3rem)]">
                    {copy('shagunTitle')}
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
                    {copy('shagunCta')}
                </a>
                <p className="text-xs opacity-60">{copy('shagunNote')}</p>
            </Reveal>
        </section>
    );
}

export function Live() {
    const { data, copy } = useInvite();
    const live = data.invitation.extras.live;
    if (!live) return null;
    const id = /(?:v=|youtu\.be\/|live\/)([\w-]{11})/.exec(live.youtubeUrl)?.[1];
    if (!id) return null;
    return (
        <section className="px-5 py-16 text-center">
            <p className="mb-6 text-xs tracking-[0.4em] text-(--inv-gold) uppercase">
                {copy('happeningNow')}
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
            <div className="mx-auto grid max-w-5xl gap-5 @3xl:grid-cols-3">
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

export function Gallery({ variant }: { variant: string }) {
    const { data } = useInvite();
    const photos = data.invitation.content.gallery;
    const [open, setOpen] = useState<string | null>(null);
    const hearts = useHearts();
    if (photos.length === 0) return null;
    return (
        <section className="px-3 py-20">
            {variant === 'polaroid' && (
                <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-2 gap-y-6 px-2">
                    {photos.map((key, i) => (
                        <Reveal key={key} delay={(i % 6) * 90}>
                            <PhotoTap
                                photo={key}
                                hearts={hearts}
                                onOpen={setOpen}
                                className="relative block w-[42cqw] max-w-60 bg-[#fdfbf6] p-2 pb-9 shadow-[0_18px_30px_-14px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:z-10 hover:rotate-0"
                                style={{ rotate: `${((i * 37) % 13) - 6}deg` }}
                            >
                                <span className="absolute start-1/2 -top-3 h-6 w-16 -translate-x-1/2 rotate-[-4deg] bg-[#efe2bf]/80 shadow-sm rtl:translate-x-1/2" />
                                <img
                                    src={photoUrl(key)}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    className="aspect-square w-full object-cover"
                                />
                            </PhotoTap>
                        </Reveal>
                    ))}
                </div>
            )}
            {variant === 'film' && (
                <div className="-mx-3 [scrollbar-width:none] overflow-x-auto bg-[#111] py-5">
                    <div className="flex w-max gap-2 px-4 py-4 [background:repeating-linear-gradient(90deg,transparent_0_10px,#2a2a2a_10px_18px)_top/100%_8px_no-repeat,repeating-linear-gradient(90deg,transparent_0_10px,#2a2a2a_10px_18px)_bottom/100%_8px_no-repeat]">
                        {photos.map((key) => (
                            <PhotoTap
                                key={key}
                                photo={key}
                                hearts={hearts}
                                onOpen={setOpen}
                                className="relative h-[46cqw] max-h-72 shrink-0 overflow-hidden"
                            >
                                <img
                                    src={photoUrl(key)}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-auto sepia-[0.15]"
                                />
                            </PhotoTap>
                        ))}
                    </div>
                </div>
            )}
            <div
                className={`mx-auto max-w-6xl columns-2 gap-3 @3xl:columns-3 ${variant === 'polaroid' || variant === 'film' ? 'hidden' : ''}`}
            >
                {photos.map((key, i) => (
                    <Reveal key={key} delay={(i % 6) * 80} className="mb-3 break-inside-avoid">
                        <PhotoTap
                            photo={key}
                            hearts={hearts}
                            onOpen={setOpen}
                            className="relative block w-full overflow-hidden rounded-2xl"
                        >
                            <img
                                src={photoUrl(key)}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-full transition duration-700 hover:scale-105"
                            />
                        </PhotoTap>
                    </Reveal>
                ))}
            </div>
            {open && (
                <PhotoViewer
                    photo={open}
                    hearts={hearts}
                    onClose={() => {
                        setOpen(null);
                    }}
                />
            )}
        </section>
    );
}

interface PhotoTapProps {
    photo: string;
    hearts: Hearts;
    onOpen: (photo: string) => void;
    className: string;
    style?: CSSProperties;
    children: ReactNode;
}

// One tap opens the photo; a double tap sends it a heart instead.
function PhotoTap({ photo, hearts, onOpen, className, style, children }: PhotoTapProps) {
    const target = `photo:${photo}`;
    const [burst, setBurst] = useState(0);
    const tap = useDoubleTap(
        () => {
            setBurst((b) => b + 1);
            void hearts.send(target);
        },
        () => {
            onOpen(photo);
        },
    );
    return (
        <button
            type="button"
            onClick={
                hearts.enabled
                    ? tap
                    : () => {
                          onOpen(photo);
                      }
            }
            className={`${className} touch-manipulation`}
            style={style}
        >
            {children}
            <span className="absolute end-2 bottom-2">
                <HeartPill count={hearts.count(target)} liked={hearts.isLiked(target)} />
            </span>
            <HeartBurst burst={burst} />
        </button>
    );
}

interface ViewerProps {
    photo: string;
    hearts: Hearts;
    onClose: () => void;
}

// The full-screen photo: tap outside to close, double-tap the picture or press the heart to send love.
function PhotoViewer({ photo, hearts, onClose }: ViewerProps) {
    const { copy } = useInvite();
    const target = `photo:${photo}`;
    const [burst, setBurst] = useState(0);
    const love = () => {
        setBurst((b) => b + 1);
        void hearts.send(target);
    };
    const tap = useDoubleTap(love);
    const liked = hearts.isLiked(target);
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-4">
            <button
                type="button"
                aria-label={copy('closePhoto')}
                className="absolute inset-0 cursor-zoom-out"
                onClick={onClose}
            />
            <div
                className="relative max-h-[82svh] touch-manipulation select-none"
                onPointerUp={hearts.enabled ? tap : undefined}
            >
                <img
                    src={photoUrl(photo)}
                    alt=""
                    className="max-h-[82svh] max-w-full rounded-xl"
                    draggable={false}
                />
                <HeartBurst burst={burst} />
            </div>
            {hearts.enabled && (
                <button
                    type="button"
                    aria-label={copy('sendLove')}
                    aria-pressed={liked}
                    onClick={love}
                    className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white tabular-nums backdrop-blur-sm transition hover:bg-white/20"
                >
                    <HeartIcon
                        filled={liked}
                        className={`size-5 ${liked ? 'text-[#ff6b81]' : ''}`}
                    />
                    {hearts.count(target)}
                </button>
            )}
        </div>
    );
}
