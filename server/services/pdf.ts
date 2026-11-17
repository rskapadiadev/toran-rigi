// The invitation as a PDF: its print edition (?print=1) photographed page by page in a real
// browser, with every link (directions, calendar, the QR's live link) kept clickable on top.
// Built once per version of the invitation and kept in blob storage.
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';

import { getPlatform } from '../platform/context';
import type { CapturedPage } from '../platform/types';
import type { PdfSource } from '../repos/invitations';

const PAGE_W = 430;
const PAGE_H = 932;

export class PdfUnavailable extends Error {}

export async function buildPdf(pages: CapturedPage[], title: string): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    pdf.setTitle(title);
    pdf.setCreator('Toran by TheRigi');
    const added = pages.map(() => pdf.addPage([PAGE_W, PAGE_H]));
    // "#id" links (the celebrations index) jump to the page holding that id.
    const pageOf = (id: string) => pages.findIndex((p) => p.anchors.includes(id));
    for (const [n, shot] of pages.entries()) {
        const image = await pdf.embedJpg(shot.jpeg);
        const page = added[n];
        if (!page) continue;
        page.drawImage(image, {
            x: 0,
            y: PAGE_H - shot.height,
            width: PAGE_W,
            height: shot.height,
        });
        // PDF space starts bottom-left; the page's links were measured from the top-left.
        const annotations = shot.links.flatMap((l) => {
            const rect = [l.x, PAGE_H - l.y - l.h, l.x + l.w, PAGE_H - l.y];
            const target = l.href.startsWith('#') ? added[pageOf(l.href.slice(1))] : undefined;
            if (l.href.startsWith('#') && !target) return [];
            const link = target
                ? {
                      Type: 'Annot',
                      Subtype: 'Link',
                      Rect: rect,
                      Border: [0, 0, 0],
                      Dest: [target.ref, PDFName.of('Fit')],
                  }
                : {
                      Type: 'Annot',
                      Subtype: 'Link',
                      Rect: rect,
                      Border: [0, 0, 0],
                      A: {
                          Type: 'Action',
                          S: 'URI',
                          URI: PDFString.of(l.href),
                      },
                  };
            return [pdf.context.register(pdf.context.obj(link))];
        });
        if (annotations.length > 0)
            page.node.set(PDFName.of('Annots'), pdf.context.obj(annotations));
    }
    return pdf.save();
}

// Drafts keep the same version while edited, so their file is also keyed by the last edit.
const fileKey = (src: PdfSource) =>
    `pdf/${src.id}/v${String(src.version)}-${src.updatedAt.replace(/[^0-9]/g, '')}.pdf`;

// The stored PDF for this version, made now if it doesn't exist yet. `origin` is where this app
// is reachable from the rendering browser.
export async function invitationPdf(src: PdfSource, origin: string): Promise<Uint8Array> {
    const { blob, capturer } = getPlatform();
    const key = fileKey(src);
    const stored = await blob.get(key);
    if (stored) return new Uint8Array(await new Response(stored.body).arrayBuffer());
    if (!capturer) throw new PdfUnavailable('PDF export is not available on this server');
    const path = src.status === 'published' ? `/${src.slug}` : `/p/${src.previewToken}`;
    const pages = await capturer.capture(`${origin}${path}?print=1`);
    if (pages.length === 0) throw new PdfUnavailable('The invitation had no pages to export');
    const bytes = await buildPdf(pages, src.slug);
    await blob.put(key, bytes, {
        contentType: 'application/pdf',
        cacheControl: 'private, max-age=0',
    });
    return bytes;
}

export const pdfResponse = (bytes: Uint8Array, slug: string) =>
    new Response(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), {
        headers: {
            'content-type': 'application/pdf',
            'content-disposition': `attachment; filename="${slug}-invitation.pdf"`,
            'cache-control': 'private, max-age=0',
        },
    });
