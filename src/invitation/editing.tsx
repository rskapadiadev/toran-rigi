import type { SectionType } from '@shared/types';
import { createContext, type KeyboardEvent, use } from 'react';

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

export interface EditSettings {
    selected: SectionType | null;
    // `event` is the ceremony index when a ceremony card was clicked.
    select: (type: SectionType, detail?: { event?: number }) => void;
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

// Text guests read, typed on directly in the editor. Commits on blur (Enter commits single lines),
// so React never re-renders under the caret while someone is typing.
export function Editable({ path, children, multiline = false, className }: EditableProps) {
    const edit = useEditing();
    if (!edit) return <>{children}</>;
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
        <span
            role="textbox"
            tabIndex={0}
            aria-label="Edit text"
            aria-multiline={multiline}
            contentEditable
            suppressContentEditableWarning
            spellCheck
            data-editable={path}
            onBlur={(e) => {
                commit(e.currentTarget);
            }}
            onKeyDown={onKeyDown}
            className={className}
        >
            {children || (multiline ? 'Type here…' : 'Type here')}
        </span>
    );
}
