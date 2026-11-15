import { fillCss } from '@shared/text-style';
import type { SectionType } from '@shared/types';
import { useInView } from 'motion/react';
import {
    createContext,
    type CSSProperties,
    type KeyboardEvent,
    type ReactNode,
    use,
    useRef,
} from 'react';

import { useInvite } from './context';

// Content the canvas can edit in place. Event fields carry the ceremony's index.
export type TextPath =
    | 'headline'
    | 'welcome'
    | 'story'
    | 'family'
    | 'closing'
    | 'people.one.name'
    | 'people.two.name'
    | `events.${number}.title`
    | `events.${number}.venue`
    | `events.${number}.address`;

export const eventPath = (index: number, field: 'title' | 'venue' | 'address') =>
    `events.${String(index)}.${field}` as TextPath;

export interface SelectDetail {
    event?: number;
    photo?: boolean;
    // The section frame that was clicked (see photoSlots).
    slot?: string;
    // The text that was clicked: its style opens in the right pane.
    text?: TextPath;
}

export interface EditSettings {
    selected: SectionType | null;
    selectedText: TextPath | null;
    // `event` is the ceremony index when a ceremony card was clicked; `photo` when a photo was.
    select: (type: SectionType, detail?: SelectDetail) => void;
    label: (type: SectionType) => string;
    // Why a section has nothing to show yet (shown as a placeholder in the editor).
    hint: (type: SectionType) => string;
    editText: (path: TextPath, value: string) => void;
}

// Present only inside the visual editor; guests never get it, so every hook below is a no-op for them.
export const EditContext = createContext<EditSettings | null>(null);

export const useEditing = () => use(EditContext);

interface EditableProps {
    path: TextPath;
    children: string;
    multiline?: boolean;
    className?: string;
}

interface StyledProps {
    path: TextPath;
    children: ReactNode;
}

// Applies the editor's per-text style (for guests too): the highlight on an outer span, the
// letters' own fill on an inner one, so a gradient highlight and gradient letters can coexist.
function Styled({ path, children }: StyledProps) {
    const { data } = useInvite();
    const style = data.invitation.content.textStyles?.[path];
    const ref = useRef<HTMLSpanElement>(null);
    const seen = useInView(ref, {
        once: true,
        margin: '0px 0px -10% 0px',
    });
    if (!style) return <>{children}</>;
    const fonts: Record<string, string | undefined> = {
        display: 'var(--inv-display)',
        script: 'var(--inv-script, var(--inv-display))',
        body: 'var(--inv-body)',
    };
    const color = style.color;
    const outer: CSSProperties = style.background
        ? {
              background: fillCss(style.background),
              padding: '0.04em 0.3em',
              borderRadius: `${String(style.radius ?? 0.2)}em`,
              boxDecorationBreak: 'clone',
              WebkitBoxDecorationBreak: 'clone',
          }
        : {};
    const inner: CSSProperties = {
        fontWeight: style.bold ? 700 : undefined,
        fontStyle: style.italic ? 'italic' : undefined,
        textDecoration: style.underline ? 'underline' : undefined,
        textUnderlineOffset: style.underline ? '0.15em' : undefined,
        textTransform: style.caps ? 'uppercase' : undefined,
        fontFamily: style.font ? fonts[style.font] : undefined,
        fontSize: style.size ? `${String(style.size)}em` : undefined,
        letterSpacing: style.tracking === undefined ? undefined : `${String(style.tracking)}em`,
        ...(color?.kind === 'solid' && {
            color: color.color,
            WebkitTextFillColor: color.color,
        }),
        ...(color?.kind === 'gradient' && {
            backgroundImage: fillCss(color),
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        }),
    };
    const animation = style.animation && style.animation !== 'none' ? style.animation : undefined;
    return (
        <span
            ref={ref}
            style={outer}
            className={animation ? `inv-tx inv-tx-${animation}` : undefined}
            data-seen={seen || undefined}
        >
            <span style={inner}>{children}</span>
        </span>
    );
}

// Text guests read, typed on directly in the editor. Commits on blur (Enter commits single lines),
// so React never re-renders under the caret while someone is typing.
export function Editable({ path, children, multiline = false, className }: EditableProps) {
    const edit = useEditing();
    if (!edit) return <Styled path={path}>{children}</Styled>;
    const commit = (el: HTMLElement) => {
        const next = el.innerText.replace(/\u00a0/g, ' ').trim();
        if (next !== children) edit.editText(path, next);
    };
    const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
        if (e.key === 'Escape' || (!multiline && e.key === 'Enter')) {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };
    return (
        <Styled path={path}>
            <span
                role="textbox"
                tabIndex={0}
                aria-label="Edit text"
                aria-multiline={multiline}
                contentEditable
                suppressContentEditableWarning
                spellCheck
                data-editable={path}
                data-text-selected={edit.selectedText === path || undefined}
                onBlur={(e) => {
                    commit(e.currentTarget);
                }}
                onKeyDown={onKeyDown}
                className={className}
            >
                {children || (multiline ? 'Type here…' : 'Type here')}
            </span>
        </Styled>
    );
}
