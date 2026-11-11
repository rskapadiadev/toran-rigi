import { cultureOf, type CulturePack, pickText } from '@shared/cultures';
import { isRtl } from '@shared/locales';
import type { LocalizedText } from '@shared/types';
import { createContext, type ReactNode, use, useMemo, useState } from 'react';

import type { MotionTier } from '../motion/capability';
import type { GuestIdentity, PublicInvitationData } from './types';

interface InviteContextValue {
    data: PublicInvitationData;
    culture: CulturePack;
    locale: string;
    dir: 'ltr' | 'rtl';
    setLocale: (locale: string) => void;
    t: (text: LocalizedText | undefined) => string;
    tier: MotionTier;
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
    const value = useMemo<InviteContextValue>(
        () => ({
            data,
            culture: cultureOf(data.invitation.culture),
            locale,
            dir: isRtl(locale) ? 'rtl' : 'ltr',
            setLocale,
            t: (text) => pickText(text, locale),
            tier,
            guest,
        }),
        [data, locale, tier, guest],
    );
    return <InviteContext value={value}>{children}</InviteContext>;
}

export function useInvite(): InviteContextValue {
    const ctx = use(InviteContext);
    if (!ctx) throw new Error('useInvite must be used inside <InviteProvider>');
    return ctx;
}
