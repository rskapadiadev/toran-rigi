import { createApp } from '../app';
import { runScheduled } from '../jobs';
import { type CloudflareEnv, createCloudflarePlatform } from '../platform/cloudflare';
import { runWithPlatform } from '../platform/context';

const app = createApp();

// The only file that knows it runs on Cloudflare Workers.
export default {
    fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
        return app.fetch(request, createCloudflarePlatform(env, ctx), ctx);
    },
    scheduled(controller: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext) {
        const platform = createCloudflarePlatform(env, ctx);
        ctx.waitUntil(runWithPlatform(platform, () => runScheduled(controller.cron, platform)));
    },
};
