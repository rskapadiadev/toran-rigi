import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface DownloadPdfProps {
    invitationId: string;
    slug: string;
    size?: 'sm' | 'default';
    // The studio downloads through its own route, which works whether or not the add-on is on.
    endpoint?: string;
}

// The couple's copy of their invitation as a PDF. The first one takes a few seconds to make,
// so the button says so instead of looking stuck.
export function DownloadPdf({ invitationId, slug, size = 'sm', endpoint }: DownloadPdfProps) {
    const [busy, setBusy] = useState(false);
    const download = async () => {
        setBusy(true);
        try {
            const sameOrigin: RequestInit = { credentials: 'same-origin' };
            const res = await fetch(
                endpoint ?? `/api/store/me/invitations/${invitationId}/pdf`,
                sameOrigin,
            );
            if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as { error?: string };
                throw new Error(body.error ?? 'The PDF couldn’t be made just now');
            }
            const url = URL.createObjectURL(await res.blob());
            const a = document.createElement('a');
            a.href = url;
            a.download = `${slug}-invitation.pdf`;
            a.click();
            window.setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 30_000);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Something went wrong');
        } finally {
            setBusy(false);
        }
    };
    return (
        <Button
            variant="outline"
            size={size}
            disabled={busy}
            onClick={() => {
                void download();
            }}
        >
            {busy ? <Loader2 className="animate-spin" /> : <FileDown />}
            {busy ? 'Preparing PDF…' : 'Download PDF'}
        </Button>
    );
}
