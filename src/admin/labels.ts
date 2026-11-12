// Semantic tones map onto the Badge variants in src/components/ui/badge.tsx.
export type Tone = 'success' | 'warning' | 'info' | 'danger' | 'violet' | 'muted';

export const statusLabel: Record<string, string> = {
    new_inquiry: 'New inquiry',
    quotation_sent: 'Quotation sent',
    awaiting_advance: 'Awaiting advance',
    payment_received: 'Payment received',
    details_pending: 'Details pending',
    ready_to_start: 'Ready to start',
    design_in_progress: 'Design in progress',
    preview_shared: 'Preview shared',
    revision_requested: 'Revision requested',
    awaiting_approval: 'Awaiting approval',
    awaiting_final_payment: 'Awaiting final payment',
    published: 'Published',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export const statusTone: Record<string, Tone> = {
    new_inquiry: 'info',
    quotation_sent: 'info',
    awaiting_advance: 'warning',
    payment_received: 'success',
    details_pending: 'warning',
    ready_to_start: 'violet',
    design_in_progress: 'violet',
    preview_shared: 'violet',
    revision_requested: 'danger',
    awaiting_approval: 'warning',
    awaiting_final_payment: 'warning',
    published: 'success',
    completed: 'muted',
    cancelled: 'muted',
};

// Board columns group the 14 statuses into the studio's real workflow stages.
export interface BoardColumn {
    title: string;
    statuses: string[];
}

export const boardColumns: BoardColumn[] = [
    {
        title: 'Leads',
        statuses: ['new_inquiry', 'quotation_sent'],
    },
    {
        title: 'Payment & content',
        statuses: ['awaiting_advance', 'payment_received', 'details_pending'],
    },
    {
        title: 'In the studio',
        statuses: ['ready_to_start', 'design_in_progress', 'revision_requested'],
    },
    {
        title: 'With the client',
        statuses: ['preview_shared', 'awaiting_approval', 'awaiting_final_payment'],
    },
    {
        title: 'Live',
        statuses: ['published', 'completed'],
    },
];

export const invoiceTone: Record<string, Tone> = {
    draft: 'muted',
    issued: 'info',
    partially_paid: 'warning',
    paid: 'success',
    overdue: 'danger',
    void: 'muted',
};

export const invoiceLabel: Record<string, string> = {
    draft: 'Draft',
    issued: 'Unpaid',
    partially_paid: 'Partially paid',
    paid: 'Paid',
    overdue: 'Overdue',
    void: 'Void',
};

export const cultureLabel: Record<string, string> = {
    hindu: 'Hindu',
    islamic: 'Muslim',
    jain: 'Jain',
    sikh: 'Sikh',
    christian: 'Christian',
    jewish: 'Jewish',
    universal: 'Universal',
};
