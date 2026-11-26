// The emails of a done-for-you invitation. Only that something is waiting and where: what was
// written stays on the site. An email that fails never undoes the work it tells about.
import { brand } from '@shared/brand';

import { getPlatform } from '../platform/context';
import { madeContact } from '../repos/made';
import { sendMail } from './mailer';

const origin = () => getPlatform().config.APP_ORIGIN.replace(/\/$/, '');

const letter = (line: string, url: string, button: string) => ({
    text: `${line}\n\n${url}`,
    html: `<p>${line}</p><p><a href="${url}">${button}</a></p>`,
});

async function quietly(send: () => Promise<void>) {
    try {
        await send();
    } catch (error) {
        console.error('[made] email', error);
    }
}

const customerLines = {
    look: {
        subject: 'Your first look is ready',
        line: 'Your invitation is ready for a first look. Open it, then publish it or tell us what to change.',
        button: 'See your invitation',
    },
    changes: {
        subject: 'Your changes are ready',
        line: 'We’ve made your changes. Have a look, then publish it or tell us what else to change.',
        button: 'See your invitation',
    },
    details: {
        subject: 'We need a little more for your invitation',
        line: 'We’ve started on your invitation and need a little more from you before we can finish.',
        button: 'See what we need',
    },
} as const;

export const tellCustomer = (orderId: string, what: keyof typeof customerLines) =>
    quietly(async () => {
        const to = await madeContact(orderId);
        if (!to?.email || !to.invitationId) return;
        const { subject, line, button } = customerLines[what];
        await sendMail({
            to: to.email,
            subject: `${subject} · Toran`,
            ...letter(line, `${origin()}/my/${to.invitationId}/made`, button),
        });
    });

const studioLines = {
    sent: 'has sent their details. The 48 hours have started.',
    changes: 'has asked for changes.',
} as const;

export const tellStudio = (orderId: string, what: keyof typeof studioLines) =>
    quietly(async () => {
        const from = await madeContact(orderId);
        if (!from) return;
        await sendMail({
            to: brand.email,
            subject: `${from.number}: ${what === 'sent' ? 'details are in' : 'changes asked for'}`,
            ...letter(
                `The customer of order ${from.number} ${studioLines[what]}`,
                `${origin()}/admin/orders/${orderId}`,
                'Open the order',
            ),
        });
    });
