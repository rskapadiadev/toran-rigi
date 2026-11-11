// UPI intent link: opens the guest's UPI app; Toran never touches the money.
export function upiLink(upiId: string, payeeName: string, note?: string): string {
    const params = new URLSearchParams({
        pa: upiId,
        pn: payeeName,
        cu: 'INR',
    });
    if (note) params.set('tn', note.slice(0, 50));
    return `upi://pay?${params.toString()}`;
}

export const isValidUpiId = (id: string) => /^[\w.-]{2,256}@[a-zA-Z][\w]{2,64}$/.test(id);
