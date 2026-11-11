import { Hono } from 'hono';

import type { AppEnv } from '../app';
import { invitationsApi } from './invitations';

export const api = new Hono<AppEnv>();

api.get('/health', (c) =>
    c.json({
        ok: true,
        platform: c.env.name,
        environment: c.env.config.ENVIRONMENT,
    }),
);

api.route('/i', invitationsApi);
