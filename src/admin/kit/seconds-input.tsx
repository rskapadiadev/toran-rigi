// A typed number of seconds beside a slider, for when the exact moment matters.
import { Input } from '@/components/ui/input';

interface Props {
    value: number;
    min: number;
    max: number;
    label: string;
    onChange: (seconds: number) => void;
}

export function SecondsInput({ value, min, max, label, onChange }: Props) {
    // Commits on Enter or leaving the box, so half-typed numbers ("0.") are never clamped mid-way.
    const commit = (raw: string) => {
        const v = Number(raw);
        if (raw.trim() === '' || !Number.isFinite(v)) return;
        onChange(Math.min(max, Math.max(min, Math.round(v * 10) / 10)));
    };
    return (
        <div className="flex shrink-0 items-center gap-1.5">
            <Input
                // Remounts when the slider moves, so the box always shows the current value.
                key={value}
                type="number"
                inputMode="decimal"
                aria-label={label}
                className="h-8 w-20"
                min={min}
                max={max}
                step={0.1}
                defaultValue={value.toFixed(1)}
                onBlur={(e) => {
                    commit(e.currentTarget.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') commit(e.currentTarget.value);
                }}
            />
            <span className="text-xs text-muted-foreground">s</span>
        </div>
    );
}
