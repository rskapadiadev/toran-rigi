// Publishing a template puts it in the catalogue orders start from; it never goes to guests.
import { can } from '@shared/permissions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Archive, LayoutTemplate, Rocket, Save, Star, Undo2 } from 'lucide-react';
import { toast } from 'sonner';

import type { InvitationTemplate } from '@/admin/composer/draft';
import { useMe } from '@/admin/useMe';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ApiError, patch } from '@/lib/api';

interface TemplatePublishPanelProps {
    template: InvitationTemplate;
    invitationId: string;
    dirty: boolean;
}

type TemplatePatch = Partial<Pick<InvitationTemplate, 'status' | 'isFeatured'>>;

const statusCopy: Record<InvitationTemplate['status'], string> = {
    draft: 'Only the studio can see it. Orders cannot start from it yet.',
    published: 'In the catalogue: new orders for this occasion can start from it.',
    archived: 'Retired: hidden from new orders. Invitations already made from it are untouched.',
};

export function TemplatePublishPanel({ template, invitationId, dirty }: TemplatePublishPanelProps) {
    const client = useQueryClient();
    const canManage = can(useMe().data?.role, 'catalog.manage');
    const change = useMutation({
        mutationFn: (body: TemplatePatch) => patch(`/admin/templates/${template.id}`, body),
        onSuccess: async (_r, body) => {
            if (body.status === 'published') toast.success('Template published ✦');
            else if (body.status) toast.success(`Template moved to ${body.status}`);
            await Promise.all([
                client.invalidateQueries({ queryKey: ['invitation', invitationId] }),
                client.invalidateQueries({ queryKey: ['templates'] }),
            ]);
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not update'),
    });

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                    <LayoutTemplate className="size-4 text-gold" /> {template.name}
                </p>
                <p className="text-xs text-muted-foreground">{statusCopy[template.status]}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <Label htmlFor="tpl-featured" className="flex items-center gap-2 text-sm">
                    <Star className="size-3.5 text-gold" /> Featured (listed first)
                </Label>
                <Switch
                    id="tpl-featured"
                    checked={template.isFeatured}
                    disabled={!canManage || change.isPending}
                    onCheckedChange={(isFeatured) => {
                        change.mutate({ isFeatured });
                    }}
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
            {!canManage && (
                <p className="text-xs text-muted-foreground">
                    An owner publishes templates. You can still edit and save the design.
                </p>
            )}
            <div className="flex flex-col gap-2">
                {template.status !== 'published' && (
                    <Button
                        disabled={!canManage || dirty || change.isPending}
                        onClick={() => {
                            change.mutate({ status: 'published' });
                        }}
                    >
                        <Rocket /> Publish to catalogue
                    </Button>
                )}
                {template.status === 'published' && (
                    <Button
                        variant="outline"
                        disabled={!canManage || change.isPending}
                        onClick={() => {
                            change.mutate({ status: 'draft' });
                        }}
                    >
                        <Undo2 /> Move back to draft
                    </Button>
                )}
                {template.status !== 'archived' && (
                    <Button
                        variant="ghost"
                        disabled={!canManage || change.isPending}
                        onClick={() => {
                            change.mutate({ status: 'archived' });
                        }}
                    >
                        <Archive /> Archive
                    </Button>
                )}
            </div>
        </div>
    );
}
