import { createApp } from '../app';
import { getNodePlatform } from '../platform/node';

const app = createApp();

// The only file that knows it runs on Node; node-serve.ts adds static files and cron.
export default {
    fetch(request: Request) {
        return app.fetch(request, getNodePlatform());
    },
};
