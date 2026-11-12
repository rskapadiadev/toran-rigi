// RFC 4180 CSV with a BOM so Excel opens Gujarati/Arabic text correctly.
const BOM = String.fromCharCode(0xfeff);

export function toCsv(rows: (string | number | boolean | null | undefined)[][]): string {
    const cell = (v: string | number | boolean | null | undefined) => {
        const text = v === null || v === undefined ? '' : String(v);
        return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    return `${BOM}${rows.map((r) => r.map(cell).join(',')).join('\r\n')}`;
}
