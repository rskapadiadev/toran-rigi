import type { Platform } from '../platform/types';

export const cronSchedules = {
    frequent: '*/15 * * * *',
    daily: '30 3 * * *',
} as const;

type JobRunner = (platform: Platform) => Promise<void>;

const jobs: Record<string, JobRunner[]> = {
    [cronSchedules.frequent]: [],
    [cronSchedules.daily]: [],
};

export function registerJob(schedule: keyof typeof cronSchedules, run: JobRunner) {
    jobs[cronSchedules[schedule]]?.push(run);
}

// Same job functions on Workers (Cron Triggers) and Node (node-cron in node-serve.ts).
export async function runScheduled(cron: string, platform: Platform) {
    for (const run of jobs[cron] ?? []) {
        try {
            await run(platform);
        } catch (error) {
            console.error(`[cron ${cron}]`, error);
        }
    }
}
