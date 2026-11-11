import type { CSSProperties, ElementType, ReactNode } from 'react';

import { useInView } from './useInView';

interface RevealProps {
    as?: ElementType;
    children: ReactNode;
    className?: string;
    delay?: number;
    from?: 'up' | 'down' | 'scale' | 'blur';
}

const hidden: Record<NonNullable<RevealProps['from']>, string> = {
    up: 'translate-y-8 opacity-0',
    down: '-translate-y-8 opacity-0',
    scale: 'scale-95 opacity-0',
    blur: 'opacity-0 blur-md',
};

// IntersectionObserver + CSS transitions: zero animation-library cost for section reveals.
export function Reveal({
    as: Tag = 'div',
    children,
    className = '',
    delay = 0,
    from = 'up',
}: RevealProps) {
    const [ref, inView] = useInView<HTMLElement>({
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px',
    });
    const style: CSSProperties = { transitionDelay: `${delay}ms` };
    return (
        <Tag
            ref={ref}
            style={style}
            className={`transition-[opacity,transform,filter] duration-1000 ease-(--ease-silk) ${inView ? 'blur-0 translate-y-0 scale-100 opacity-100' : hidden[from]} ${className}`}
        >
            {children}
        </Tag>
    );
}
