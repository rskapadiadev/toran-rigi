import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Globe, Lock, Rocket, Save } from 'lucide-react';
import { toast } from 'sonner';

import { CopyField } from '@/admin/kit/form';
import { useMe } from '@/admin/useMe';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ApiError, patch } from '@/lib/api';
import { DownloadPdf } from '@/shop/DownloadPdf';

import type { EditableInvitation } from '../composer/draft';

interface StatusChange {
    status: string;
    override?: boolean;
}

const failure = (error: unknown) =>
    error instanceof ApiError ? error.message : 'Something went wrong';

interface PublishPanelProps {
    id: string;
    data: EditableInvitation;
    // Unsaved edits block publishing so guests never see a half-saved invitation.
    dirty: boolean;
}

// Link, private preview and go-live controls (publishing is blocked while a balance is due).
export function PublishPanel({ id, data, dirty }: PublishPanelProps) {
    const client = useQueryClient();
    const me = useMe().data;
    const origin = window.location.origin;
    const liveUrl = `${origin}/${data.invitation.slug}`;
    const previewUrl = `${origin}/p/${data.invitation.previewToken}`;
    const published = data.invitation.status === 'published';

    const status = useMutation({
        mutationFn: (body: StatusChange) => patch(`/admin/invitations/${id}/status`, body),
        onSuccess: (_r, body) => {
            toast.success(
                body.status === 'published' ? 'Invitation is live ✦' : 'Invitation unpublished',
            );
            return client.invalidateQueries({ queryKey: ['invitation', id] });
        },
        onError: (e) => toast.error(failure(e)),
    });
    const slug = useMutation({
        mutationFn: (value: string) => patch(`/admin/invitations/${id}/slug`, { slug: value }),
        onSuccess: () => {
            toast.success('Link updated');
            return client.invalidateQueries({ queryKey: ['invitation', id] });
        },
        onError: (e) => toast.error(failure(e)),
    });
    const error = status.error ?? slug.error;

    return (
        <div className="space-y-5">
            <form
                className="space-y-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    const value = new FormData(e.currentTarget).get('slug');
                    if (typeof value === 'string') slug.mutate(value.trim().toLowerCase());
                }}
            >
                <Label htmlFor="slug" className="text-[13px] text-foreground/80">
                    Invitation link
                </Label>
                <InputGroup dir="ltr">
                    <InputGroupAddon>
                        <Globe />
                        <InputGroupText>{origin.replace(/^https?:\/\//, '')}/</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                        id="slug"
                        name="slug"
                        defaultValue={data.invitation.slug}
                        key={data.invitation.slug}
                        className="ps-0.5 font-mono"
                    />
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton type="submit" variant="secondary" size="xs">
                            Change
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </form>
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <p className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="size-3.5 text-muted-foreground" /> Private preview for the
                    family
                </p>
                <CopyField value={previewUrl} label="Preview link" className="bg-card" />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                <p className="text-sm">
                    <span className="font-medium">PDF copy</span>
                    <span className="block text-xs text-muted-foreground">
                        {data.invitation.extras.pdf?.enabled
                            ? 'Guests can download it from the invitation too.'
                            : 'The couple have it on their Cards page. Switch on PDF for guests in Extras to share it there.'}
                    </span>
                </p>
                <DownloadPdf
                    invitationId={id}
                    slug={data.invitation.slug}
                    endpoint={`/api/admin/invitations/${id}/pdf`}
                />
            </div>
            <Separator />
            {dirty && (
                <Alert className="border-gold/40 bg-gold/5">
                    <Save />
                    <AlertTitle>Unsaved changes</AlertTitle>
                    <AlertDescription>Save your changes before publishing.</AlertDescription>
                </Alert>
            )}
            {error && (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
                    <AlertTitle>Couldn’t update</AlertTitle>
                    <AlertDescription>{failure(error)}</AlertDescription>
                </Alert>
            )}
            <div className="flex flex-col gap-2">
                {!published ? (
                    <Button
                        disabled={dirty || status.isPending}
                        onClick={() => {
                            status.mutate({ status: 'published' });
                        }}
                    >
                        <Rocket /> Publish invitation
                    </Button>
                ) : (
                    <>
                        <Button variant="gold" asChild>
                            <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink /> Open live invitation
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                status.mutate({ status: 'draft' });
                            }}
                        >
                            Unpublish
                        </Button>
                    </>
                )}
                {!published && me?.role !== 'designer' && (
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={dirty}
                        onClick={() => {
                            status.mutate({
                                status: 'published',
                                override: true,
                            });
                        }}
                    >
                        Publish with balance due (owner)
                    </Button>
                )}
            </div>
            {data.invitation.expiresAt && (
                <p className="text-xs text-muted-foreground">
                    Hosting until {new Date(data.invitation.expiresAt).toLocaleDateString()}.
                </p>
            )}
        </div>
    );
}
