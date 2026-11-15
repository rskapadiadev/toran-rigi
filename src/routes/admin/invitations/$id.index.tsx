import { createFileRoute } from '@tanstack/react-router';

import { EditorGate } from '@/admin/editor/EditorScreen';

export const Route = createFileRoute('/admin/invitations/$id/')({ component: InvitationEditor });

function InvitationEditor() {
    const { id } = Route.useParams();
    return <EditorGate id={id} />;
}
