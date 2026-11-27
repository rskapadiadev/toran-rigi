// What the customer sends the studio: a few plain boxes and their files. A photo of a printed card
// can stand in for most of it.
import { BRIEF_FILE_MAX_BYTES } from '@shared/made';
import { type Brief, missingFromBrief, type MyMadeView } from '@shared/schemas/made';
import { FileText, ImageIcon, Loader2, Music, Paperclip, Send, Trash2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { toast } from 'sonner';

import { FormField } from '@/admin/kit/form';
import { Panel } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { addFile, removeFile, saveBrief, sendBrief, useMadeAction } from './data';

interface Box {
    key: keyof Brief;
    label: string;
    hint: string;
    placeholder: string;
    rows: number;
}

const boxes: Box[] = [
    {
        key: 'names',
        label: 'Names',
        hint: 'Exactly as they should be written.',
        placeholder: 'e.g. Riya Shah & Kabir Mehta',
        rows: 1,
    },
    {
        key: 'functions',
        label: 'Ceremonies',
        hint: 'One a line: what it is, the day and time, and where.',
        placeholder:
            'e.g. Haldi · Fri 22 Jan, 10 am · Our home, Surat\nWedding · Sat 23 Jan, 7 pm · Taj Lake Palace, Udaipur',
        rows: 4,
    },
    {
        key: 'families',
        label: 'Family',
        hint: 'Parents, grandparents or whoever is inviting.',
        placeholder: 'e.g. Daughter of Meena & Raj Shah, granddaughter of…',
        rows: 3,
    },
    {
        key: 'words',
        label: 'Words you’d like on it',
        hint: 'A blessing, a welcome, or your own lines. Leave it empty and we’ll suggest some.',
        placeholder: 'e.g. With the blessings of our elders, we invite you…',
        rows: 3,
    },
    {
        key: 'languages',
        label: 'Languages',
        hint: 'English, and any others.',
        placeholder: 'e.g. English and Gujarati',
        rows: 1,
    },
    {
        key: 'notes',
        label: 'Anything else',
        hint: 'Colours, a deity above your names, the song you’d like, who guests can call.',
        placeholder: 'e.g. Please put Ganesha above our names…',
        rows: 3,
    },
];

const kindIcon: Partial<Record<string, typeof FileText>> = {
    photo: ImageIcon,
    music: Music,
    document: FileText,
};

const size = (bytes: number) =>
    bytes > 1_000_000
        ? `${(bytes / 1_000_000).toFixed(1)} MB`
        : `${String(Math.max(1, Math.round(bytes / 1000)))} KB`;

interface BriefFormProps {
    id: string;
    view: MyMadeView;
}

export function BriefForm({ id, view }: BriefFormProps) {
    const [brief, setBrief] = useState<Brief>(view.brief);
    const [saved, setSaved] = useState(view.brief);
    const [sending, setSending] = useState<string | null>(null);
    const picker = useRef<HTMLInputElement>(null);
    const pickerId = useId();
    const save = useMadeAction(id, saveBrief);
    const send = useMadeAction(id, sendBrief);
    const remove = useMadeAction(id, removeFile);
    const added = useMadeAction(id, addFile);
    const dirty = JSON.stringify(brief) !== JSON.stringify(saved);
    const missing = missingFromBrief(brief, view.files.length);

    const failed = (e: Error) => toast.error(e.message);

    const keep = () => {
        save.mutate(brief, {
            onSuccess: () => {
                setSaved(brief);
                toast.success('Saved. Send it when it’s all there');
            },
            onError: (e) => toast.error(e.message),
        });
    };

    // One at a time, so a slow connection shows where it is and one bad file doesn't stop the rest.
    const attach = async (files: FileList | null) => {
        const list = [...(files ?? [])];
        for (const [i, file] of list.entries()) {
            if (file.size > BRIEF_FILE_MAX_BYTES) {
                toast.error(`${file.name} is over 20 MB`);
                continue;
            }
            setSending(`Sending ${String(i + 1)} of ${String(list.length)}…`);
            await added.mutateAsync(file).catch((e: unknown) => {
                toast.error(e instanceof Error ? `${file.name}: ${e.message}` : file.name);
            });
        }
        setSending(null);
        if (picker.current) picker.current.value = '';
    };

    return (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <Panel
                title="Your details"
                description="Write it the way you’d tell us on the phone. We’ll ask if anything is unclear."
            >
                <div className="space-y-5">
                    {boxes.map((box) => (
                        <FormField key={box.key} label={box.label} description={box.hint}>
                            {(fieldId) => (
                                <Textarea
                                    id={fieldId}
                                    rows={box.rows}
                                    value={brief[box.key]}
                                    placeholder={box.placeholder}
                                    maxLength={box.key === 'names' ? 300 : 4000}
                                    className="min-h-0 resize-y"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setBrief((b) => ({
                                            ...b,
                                            [box.key]: value,
                                        }));
                                    }}
                                />
                            )}
                        </FormField>
                    ))}
                </div>
            </Panel>
            <div className="space-y-4 xl:sticky xl:top-0 xl:self-start">
                <Panel
                    title="Photos and files"
                    icon={Paperclip}
                    description="Your photos, a picture of your printed card, a PDF, or your song. Up to 20 MB each."
                >
                    <input
                        ref={picker}
                        id={pickerId}
                        type="file"
                        multiple
                        accept="image/*,.heic,.heif,application/pdf,audio/mpeg,audio/mp4,.m4a"
                        className="sr-only"
                        onChange={(e) => {
                            void attach(e.target.files);
                        }}
                    />
                    <label
                        htmlFor={pickerId}
                        className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed px-4 py-6 text-center text-sm transition hover:border-primary/50 hover:bg-primary/[0.03]"
                    >
                        {sending ? (
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                        ) : (
                            <Paperclip className="size-5 text-muted-foreground" />
                        )}
                        <span className="font-medium">{sending ?? 'Add files'}</span>
                        <span className="text-xs text-muted-foreground">
                            Tap to choose, several at once is fine
                        </span>
                    </label>
                    {view.files.length > 0 && (
                        <ul className="mt-3 divide-y rounded-lg ring-1 ring-foreground/10">
                            {view.files.map((f) => {
                                const Icon = kindIcon[f.kind] ?? FileText;
                                return (
                                    <li key={f.id} className="flex items-center gap-2.5 px-3 py-2">
                                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                                        <a
                                            href={`/api/store/me/invitations/${id}/made/files/${f.id}`}
                                            className="min-w-0 flex-1 truncate text-sm hover:underline"
                                        >
                                            {f.name}
                                        </a>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {size(f.size)}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 shrink-0"
                                            aria-label={`Remove ${f.name}`}
                                            disabled={remove.isPending}
                                            onClick={() => {
                                                remove.mutate(f.id, { onError: failed });
                                            }}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Panel>
                <Panel title="Send it to us">
                    <p className="text-sm text-muted-foreground">
                        Your first look comes within 48 hours of everything we need. Until you send
                        it, you can keep adding.
                    </p>
                    {missing && <p className="mt-3 text-sm text-warning">{missing}.</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                            disabled={missing !== null || send.isPending || sending !== null}
                            onClick={() => {
                                send.mutate(brief, {
                                    onSuccess: () => {
                                        toast.success(
                                            'Sent. We’ll write when your first look is ready',
                                        );
                                    },
                                    onError: (e) => toast.error(e.message),
                                });
                            }}
                        >
                            {send.isPending ? <Loader2 className="animate-spin" /> : <Send />}
                            Send to the studio
                        </Button>
                        <Button
                            variant="outline"
                            disabled={!dirty || save.isPending}
                            onClick={keep}
                        >
                            {dirty ? 'Save for later' : 'Saved'}
                        </Button>
                    </div>
                </Panel>
            </div>
        </div>
    );
}
