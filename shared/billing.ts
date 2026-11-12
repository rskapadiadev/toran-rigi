// Pure invoice maths (minor units). Server persists the result; tests cover every branch.
export type InvoiceItemKind = 'package' | 'addon' | 'extra' | 'discount';
export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'void';

export interface BillItem {
    kind: InvoiceItemKind;
    qty: number;
    unitPrice: number;
}

export interface BillInput {
    items: BillItem[];
    paid: number;
    credited: number;
    taxBps: number;
    taxInclusive: boolean;
    dueDate: string;
    today: string;
    isVoid?: boolean;
}

export interface BillTotals {
    subtotal: number;
    discount: number;
    taxAmount: number;
    total: number;
    amountPaid: number;
    amountCredited: number;
    balanceDue: number;
    status: InvoiceStatus;
}

export function computeInvoice(input: BillInput): BillTotals {
    const lines = input.items.map((i) => ({
        kind: i.kind,
        amount: i.qty * i.unitPrice,
    }));
    const subtotal = lines
        .filter((l) => l.kind !== 'discount')
        .reduce((sum, l) => sum + l.amount, 0);
    const discount = Math.min(
        subtotal,
        lines.filter((l) => l.kind === 'discount').reduce((sum, l) => sum + Math.abs(l.amount), 0),
    );
    const net = subtotal - discount;
    // Inclusive pricing (India B2C default): tax is carved out of the price, not added on top.
    const taxAmount =
        input.taxBps === 0
            ? 0
            : input.taxInclusive
              ? Math.round(net - net / (1 + input.taxBps / 10000))
              : Math.round((net * input.taxBps) / 10000);
    const total = input.taxInclusive ? net : net + taxAmount;
    const balanceDue = Math.max(0, total - input.paid - input.credited);

    let status: InvoiceStatus;
    if (input.isVoid) status = 'void';
    else if (total > 0 && balanceDue === 0) status = 'paid';
    else if (input.today > input.dueDate) status = 'overdue';
    else if (input.paid > 0) status = 'partially_paid';
    else status = 'issued';

    return {
        subtotal,
        discount,
        taxAmount,
        total,
        amountPaid: input.paid,
        amountCredited: input.credited,
        balanceDue,
        status,
    };
}

// Advance rule from the plan: Signature pays 100% upfront, everything else 50%.
export const advanceFor = (packageCode: string, total: number) =>
    packageCode === 'signature' ? total : Math.ceil(total / 2);

export type AgeingBucket = 'current' | '0-7' | '8-30' | '30+';

export function ageingBucket(dueDate: string, today: string): AgeingBucket {
    const days = Math.floor((Date.parse(today) - Date.parse(dueDate)) / 86_400_000);
    if (days <= 0) return 'current';
    if (days <= 7) return '0-7';
    if (days <= 30) return '8-30';
    return '30+';
}
