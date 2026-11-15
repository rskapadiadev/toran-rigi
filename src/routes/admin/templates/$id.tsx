import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { LayoutTemplate } from 'lucide-react';

import { EditorGate } from '@/admin/editor/EditorScreen';
import { EmptyState } from '@/admin/kit/page';
import { type TemplateRow, templatesQuery } from '@/admin/templates/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

export const Route = createFileRoute('/admin/templates/$id')({ component: TemplateEditor });

// The template's design lives in its sample invitation, so the visual editor edits that.
function TemplateEditor() {
    const { id } = Route.useParams();
    const { data, isPending } = useQuery({
        ...templatesQuery,
        queryFn: () => api<TemplateRow[]>('/admin/templates'),
    });
    const template = data?.find((t) => t.id === id);
    if (isPending) return <Skeleton className="h-svh w-full rounded-none" />;
    if (!template)
        return (
            <div className="p-8">
                <EmptyState icon={LayoutTemplate} title="Template not found">
                    <Button asChild variant="outline">
                        <Link to="/admin/templates">Back to templates</Link>
                    </Button>
                </EmptyState>
            </div>
        );
    return <EditorGate id={template.invitationId} />;
}
