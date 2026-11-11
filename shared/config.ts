import { z } from 'zod';

const driver = <T extends [string, ...string[]]>(values: T, fallback: T[number]) =>
    z.enum(values).default(fallback);

// Every runtime setting, validated once at startup on both Cloudflare and Node.
export const configSchema = z.object({
    ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
    PARENT_DOMAIN: z.string().default('therigi.co'),
    APP_HOST: z.string().default('toran.therigi.co'),
    APP_ORIGIN: z.url().default('http://localhost:5173'),
    INVITE_URL_MODE: z.enum(['path', 'subdomain']).default('path'),
    INVITE_HOST: z.string().default(''),
    MEDIA_BASE_URL: z.string().default('/media'),
    SESSION_SECRET: z.string().min(32).default('dev-only-secret-change-me-0123456789abcdef'),
    DB_DRIVER: driver(['d1', 'libsql'], 'd1'),
    BLOB_DRIVER: driver(['r2', 's3', 'disk'], 'r2'),
    CACHE_DRIVER: driver(['cf', 'memory'], 'cf'),
    PAYMENTS_DRIVER: driver(['fake', 'razorpay'], 'fake'),
    MAILER_DRIVER: driver(['console', 'resend'], 'console'),
    SHEETS_DRIVER: driver(['off', 'google'], 'off'),
    AI_DRIVER: driver(['mock', 'anthropic'], 'mock'),
    LIBSQL_URL: z.string().default('file:.dev/toran.db'),
    LIBSQL_AUTH_TOKEN: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_REGION: z.string().default('auto'),
    DISK_BLOB_DIR: z.string().default('.dev/blob'),
    TURNSTILE_SITE_KEY: z.string().default('1x00000000000000000000AA'),
    TURNSTILE_SECRET_KEY: z.string().default('1x0000000000000000000000000000000AA'),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    MAIL_FROM: z.string().default('Toran <hello@therigi.co>'),
    ANTHROPIC_API_KEY: z.string().optional(),
    ANTHROPIC_MODEL: z.string().default('claude-sonnet-5-5'),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_REFRESH_TOKEN: z.string().optional(),
    GOOGLE_SHEET_TEMPLATE_ID: z.string().optional(),
});

export type AppConfig = z.infer<typeof configSchema>;

export function parseConfig(source: Record<string, unknown>): AppConfig {
    const picked = Object.fromEntries(
        Object.keys(configSchema.shape).map((key) => [
            key,
            source[key] === '' ? undefined : source[key],
        ]),
    );
    return configSchema.parse(picked);
}
