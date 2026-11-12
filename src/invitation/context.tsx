import { cultureOf, type CulturePack, pickText } from '@shared/cultures';
import { isRtl } from '@shared/locales';
import {
    cappedMotion,
    isCouple,
    type MotionCeiling,
    occasionOf,
    type OccasionPack,
} from '@shared/occasions';
import { peopleOf } from '@shared/people';
import type { LocalizedText } from '@shared/types';
import { createContext, type ReactNode, use, useMemo, useState } from 'react';

import type { MotionTier } from '../motion/capability';
import { s, type StringKey } from './strings';
import type { GuestIdentity, PublicInvitationData } from './types';

export interface Names {
    one: string;
    // Empty when the occasion is about one person.
    two: string;
    // "Riya & Kabir" / "Aanya".
    title: string;
    initials: string[];
    honorific: string;
    // "1942 – 2026" for remembrance, else empty.
    lifeSpan: string;
}

const firstLetter = (name: string) => Array.from(name.trim())[0] ?? '';
const year = (iso: string | undefined) => iso?.slice(0, 4) ?? '';

interface InviteContextValue {
    data: PublicInvitationData;
    culture: CulturePack;
    occasion: OccasionPack;
    // Interface wording, re-worded by the occasion where it asks (a prayer meet never says "Joyfully accept").
    copy: (key: StringKey) => string;
    names: Names;
    locale: string;
    dir: 'ltr' | 'rtl';
    setLocale: (locale: string) => void;
    t: (text: LocalizedText | undefined) => string;
    // Device tier, lowered to 'lite' when the invitation's (occasion-capped) motion is calm.
    tier: MotionTier;
    motion: MotionCeiling;
    guest?: GuestIdentity;
}

const InviteContext = createContext<InviteContextValue | null>(null);

interface ProviderProps {
    data: PublicInvitationData;
    initialLocale?: string;
    tier: MotionTier;
    guest?: GuestIdentity;
    children: ReactNode;
}

export function InviteProvider({ data, initialLocale, tier, guest, children }: ProviderProps) {
    const locales = data.invitation.locales;
    const [locale, setLocale] = useState(
        initialLocale && locales.includes(initialLocale) ? initialLocale : (locales[0] ?? 'en'),
    );
    const value = useMemo<InviteContextValue>(() => {
        const occasion = occasionOf(data.invitation.eventKind);
        const overrides: Partial<Record<string, LocalizedText>> = occasion.copy;
        const people = peopleOf(data.invitation.content);
        const one = pickText(people.one.name, locale);
        // A stray second name on a single-person occasion is ignored, not shown.
        const two = isCouple(occasion) || people.two ? pickText(people.two?.name, locale) : '';
        const and = overrides.and ? pickText(overrides.and, locale) : s('and', locale);
        const span = [year(people.one.born), year(people.one.passed)].filter(Boolean);
        const motion = cappedMotion(data.invitation.design.motion, occasion);
        return {
            data,
            culture: cultureOf(data.invitation.culture),
            occasion,
            names: {
                one,
                two,
                title: two ? `${one} ${and} ${two}` : one,
                initials: [firstLetter(one), firstLetter(two)].filter(Boolean),
                honorific: pickText(people.one.honorific, locale),
                lifeSpan: span.length === 2 ? span.join(' – ') : '',
            },
            copy: (key) => {
                const text = overrides[key];
                return text ? pickText(text, locale) : s(key, locale);
            },
            locale,
            dir: isRtl(locale) ? 'rtl' : 'ltr',
            setLocale,
            t: (text) => pickText(text, locale),
            tier: motion === 'calm' && tier === 'full' ? 'lite' : tier,
            motion,
            guest,
        };
    }, [data, locale, tier, guest]);
    return <InviteContext value={value}>{children}</InviteContext>;
}

export function useInvite(): InviteContextValue {
    const ctx = use(InviteContext);
    if (!ctx) throw new Error('useInvite must be used inside <InviteProvider>');
    return ctx;
}
