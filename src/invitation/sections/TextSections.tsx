import type { LocalizedText } from '@shared/types';

import { GenerativeOrnament } from '../../motion/GenerativeOrnament';
import { Reveal } from '../../motion/Reveal';
import { useInvite } from '../context';
import { s, type StringKey } from '../strings';

function Divider() {
    const { data } = useInvite();
    return (
        <div className="mx-auto my-6 flex w-24 items-center justify-center" aria-hidden>
            <GenerativeOrnament
                kind={data.invitation.design.generative.kind}
                seed={data.invitation.seed + 7}
                className="w-full"
                duration={1800}
            />
        </div>
    );
}

interface ChapterProps {
    title?: StringKey;
    text: LocalizedText | undefined;
    large?: boolean;
    variant: string;
}

function Chapter({ title, text, large = false, variant }: ChapterProps) {
    const { t, locale } = useInvite();
    const body = t(text);
    if (!body) return null;
    const kicker = title && (
        <Reveal>
            <p className="text-xs tracking-[0.4em] text-(--inv-gold) uppercase">
                {s(title, locale)}
            </p>
        </Reveal>
    );
    const bodyClass = large
        ? 'inv-display text-[clamp(1.5rem,4.5cqw,2.6rem)]'
        : 'text-lg @2xl:text-xl';

    if (variant === 'framed')
        return (
            <section className="px-5 py-20">
                <Reveal className="relative mx-auto max-w-2xl px-[8cqw] py-14 text-center">
                    <div className="pointer-events-none absolute inset-0 border border-(--inv-gold) opacity-70" />
                    <div className="pointer-events-none absolute inset-2 border-2 border-(--inv-gold)" />
                    {(
                        [
                            '-start-3 -top-3',
                            '-end-3 -top-3',
                            '-start-3 -bottom-3',
                            '-end-3 -bottom-3',
                        ] as const
                    ).map((pos) => (
                        <span
                            key={pos}
                            aria-hidden
                            className={`absolute size-6 rotate-45 border-2 border-(--inv-gold) bg-(--inv-bg) ${pos}`}
                        />
                    ))}
                    <div className="relative">
                        {kicker}
                        <Divider />
                        <p className={`leading-relaxed ${bodyClass}`}>{body}</p>
                    </div>
                </Reveal>
            </section>
        );

    if (variant === 'editorial') {
        // Drop caps only for Latin script; they break joining in Arabic and Indic scripts.
        const dropCap = locale === 'en';
        return (
            <section className="px-[7cqw] py-20">
                <div className="mx-auto grid max-w-3xl grid-cols-[auto_1fr] gap-6">
                    <Reveal className="flex flex-col items-center gap-3">
                        <span className="h-16 w-px bg-(--inv-gold)" />
                        {title && (
                            <p className="text-[10px] tracking-[0.45em] text-(--inv-gold) uppercase [writing-mode:vertical-rl]">
                                {s(title, locale)}
                            </p>
                        )}
                        <span className="w-px flex-1 bg-(--inv-gold) opacity-40" />
                    </Reveal>
                    <Reveal delay={120}>
                        <p
                            className={`text-start leading-relaxed ${bodyClass} ${dropCap ? 'first-letter:float-start first-letter:me-3 first-letter:font-(family-name:--inv-display) first-letter:text-[4.2em] first-letter:leading-[0.8] first-letter:text-(--inv-primary)' : ''}`}
                        >
                            {body}
                        </p>
                    </Reveal>
                </div>
            </section>
        );
    }

    return (
        <section className="px-6 py-20 text-center">
            {kicker}
            <Divider />
            <Reveal delay={120} className={`mx-auto max-w-2xl leading-relaxed ${bodyClass}`}>
                <p>{body}</p>
            </Reveal>
        </section>
    );
}

interface VariantProps {
    variant: string;
}

export const Welcome = ({ variant }: VariantProps) => {
    const { data } = useInvite();
    return <Chapter text={data.invitation.content.welcome} large variant={variant} />;
};

export const Story = ({ variant }: VariantProps) => {
    const { data } = useInvite();
    return <Chapter title="ourStory" text={data.invitation.content.story} variant={variant} />;
};

export const Family = ({ variant }: VariantProps) => {
    const { data } = useInvite();
    return <Chapter title="family" text={data.invitation.content.family} variant={variant} />;
};

export function Closing({ variant }: VariantProps) {
    const { data, t, copy, names } = useInvite();
    const { content } = data.invitation;
    const share = async () => {
        const url = window.location.href.split('?')[0] ?? window.location.href;
        const title = names.title;
        if ('share' in navigator) {
            await navigator
                .share({
                    title,
                    url,
                })
                .catch(() => undefined);
        } else {
            window.open(
                `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
                '_blank',
                'noopener',
            );
        }
    };
    return (
        <section className="relative overflow-hidden px-6 pt-24 pb-32 text-center">
            {variant === 'monogram' ? (
                <Reveal className="mx-auto mb-10 flex size-40 items-center justify-center rounded-full border-2 border-(--inv-gold) shadow-[inset_0_0_0_6px_var(--inv-bg),inset_0_0_0_7px_var(--inv-gold)]">
                    <span className="inv-display foil-text text-6xl leading-none">
                        {names.initials[0]}
                        {names.initials[1] && (
                            <>
                                <span className="inv-script mx-1 text-2xl text-(--inv-primary)">
                                    {copy('and')}
                                </span>
                                {names.initials[1]}
                            </>
                        )}
                    </span>
                </Reveal>
            ) : (
                <Divider />
            )}
            <Reveal className="inv-display mx-auto max-w-2xl text-[clamp(1.6rem,5cqw,3rem)] leading-tight">
                {t(content.closing)}
            </Reveal>
            {content.hashtag && (
                <Reveal className="mt-6 text-sm tracking-[0.3em] text-(--inv-gold)">
                    {content.hashtag}
                </Reveal>
            )}
            <Reveal delay={200} className="mt-12">
                <button
                    type="button"
                    onClick={() => void share()}
                    className="rounded-full border border-(--inv-gold) px-7 py-3 text-xs tracking-[0.3em] uppercase transition-colors hover:bg-(--inv-gold) hover:text-(--inv-bg)"
                >
                    {copy('share')}
                </button>
            </Reveal>
            <p className="mt-16 text-[10px] tracking-[0.35em] uppercase opacity-50">
                {copy('madeWith')}
            </p>
        </section>
    );
}
