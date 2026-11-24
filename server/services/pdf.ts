// The invitation as a PDF: its print edition (?print=1) photographed page by page in a real
// browser, with every link (directions, calendar, the QR's live link) kept clickable on top.
// Built once per version of the invitation and kept in blob storage.
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';

import { getPlatform } from '../platform/context';
import type { CapturedPage } from '../platform/types';
import type { CardSource } from '../repos/invitations';
import { cardLink, type CardVersion } from './cards';

const PAGE_W = 430;
const PAGE_H = 932;

// Bump when pages are laid out or cut differently, so stored files are made again.
const DESIGN = 'p3';

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

// Drafts keep the same version while edited, so their file is also keyed by the last edit. A draft's
// file shows every function, so it is never the one handed out after publishing.
const fileKey = ({ full, updatedAt }: CardSource, v: CardVersion) =>
    `pdf/${full.invitation.id}/${DESIGN}-${full.invitation.status === 'published' ? 'live' : 'draft'}-v${String(full.invitation.version)}-${updatedAt.replace(/[^0-9]/g, '')}-${v.lang}-${v.who ?? 'main'}.pdf`;

// The stored PDF for this version, made now if it doesn't exist yet. `origin` is where this app
// is reachable from the rendering browser.
export async function invitationPdf(
    source: CardSource,
    v: CardVersion,
    origin: string,
): Promise<Uint8Array> {
    const { blob, capturer } = getPlatform();
    const key = fileKey(source, v);
    const stored = await blob.get(key);
    if (stored) return new Uint8Array(await new Response(stored.body).arrayBuffer());
    if (!capturer) throw new PdfUnavailable('PDF export is not available on this server');
    const { status, slug } = source.full.invitation;
    const query = new URLSearchParams({
        print: '1',
        lang: v.lang,
    });
    let path = `/p/${source.previewToken}`;
    if (status === 'published') {
        path = `/${slug}`;
        // The family's own link, so its PDF is exactly what its guests see.
        const token = new URL(await cardLink(source.full, v.who)).searchParams.get('g');
        if (token) query.set('g', token);
    } else if (v.who) query.set('who', v.who);
    const pages = await capturer.capture(`${origin}${path}?${query.toString()}`);
    if (pages.length === 0) throw new PdfUnavailable('The invitation had no pages to export');
    const bytes = await buildPdf(pages, slug);
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
