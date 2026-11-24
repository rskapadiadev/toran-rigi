// Every card that comes with an invitation, drawn live from its words, each ready to download. Used
// by the couple's Cards page and by the studio.
import { type CardInfo, faceSize } from '@shared/cards';
import type { Side } from '@shared/guests';
import { localeNames } from '@shared/locales';
import { Download, FileDown, Loader2, Lock } from 'lucide-react';
import { lazy, type ReactNode, Suspense, useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { firstName } from '@/shop/guests/model';

import { type CardsChoice, cardsQuery, type CardsSet, saveFile } from './model';

// The ceremony drawings are heavy: they load with the cards, not with the page.
const CardView = lazy(() =>
    import('@/invitation/cards/CardView').then((mod) => ({ default: mod.CardView })),
);

interface CardsGridProps {
    base: string;
    set: CardsSet;
    choice: CardsChoice;
    onChoice: (choice: CardsChoice) => void;
    // The shop's round buttons, or the studio's own.
    buttonClass?: string;
}

interface FamilyChoice {
    who: Side | null;
    label: string;
}

const hints: Record<CardInfo['kind'], string> = {
    save: 'For WhatsApp and Instagram, before the invitation',
    invite: 'To send as a picture',
    print: 'For the print shop, with bleed and crop marks',
    event: 'For this function’s guests',
    story: 'For your status and stories',
};

export function CardsGrid({ base, set, choice, onChoice, buttonClass = '' }: CardsGridProps) {
    const [busy, setBusy] = useState<string | null>(null);
    const query = cardsQuery({
        who: choice.who,
        lang: set.version.lang,
    });
    const save = async (key: string, path: string) => {
        setBusy(key);
        try {
            await saveFile(`${base}${path}${query}`);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Something went wrong');
        } finally {
            setBusy(null);
        }
    };
    const families: FamilyChoice[] = [
        {
            who: null,
            label: 'Main',
        },
        ...(set.names.two
            ? [
                  {
                      who: 'one' as const,
                      label: `${firstName(set.names.one)}’s family`,
                  },
                  {
                      who: 'two' as const,
                      label: `${firstName(set.names.two)}’s family`,
                  },
              ]
            : []),
    ];
    const isPrivate = (card: CardInfo) =>
        set.functions.find((f) => f.id === card.eventId)?.private === true;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                {families.length > 1 && (
                    <Choices
                        label="Whose"
                        options={families.map((f) => ({
                            key: f.who ?? 'main',
                            label: f.label,
                            on: choice.who === f.who,
                            pick: () => {
                                onChoice({
                                    ...choice,
                                    who: f.who,
                                });
                            },
                        }))}
                    />
                )}
                {set.locales.length > 1 && (
                    <Choices
                        label="Language"
                        options={set.locales.map((l) => ({
                            key: l,
                            label: localeNames[l as keyof typeof localeNames],
                            on: set.version.lang === l,
                            pick: () => {
                                onChoice({
                                    ...choice,
                                    lang: l,
                                });
                            },
                        }))}
                    />
                )}
                <div className="flex flex-wrap gap-2 sm:ms-auto">
                    <Button
                        variant="outline"
                        className={buttonClass}
                        disabled={!set.ready || busy !== null}
                        onClick={() => {
                            void save('pdf', '/pdf');
                        }}
                    >
                        {busy === 'pdf' ? <Loader2 className="animate-spin" /> : <FileDown />}
                        {busy === 'pdf' ? 'Preparing…' : 'Invitation PDF'}
                    </Button>
                    <Button
                        className={buttonClass}
                        disabled={!set.ready || busy !== null}
                        onClick={() => {
                            void save('all', '/cards/all.zip');
                        }}
                    >
                        {busy === 'all' ? <Loader2 className="animate-spin" /> : <Download />}
                        {busy === 'all' ? 'Preparing them all…' : 'Download all'}
                    </Button>
                </div>
            </div>
            <ul className="grid grid-cols-2 items-start gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                {set.cards.map((card) => (
                    <li key={card.id} className="space-y-2.5">
                        <Preview card={card} set={set} />
                        <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{card.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {isPrivate(card)
                                        ? 'Private: send it only to its guests'
                                        : hints[card.kind]}
                                </p>
                                <p className="text-xs text-muted-foreground">{card.size}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className={cn('shrink-0', buttonClass)}
                                aria-label={`Download ${card.title}`}
                                disabled={!set.ready || busy !== null}
                                onClick={() => {
                                    void save(card.id, `/cards/${encodeURIComponent(card.id)}`);
                                }}
                            >
                                {busy === card.id ? (
                                    <Loader2 className="animate-spin" />
                                ) : set.ready ? (
                                    <Download />
                                ) : (
                                    <Lock />
                                )}
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

interface Choice {
    key: string;
    label: string;
    on: boolean;
    pick: () => void;
}

interface ChoicesProps {
    label: string;
    options: Choice[];
}

function Choices({ label, options }: ChoicesProps) {
    return (
        <div
            role="group"
            aria-label={label}
            className="flex flex-wrap gap-1 rounded-full bg-black/5 p-1"
        >
            {options.map((o) => (
                <button
                    key={o.key}
                    type="button"
                    aria-pressed={o.on}
                    onClick={o.pick}
                    className={cn(
                        'rounded-full px-3 py-1.5 text-xs transition',
                        o.on ? 'bg-foreground text-background' : 'text-foreground/80',
                    )}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

interface PreviewProps {
    card: CardInfo;
    set: CardsSet;
}

// Print shows both sides, the way they come back from the printer.
function Preview({ card, set }: PreviewProps) {
    const event = set.functions.find((f) => f.id === card.eventId)?.data;
    const data = event
        ? {
              ...set.data,
              events: [event],
          }
        : set.data;
    const draw = (face: CardInfo['face']) => (
        <Scaled face={face}>
            <CardView
                data={data}
                face={face}
                locale={set.version.lang}
                eventId={card.eventId}
                link={set.link}
            />
        </Scaled>
    );
    if (card.kind === 'print')
        return (
            <div className="relative pe-[14%] pb-[14%]">
                {draw('front')}
                <div className="absolute end-0 bottom-0 w-[58%]">{draw('back')}</div>
            </div>
        );
    return draw(card.face);
}

interface ScaledProps {
    face: CardInfo['face'];
    children: ReactNode;
}

// A card keeps its own size and is scaled to the space it has, so what you see is what is made.
function Scaled({ face, children }: ScaledProps) {
    const { width, height } = faceSize[face];
    const hold = useCallback(
        (el: HTMLDivElement | null) => {
            if (!el) return;
            const inner = el.firstElementChild as HTMLElement | null;
            const fit = () => {
                if (inner) inner.style.transform = `scale(${String(el.clientWidth / width)})`;
            };
            fit();
            const observer = new ResizeObserver(fit);
            observer.observe(el);
            return () => {
                observer.disconnect();
            };
        },
        [width],
    );
    const ratio = { aspectRatio: `${String(width)} / ${String(height)}` };
    const size = {
        width,
        height,
    };
    return (
        <div
            ref={hold}
            className="relative overflow-hidden rounded-md bg-black/5 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.45)]"
            style={ratio}
            dir="ltr"
            aria-hidden
        >
            <div className="absolute start-0 top-0 origin-top-left" style={size}>
                <Suspense fallback={null}>{children}</Suspense>
            </div>
        </div>
    );
}
