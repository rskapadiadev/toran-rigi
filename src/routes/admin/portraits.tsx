// The AI photo lab: the founders try both portrait models on their own photos, scene by scene,
// side by side, before customers ever see the feature. Nothing is saved anywhere.
import { lookPalettes } from '@shared/looks';
import {
    MAX_REFERENCES,
    type PortraitProvider,
    portraitProviders,
    portraitScenes,
    providerInfo,
    REFERENCE_EDGE,
} from '@shared/portraits';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Download, ImagePlus, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';

import { PanelCard } from '@/admin/kit/card';
import { PageHeader, Panel } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/portraits')({
    ssr: false,
    head: () => ({ meta: [{ title: 'AI photo lab · Toran Studio' }] }),
    component: PortraitLab,
});

interface Picked {
    id: string;
    url: string;
    file: File;
}

interface Result {
    image?: string;
    ms?: number;
    error?: string;
    busy?: boolean;
}

interface Made {
    image: string;
    ms: number;
}

// Each model wants its own size of reference photo; the browser makes both.
async function shrink(file: File, edge: number): Promise<Blob> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Could not read this photo'));
            },
            'image/jpeg',
            0.9,
        );
    });
}

const scenesWithDesign = [
    ...portraitScenes.map((s) => ({
        id: s.id,
        label: s.label,
    })),
    {
        id: 'design',
        label: 'In an invitation’s style',
    },
];

const motifs = ['paisley', 'lotus', 'marigold', 'arch'];

function PortraitLab() {
    const base = useId();
    const { data: ready } = useQuery({
        queryKey: ['portrait-providers'],
        queryFn: () => api<Record<PortraitProvider, boolean>>('/admin/portraits/providers'),
    });
    const [photos, setPhotos] = useState<Picked[]>([]);
    const [consent, setConsent] = useState(false);
    const [scenes, setScenes] = useState<string[]>(['palace', 'garden']);
    const [models, setModels] = useState<PortraitProvider[]>(['flux', 'gemini']);
    const [palette, setPalette] = useState(lookPalettes[7]?.id ?? 'wine');
    const [motif, setMotif] = useState('paisley');
    const [results, setResults] = useState<Record<string, Result>>({});
    const [running, setRunning] = useState(false);

    const usable = models.filter((m) => ready?.[m]);
    const count = scenes.length * usable.length;
    const toggle = <T,>(list: T[], item: T) =>
        list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

    const run = async () => {
        setRunning(true);
        setResults({});
        const sized = await Promise.all(
            usable.map(
                async (m) =>
                    [
                        m,
                        await Promise.all(photos.map((p) => shrink(p.file, REFERENCE_EDGE[m]))),
                    ] as const,
            ),
        );
        for (const scene of scenes)
            for (const [model, blobs] of sized) {
                const key = `${scene}:${model}`;
                setResults((r) => ({
                    ...r,
                    [key]: { busy: true },
                }));
                const form = new FormData();
                form.append('provider', model);
                form.append('scene', scene);
                form.append('consent', 'yes');
                if (scene === 'design') {
                    form.append(
                        'colours',
                        (lookPalettes.find((p) => p.id === palette)?.colors ?? []).join(','),
                    );
                    form.append('motif', motif);
                }
                blobs.forEach((b, i) => {
                    form.append('photos', b, `photo-${String(i)}.jpg`);
                });
                try {
                    const made = await api<Made>('/admin/portraits/try', {
                        method: 'POST',
                        body: form,
                    });
                    setResults((r) => ({
                        ...r,
                        [key]: made,
                    }));
                } catch (e) {
                    setResults((r) => ({
                        ...r,
                        [key]: { error: e instanceof Error ? e.message : 'Failed' },
                    }));
                }
            }
        setRunning(false);
    };

    return (
        <>
            <PageHeader
                title="AI photo lab"
                description="Try both photo models on your own photos before customers get them. Nothing is saved; only the photos and the scene are sent."
            />
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
                <Panel title="Your photos" contentClassName="space-y-5">
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                            A clear photo of each of you, face to the camera. Up to {MAX_REFERENCES}
                            .
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {photos.map((p) => (
                                <div
                                    key={p.id}
                                    className="relative size-20 overflow-hidden rounded-md ring-1 ring-foreground/10"
                                >
                                    <img src={p.url} alt="" className="size-full object-cover" />
                                    <Button
                                        size="icon-sm"
                                        variant="secondary"
                                        aria-label="Remove photo"
                                        className="absolute end-1 top-1 size-6"
                                        onClick={() => {
                                            setPhotos((all) => all.filter((x) => x.id !== p.id));
                                        }}
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            ))}
                            {photos.length < MAX_REFERENCES && (
                                <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground hover:text-foreground">
                                    <ImagePlus className="size-5" />
                                    Add
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        className="sr-only"
                                        aria-label="Add photos"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files ?? []);
                                            setPhotos((all) =>
                                                [
                                                    ...all,
                                                    ...files.map((file) => ({
                                                        id: crypto.randomUUID(),
                                                        url: URL.createObjectURL(file),
                                                        file,
                                                    })),
                                                ].slice(0, MAX_REFERENCES),
                                            );
                                            e.target.value = '';
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                        <Checkbox
                            id={`${base}-consent`}
                            checked={consent}
                            onCheckedChange={(v) => {
                                setConsent(v === true);
                            }}
                        />
                        <Label htmlFor={`${base}-consent`} className="leading-snug font-normal">
                            These are photos of us, we’re both 18 or older, and we both agree to
                            them going to the photo models for this test.
                        </Label>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            Scenes
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {scenesWithDesign.map((s) => (
                                <Button
                                    key={s.id}
                                    size="sm"
                                    variant={scenes.includes(s.id) ? 'secondary' : 'outline'}
                                    aria-pressed={scenes.includes(s.id)}
                                    onClick={() => {
                                        setScenes((all) => toggle(all, s.id));
                                    }}
                                >
                                    {s.label}
                                </Button>
                            ))}
                        </div>
                        {scenes.includes('design') && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                <select
                                    aria-label="Invitation colours"
                                    value={palette}
                                    className="h-8 rounded-control border bg-card px-2 text-sm"
                                    onChange={(e) => {
                                        setPalette(e.target.value);
                                    }}
                                >
                                    {lookPalettes.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    aria-label="Motif"
                                    value={motif}
                                    className="h-8 rounded-control border bg-card px-2 text-sm"
                                    onChange={(e) => {
                                        setMotif(e.target.value);
                                    }}
                                >
                                    {motifs.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            Models
                        </p>
                        {portraitProviders.map((m) => (
                            <div key={m} className="flex items-center gap-2.5">
                                <Checkbox
                                    id={`${base}-${m}`}
                                    checked={models.includes(m) && ready?.[m] === true}
                                    disabled={!ready?.[m]}
                                    onCheckedChange={() => {
                                        setModels((all) => toggle(all, m));
                                    }}
                                />
                                <Label htmlFor={`${base}-${m}`} className="font-normal">
                                    {providerInfo[m].label}
                                    {ready && !ready[m] && (
                                        <span className="ms-1 text-xs text-muted-foreground">
                                            (
                                            {m === 'gemini'
                                                ? 'add GEMINI_API_KEY'
                                                : 'add the Cloudflare AI keys'}
                                            )
                                        </span>
                                    )}
                                </Label>
                            </div>
                        ))}
                    </div>

                    <Button
                        className="w-full"
                        disabled={
                            running ||
                            !consent ||
                            photos.length === 0 ||
                            scenes.length === 0 ||
                            usable.length === 0
                        }
                        onClick={() => {
                            void run().catch((e: unknown) => {
                                setRunning(false);
                                toast.error(e instanceof Error ? e.message : 'Failed');
                            });
                        }}
                    >
                        {running ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        Make {count} {count === 1 ? 'photo' : 'photos'}
                    </Button>
                </Panel>

                <PanelCard title="Side by side">
                    {scenes.length === 0 || Object.keys(results).length === 0 ? (
                        <p className="p-6 text-center text-sm text-muted-foreground">
                            Each scene appears here once from each model, so you can judge which
                            keeps your faces best.
                        </p>
                    ) : (
                        <div className="space-y-6 p-4">
                            {scenes.map((scene) => (
                                <div key={scene} className="space-y-2">
                                    <p className="text-sm font-medium">
                                        {scenesWithDesign.find((s) => s.id === scene)?.label}
                                    </p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {usable.map((m) => {
                                            const r = results[`${scene}:${m}`];
                                            return (
                                                <figure
                                                    key={m}
                                                    className="space-y-1.5 rounded-lg bg-muted/40 p-2 ring-1 ring-foreground/10"
                                                >
                                                    <div
                                                        className={cn(
                                                            'flex aspect-[4/5] items-center justify-center overflow-hidden rounded-md bg-muted',
                                                        )}
                                                    >
                                                        {r?.image ? (
                                                            <img
                                                                src={r.image}
                                                                alt={`${providerInfo[m].label}: ${scene}`}
                                                                className="size-full object-cover"
                                                            />
                                                        ) : r?.error ? (
                                                            <p className="p-4 text-center text-xs text-destructive">
                                                                {r.error}
                                                            </p>
                                                        ) : (
                                                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <figcaption className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                                        <span>
                                                            {providerInfo[m].label}
                                                            {r?.ms !== undefined &&
                                                                ` · ${(r.ms / 1000).toFixed(1)} s`}
                                                        </span>
                                                        {r?.image && (
                                                            <a
                                                                href={r.image}
                                                                download={`toran-${scene}-${m}`}
                                                                aria-label="Download this photo"
                                                                className="rounded p-1 hover:bg-foreground/10"
                                                            >
                                                                <Download className="size-3.5" />
                                                            </a>
                                                        )}
                                                    </figcaption>
                                                </figure>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </PanelCard>
            </div>
        </>
    );
}
