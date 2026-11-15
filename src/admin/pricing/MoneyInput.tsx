import { baseCurrencies, type BaseCurrency, type PriceMap } from '@shared/pricing';

import { Input } from '@/components/ui/input';

const symbol: Record<BaseCurrency, string> = {
    INR: '₹',
    USD: '$',
};

// Typed in whole rupees / dollars; stored in minor units (paise, cents).
export type PriceDraft = Record<BaseCurrency, string>;

export const toDraft = (map: PriceMap | null | undefined): PriceDraft => {
    const draft: PriceDraft = {
        INR: '',
        USD: '',
    };
    for (const c of baseCurrencies) {
        const v = map?.[c];
        draft[c] = v === undefined ? '' : String(v / 100);
    }
    return draft;
};

// Empty boxes are left out; all empty → null (nothing set).
export function fromDraft(draft: PriceDraft): PriceMap | null {
    const map: PriceMap = {};
    for (const c of baseCurrencies) {
        const v = Math.round(Number(draft[c]) * 100);
        if (draft[c].trim() !== '' && Number.isFinite(v) && v > 0) map[c] = v;
    }
    return Object.keys(map).length ? map : null;
}

interface MoneyInputsProps {
    value: PriceDraft;
    onChange: (next: PriceDraft) => void;
    // Shown greyed in an empty box, e.g. the default price.
    placeholders?: Partial<Record<BaseCurrency, number>>;
    label: string;
}

// ₹ for India, $ for everyone else (shown to them in their own currency).
export function MoneyInputs({ value, onChange, placeholders, label }: MoneyInputsProps) {
    return (
        <div className="grid grid-cols-2 gap-2">
            {baseCurrencies.map((c) => {
                const hint = placeholders?.[c];
                return (
                    <label
                        key={c}
                        className="flex h-8 items-center gap-1.5 rounded-control border bg-card ps-2.5 pe-1 focus-within:ring-2 focus-within:ring-ring/40"
                    >
                        <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                            {symbol[c]}
                        </span>
                        <Input
                            inputMode="decimal"
                            aria-label={`${label} in ${c}`}
                            value={value[c]}
                            placeholder={hint === undefined ? '—' : String(hint / 100)}
                            onChange={(e) => {
                                onChange({
                                    ...value,
                                    [c]: e.target.value.replace(/[^\d.]/g, ''),
                                });
                            }}
                            className="h-7 border-0 px-0 shadow-none focus-visible:ring-0"
                        />
                    </label>
                );
            })}
        </div>
    );
}
