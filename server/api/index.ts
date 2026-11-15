import { Hono } from 'hono';

import type { AppEnv } from '../app';
import { listDevMail } from '../services/mailer';
import { adminApi } from './admin';
import { authApi } from './auth';
import { composerApi } from './composer';
import { inquiriesApi } from './inquiries';
import { invitationsApi } from './invitations';
import { musicApi } from './music';
import { photosApi } from './photos';
import { stockApi } from './stock';
import { storeApi } from './store';
import { templatesApi } from './templates';
import { translateApi } from './translate';

export const api = new Hono<AppEnv>();

api.get('/health', (c) =>
    c.json({
        ok: true,
        platform: c.env.name,
        environment: c.env.config.ENVIRONMENT,
    }),
);

api.route('/i', invitationsApi);
api.route('/inquiries', inquiriesApi);
api.route('/store', storeApi);
api.route('/auth', authApi);
api.route('/admin/invitations', composerApi);
api.route('/admin/music', musicApi);
api.route('/admin/photos', photosApi);
api.route('/admin/stock', stockApi);
api.route('/admin/templates', templatesApi);
api.route('/admin/translate', translateApi);
api.route('/admin', adminApi);

// Local inbox for the console mailer: lets you sign in before any email provider exists.
api.get('/dev/mail', async (c) =>
    c.env.config.ENVIRONMENT === 'development' ? c.json(await listDevMail()) : c.notFound(),
);
