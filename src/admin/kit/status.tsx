import { invoiceLabel, invoiceTone, statusLabel, statusTone, type Tone } from '../labels';
import { ToneBadge } from './page';

interface StatusProps {
    status: string;
    className?: string;
}

export function OrderStatusBadge({ status, className }: StatusProps) {
    return (
        <ToneBadge tone={statusTone[status]} className={className}>
            {statusLabel[status] ?? status}
        </ToneBadge>
    );
}

export function InvoiceStatusBadge({ status, className }: StatusProps) {
    return (
        <ToneBadge tone={invoiceTone[status]} className={className}>
            {invoiceLabel[status] ?? status}
        </ToneBadge>
    );
}

const invitationTone: Record<string, Tone> = {
    draft: 'muted',
    preview: 'violet',
    published: 'success',
    archived: 'muted',
    demo: 'info',
};

export function InvitationStatusBadge({ status, className }: StatusProps) {
    return (
        <ToneBadge tone={invitationTone[status] ?? 'muted'} className={className}>
            <span className="capitalize">{status}</span>
        </ToneBadge>
    );
}

export interface Sla {
    label: string;
    tone: Tone;
    late: boolean;
}

/** Delivery SLA from a due timestamp: late, due within 6h, or comfortably on track. */
export function slaFor(iso: string | null, now: number): Sla | null {
    if (!iso) return null;
    const ms = Date.parse(iso) - now;
    const hours = Math.abs(ms) / 3_600_000;
    const h = Math.floor(hours);
    const m = Math.floor((Math.abs(ms) % 3_600_000) / 60_000);
    const span = h >= 48 ? `${Math.round(hours / 24)}d` : h > 0 ? `${h}h ${m}m` : `${m}m`;
    if (ms < 0)
        return {
            label: `${span} late`,
            tone: 'danger',
            late: true,
        };
    return {
        label: `${span} left`,
        tone: hours < 6 ? 'warning' : 'success',
        late: false,
    };
}
