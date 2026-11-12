import {
    categoryInfo,
    occasionCategories,
    type OccasionCategory,
    type OccasionId,
    occasionOf,
    occasionsIn,
} from '@shared/occasions';
import {
    Baby,
    Briefcase,
    Flame,
    Flower2,
    Heart,
    type LucideIcon,
    PartyPopper,
    Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const categoryIcon: Record<OccasionCategory, LucideIcon> = {
    celebrations: Heart,
    'new-beginnings': Baby,
    milestones: PartyPopper,
    faith: Flame,
    remembrance: Flower2,
    corporate: Briefcase,
    general: Sparkles,
};

interface OccasionSelectProps {
    id?: string;
    name?: string;
    value?: OccasionId;
    defaultValue?: OccasionId;
    onChange?: (value: OccasionId) => void;
    className?: string;
}

// Every occasion, grouped by family; adding a pack in shared/occasions.ts lists it here automatically.
export function OccasionSelect({
    id,
    name,
    value,
    defaultValue,
    onChange,
    className,
}: OccasionSelectProps) {
    return (
        <Select
            name={name}
            value={value}
            defaultValue={defaultValue}
            onValueChange={(v) => onChange?.(occasionOf(v).id)}
        >
            <SelectTrigger id={id} className={cn('w-full', className)}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[22rem]">
                {occasionCategories.map((category, i) => {
                    const Icon = categoryIcon[category];
                    return (
                        <SelectGroup key={category}>
                            {i > 0 && <SelectSeparator />}
                            <SelectLabel className="flex items-center gap-1.5 text-[11px] tracking-wide uppercase">
                                <Icon className="size-3.5" /> {categoryInfo[category].label}
                            </SelectLabel>
                            {occasionsIn(category).map((o) => (
                                <SelectItem key={o.id} value={o.id}>
                                    {o.name.en}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    );
                })}
            </SelectContent>
        </Select>
    );
}

// Compact label for tables: icon + occasion name, muted for remembrance so it never reads as festive.
export function OccasionBadge({ id }: { id: string }) {
    const occasion = occasionOf(id);
    const Icon = categoryIcon[occasion.category];
    return (
        <Badge variant="outline" className="gap-1 font-normal">
            <Icon className="size-3" />
            {occasion.name.en}
        </Badge>
    );
}
