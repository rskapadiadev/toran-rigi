import { Check, Copy } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { toast } from 'sonner';

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

interface FormFieldProps {
    label: ReactNode;
    description?: ReactNode;
    className?: string;
    /** Receives the generated id so the control can be associated with its label. */
    children: (id: string) => ReactNode;
}

/** Label + control + help text, wired together for screen readers and getByLabel(). */
export function FormField({ label, description, className, children }: FormFieldProps) {
    const id = useId();
    return (
        <Field className={cn('gap-2', className)}>
            <FieldLabel htmlFor={id} className="text-[13px] font-medium text-foreground/80">
                {label}
            </FieldLabel>
            {children(id)}
            {description && <FieldDescription className="text-xs">{description}</FieldDescription>}
        </Field>
    );
}

interface CopyFieldProps {
    value: string;
    label: string;
    className?: string;
}

/** Read-only link with a copy button, e.g. portal and preview URLs. */
export function CopyField({ value, label, className }: CopyFieldProps) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success('Link copied');
        window.setTimeout(() => {
            setCopied(false);
        }, 1600);
    };
    return (
        <InputGroup className={className}>
            <InputGroupInput
                readOnly
                aria-label={label}
                value={value}
                dir="ltr"
                className="font-mono text-xs"
                onFocus={(e) => {
                    e.target.select();
                }}
            />
            <InputGroupAddon align="inline-end">
                <InputGroupButton
                    size="icon-xs"
                    aria-label={`Copy ${label.toLowerCase()}`}
                    onClick={() => void copy()}
                >
                    {copied ? <Check /> : <Copy />}
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    );
}
