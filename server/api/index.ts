import { Hono } from 'hono';

import type { AppEnv } from '../app';
import { listDevMail } from '../services/mailer';
import { adminApi } from './admin';
import { affiliatesApi } from './affiliates';
import { authApi } from './auth';
import { boardShotsApi } from './boards';
import { composerApi } from './composer';
import { filmsApi } from './films';
import { inquiriesApi } from './inquiries';
import { invitationsApi } from './invitations';
import { musicApi } from './music';
import { photosApi } from './photos';
import { portraitsApi } from './portraits';
import { stockApi } from './stock';
import { storeApi } from './store';
import { templatesApi } from './templates';
import { translateApi } from './translate';
import { webhooksApi } from './webhooks';
import { wordingApi } from './wording';

export const api = new Hono<AppEnv>();

api.get('/health', (c) =>
    c.json({
        ok: true,
        platform: c.env.name,
        environment: c.env.config.ENVIRONMENT,
    }),
);

api.route('/i', invitationsApi);
api.route('/board-shots', boardShotsApi);
api.route('/inquiries', inquiriesApi);
api.route('/store', storeApi);
api.route('/wording', wordingApi);
api.route('/webhooks', webhooksApi);
api.route('/auth', authApi);
api.route('/admin/invitations', composerApi);
api.route('/admin/affiliates', affiliatesApi);
api.route('/admin/films', filmsApi);
api.route('/admin/music', musicApi);
api.route('/admin/photos', photosApi);
api.route('/admin/portraits', portraitsApi);
api.route('/admin/stock', stockApi);
api.route('/admin/templates', templatesApi);
api.route('/admin/translate', translateApi);
api.route('/admin', adminApi);

// Local inbox for the console mailer: lets you sign in before any email provider exists.
api.get('/dev/mail', async (c) =>
    c.env.config.ENVIRONMENT === 'development' ? c.json(await listDevMail()) : c.notFound(),
);
