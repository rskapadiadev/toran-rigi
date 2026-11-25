import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, EyeOff, Heart } from 'lucide-react';
import { toast } from 'sonner';

import { Panel, ToneBadge } from '@/admin/kit/page';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';

export interface Wish {
    id: string;
    name: string;
    message: string;
    status: 'pending' | 'approved' | 'hidden';
    createdAt: string;
}

interface WishUpdate {
    wishId: string;
    status: Wish['status'];
}

const wishTone = {
    approved: 'success',
    hidden: 'muted',
    pending: 'warning',
} as const;

interface WishesPanelProps {
    invitationId: string;
    // The invitation's API root: the studio's or the customer's.
    root?: string;
    wishes: Wish[];
}

export function WishesPanel({
    invitationId,
    root = `/admin/invitations/${invitationId}`,
    wishes,
}: WishesPanelProps) {
    const client = useQueryClient();
    const moderate = useMutation({
        mutationFn: (v: WishUpdate) =>
            api(`${root}/wishes/${v.wishId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: v.status }),
            }),
        onSuccess: (_r, v) => {
            toast.success(v.status === 'approved' ? 'Wish approved' : 'Wish hidden');
            void client.invalidateQueries({ queryKey: ['wishes', invitationId] });
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Something went wrong'),
    });
    return (
        <Panel title="Wishes" description="Approved wishes show on the invitation.">
            {wishes.length === 0 ? (
                <p className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                    <Heart className="size-5" />
                    No wishes yet.
                </p>
            ) : (
                <ul className="divide-y">
                    {wishes.map((w) => (
                        <li key={w.id} className="space-y-2 py-3 text-sm first:pt-0 last:pb-0">
                            <p className="leading-relaxed">“{w.message}”</p>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-muted-foreground">— {w.name}</span>
                                <span className="flex items-center gap-1">
                                    <ToneBadge tone={wishTone[w.status]} className="capitalize">
                                        {w.status}
                                    </ToneBadge>
                                    <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        aria-label={`Approve ${w.name}’s wish`}
                                        onClick={() => {
                                            moderate.mutate({
                                                wishId: w.id,
                                                status: 'approved',
                                            });
                                        }}
                                    >
                                        <Check className="text-success" />
                                    </Button>
                                    <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        aria-label={`Hide ${w.name}’s wish`}
                                        onClick={() => {
                                            moderate.mutate({
                                                wishId: w.id,
                                                status: 'hidden',
                                            });
                                        }}
                                    >
                                        <EyeOff />
                                    </Button>
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}
