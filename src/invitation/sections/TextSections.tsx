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

function Chapter({
    title,
    text,
    large = false,
}: {
    title?: StringKey;
    text: LocalizedText | undefined;
    large?: boolean;
}) {
    const { t, locale } = useInvite();
    const body = t(text);
    if (!body) return null;
    return (
        <section className="px-6 py-20 text-center">
            {title && (
                <Reveal>
                    <p className="text-xs tracking-[0.4em] text-(--inv-gold) uppercase">
                        {s(title, locale)}
                    </p>
                </Reveal>
            )}
            <Divider />
            <Reveal
                delay={120}
                className={`mx-auto max-w-2xl leading-relaxed ${large ? 'inv-display text-[clamp(1.5rem,4.5vw,2.6rem)]' : 'text-lg sm:text-xl'}`}
            >
                <p>{body}</p>
            </Reveal>
        </section>
    );
}

export const Welcome = () => {
    const { data } = useInvite();
    return <Chapter text={data.invitation.content.welcome} large />;
};

export const Story = () => {
    const { data } = useInvite();
    return <Chapter title="ourStory" text={data.invitation.content.story} />;
};

export const Family = () => {
    const { data } = useInvite();
    return <Chapter title="family" text={data.invitation.content.family} />;
};

export function Closing() {
    const { data, t, locale } = useInvite();
    const { content } = data.invitation;
    const share = async () => {
        const url = window.location.href.split('?')[0] ?? window.location.href;
        const title = `${t(content.couple.one.name)} & ${t(content.couple.two.name)}`;
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
            <Divider />
            <Reveal className="inv-display mx-auto max-w-2xl text-[clamp(1.6rem,5vw,3rem)] leading-tight">
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
                    {s('share', locale)}
                </button>
            </Reveal>
            <p className="mt-16 text-[10px] tracking-[0.35em] uppercase opacity-50">
                {s('madeWith', locale)}
            </p>
        </section>
    );
}
