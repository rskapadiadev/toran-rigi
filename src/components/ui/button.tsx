import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Slot } from 'radix-ui';

// PayD's rule: every button is one box — 32px tall, rounded-control (10px). The old size names still
// compile and render that box; `lg` is the one deliberate exception, a 48px opt-in for a screen's
// single tall action (login, checkout), like PayD's action-lg.
const BOX = 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5';

const buttonVariants = cva(
    "inline-flex shrink-0 items-center justify-center rounded-control border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                // Darken on hover: a faded brand fill reads as disabled.
                default:
                    'bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary),black_8%)]',
                // Tinted, not solid: a red slab outshouts the page it sits on.
                destructive:
                    'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
                outline:
                    'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary',
                ghost: 'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
                link: 'h-auto! px-0! text-primary underline underline-offset-4 hover:no-underline',
                gold: 'bg-gold text-night hover:bg-gold-bright',
            },
            size: {
                default: BOX,
                xs: BOX,
                sm: BOX,
                lg: 'h-12 gap-1.5 px-4 has-[>svg]:px-3.5',
                icon: 'size-8',
                'icon-xs': 'size-8',
                'icon-sm': 'size-8',
                'icon-lg': 'size-8',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function Button({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot.Root : 'button';

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
