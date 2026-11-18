// Dress code: the studio's painting of the family dressed for the day, then each ceremony's look
// as a row: its name (and the name in the second language), the note, and the colours to wear.
import { eventLabel } from '@shared/cultures';
import { photoUrl } from '@shared/photos';

import { Reveal } from '../../../motion/Reveal';
import { useInvite } from '../../context';
import { useEditing } from '../../editing';
import { SectionTitle } from '../typography/SectionTitle';

export function DressCode() {
    const { data, copy, t, locale } = useInvite();
    const editing = useEditing();
    const art = data.invitation.design.art?.dress;
    const looks = data.events.filter((e) => e.dressCode && e.dressCode.swatches.length > 0);
    if (looks.length === 0 && !editing) return null;
    const second = data.invitation.locales.find((l) => l !== locale);
    return (
        <section className="px-6 py-20 text-center">
            <SectionTitle>{copy('dressCode')}</SectionTitle>
            {art && (
                <Reveal from="blur" className="mx-auto mb-10 max-w-md">
                    <img src={photoUrl(art)} alt="" loading="lazy" className="w-full" />
                </Reveal>
            )}
            <ul className="mx-auto max-w-lg divide-y divide-(--inv-gold)/35 border-b border-(--inv-gold)/35 text-start">
                {looks.map((e, i) => {
                    const title = t(e.title) || eventLabel(data.invitation.culture, e.kind, locale);
                    const native = second
                        ? eventLabel(data.invitation.culture, e.kind, second)
                        : '';
                    return (
                        <li key={e.id} className="py-5">
                            <Reveal
                                delay={i * 90}
                                className="flex items-center justify-between gap-4"
                            >
                                <div className="min-w-0">
                                    <p className="text-[clamp(1.15rem,5cqw,1.45rem)]">
                                        {title}
                                        {native && native !== title && (
                                            <span className="ms-2 text-[0.8em] text-(--inv-gold)">
                                                {native}
                                            </span>
                                        )}
                                    </p>
                                    {e.dressCode?.note && (
                                        <p className="mt-1 text-[clamp(0.95rem,4cqw,1.1rem)] opacity-70">
                                            {t(e.dressCode.note)}
                                        </p>
                                    )}
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    {e.dressCode?.swatches.map((c) => (
                                        <span
                                            key={c}
                                            className="size-[clamp(1.8rem,8cqw,2.4rem)] rounded-full shadow-[inset_0_-3px_6px_rgba(0,0,0,0.25)] ring-2 ring-white/35"
                                            style={{ background: c }}
                                        />
                                    ))}
                                </div>
                            </Reveal>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
