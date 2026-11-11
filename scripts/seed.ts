// Builds idempotent seed SQL from shared catalogues and runs it on local/remote D1 or a libSQL file.
// Usage: tsx scripts/seed.ts [--remote] [--libsql] [--admin you@example.com]
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

import {
    addonCatalog,
    capacityDefaults,
    packageCatalog,
    reservedSlugList,
} from '../shared/catalog';
import { demoInvitations } from '../shared/demo';
import { newToken } from '../shared/ids';
import { themeCatalog } from '../shared/themes';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string, fallback: string) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? (args[i + 1] ?? fallback) : fallback;
};

const q = (v: unknown): string => {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? '1' : '0';
    const text = typeof v === 'string' ? v : JSON.stringify(v);
    return `'${text.replace(/'/g, "''")}'`;
};

function upsert(table: string, row: Record<string, unknown>, conflict: string): string {
    const cols = Object.keys(row);
    const updates = cols
        .filter((c) => !conflict.split(',').includes(c))
        .map((c) => `${c}=excluded.${c}`);
    return `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map((c) => q(row[c])).join(',')}) ON CONFLICT(${conflict}) DO ${updates.length ? `UPDATE SET ${updates.join(',')}` : 'NOTHING'};`;
}

const sql: string[] = [];
const admin = option('admin', 'admin@therigi.co');

sql.push(
    upsert(
        'users',
        {
            id: 'usr_superadmin',
            email: admin,
            name: 'Super Admin',
            role: 'super_admin',
        },
        'id',
    ),
);

packageCatalog.forEach((p, i) => {
    sql.push(
        upsert(
            'packages',
            {
                code: p.code,
                name: p.name,
                tagline: p.tagline,
                limits: p.limits,
                is_atelier: p.isAtelier,
                is_active: true,
                sort: i,
            },
            'code',
        ),
    );
    for (const [currency, amount] of Object.entries(p.prices)) {
        sql.push(
            upsert(
                'package_prices',
                {
                    id: `pp_${p.code}_${currency}`,
                    package_code: p.code,
                    currency,
                    amount_minor: amount,
                    is_from: Boolean(p.isFrom),
                },
                'package_code,currency',
            ),
        );
    }
    const rule = capacityDefaults[p.code];
    if (rule) {
        sql.push(
            upsert(
                'capacity_rules',
                {
                    package_code: p.code,
                    per_day: rule.perDay ?? null,
                    per_week: rule.perWeek ?? null,
                    per_month: rule.perMonth ?? null,
                },
                'package_code',
            ),
        );
    }
});

addonCatalog.forEach((a, i) => {
    sql.push(
        upsert(
            'addons',
            {
                code: a.code,
                name: a.name,
                description: a.description,
                is_active: true,
                sort: i,
            },
            'code',
        ),
    );
    for (const [currency, amount] of Object.entries(a.prices)) {
        sql.push(
            upsert(
                'addon_prices',
                {
                    id: `ap_${a.code}_${currency}`,
                    addon_code: a.code,
                    currency,
                    amount_minor: amount,
                },
                'addon_code,currency',
            ),
        );
    }
});

for (const slug of reservedSlugList) sql.push(upsert('reserved_slugs', { slug }, 'slug'));

themeCatalog.forEach((theme, i) => {
    sql.push(
        upsert(
            'themes',
            {
                id: `thm_${theme.slug}`,
                slug: theme.slug,
                name: theme.name,
                culture: theme.culture,
                category: theme.category,
                description: theme.description,
                preview_media: [],
                config: theme.design,
                from_package: theme.fromPackage,
                is_active: true,
                is_featured: theme.featured,
                sort: i,
            },
            'id',
        ),
    );
});

for (const demo of demoInvitations) {
    const theme = themeCatalog.find((t) => t.slug === demo.themeSlug);
    if (!theme) continue;
    const id = `inv_${demo.slug}`;
    sql.push(`DELETE FROM invitation_events WHERE invitation_id = ${q(id)};`);
    sql.push(
        upsert(
            'invitations',
            {
                id,
                slug: demo.slug,
                theme_id: `thm_${theme.slug}`,
                culture: demo.culture,
                event_kind: 'wedding',
                locales: demo.locales,
                calendars: demo.calendars,
                seed: demo.seed,
                design: theme.design,
                content: demo.content,
                sections: demo.sections,
                extras: demo.extras,
                rsvp_enabled: true,
                status: 'published',
                is_demo: true,
                version: 1,
                preview_token: newToken(),
                published_at: new Date().toISOString(),
            },
            'id',
        ),
    );
    demo.events.forEach((event, sort) => {
        sql.push(
            upsert(
                'invitation_events',
                {
                    id: `${id}_ev${sort}`,
                    invitation_id: id,
                    kind: event.kind,
                    title: event.title,
                    starts_at: event.startsAt,
                    ends_at: event.endsAt ?? null,
                    timezone: event.timezone,
                    venue: event.venue,
                    address: event.address,
                    maps_url: event.mapsUrl,
                    description: event.description ?? null,
                    dress_code: event.dressCode ?? null,
                    sort,
                },
                'id',
            ),
        );
    });
}

sql.push(
    upsert(
        'settings',
        {
            key: 'gst',
            value: {
                enabled: false,
                rateBps: 1800,
                sac: '998314',
                inclusive: true,
            },
        },
        'key',
    ),
);

mkdirSync('.dev', { recursive: true });
const file = '.dev/seed.sql';
writeFileSync(file, sql.join('\n'));
console.log(`Wrote ${sql.length} statements to ${file}`);

if (flag('libsql')) {
    const { createClient } = await import('@libsql/client');
    const client = createClient({ url: option('url', 'file:.dev/toran.db') });
    await client.executeMultiple(sql.join('\n'));
    console.log('Seeded libSQL database.');
} else {
    execFileSync(
        'npx',
        [
            'wrangler',
            'd1',
            'execute',
            'DB',
            flag('remote') ? '--remote' : '--local',
            `--file=${file}`,
        ],
        { stdio: 'inherit' },
    );
}
