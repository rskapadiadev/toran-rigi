import { and, asc, eq, inArray } from 'drizzle-orm';

import { addonPrices, addons, packagePrices, packages } from '../db/schema';
import { getPlatform } from '../platform/context';

export async function listCatalog() {
    const { db } = getPlatform();
    const [pkgs, pkgPrices, adds, addPrices] = await Promise.all([
        db.select().from(packages).where(eq(packages.isActive, true)).orderBy(asc(packages.sort)),
        db.select().from(packagePrices),
        db.select().from(addons).where(eq(addons.isActive, true)).orderBy(asc(addons.sort)),
        db.select().from(addonPrices),
    ]);
    return {
        packages: pkgs.map((p) => ({
            ...p,
            prices: Object.fromEntries(
                pkgPrices
                    .filter((x) => x.packageCode === p.code)
                    .map((x) => [x.currency, x.amountMinor]),
            ),
        })),
        addons: adds.map((a) => ({
            ...a,
            prices: Object.fromEntries(
                addPrices
                    .filter((x) => x.addonCode === a.code)
                    .map((x) => [x.currency, x.amountMinor]),
            ),
        })),
    };
}

export async function priceLines(packageCode: string, addonCodes: string[], currency: string) {
    const { db } = getPlatform();
    const pkg = await db
        .select({
            name: packages.name,
            amount: packagePrices.amountMinor,
            limits: packages.limits,
        })
        .from(packages)
        .innerJoin(packagePrices, eq(packagePrices.packageCode, packages.code))
        .where(and(eq(packages.code, packageCode), eq(packagePrices.currency, currency)))
        .get();
    if (!pkg) return null;
    const adds = addonCodes.length
        ? await db
              .select({
                  code: addons.code,
                  name: addons.name,
                  amount: addonPrices.amountMinor,
              })
              .from(addons)
              .innerJoin(addonPrices, eq(addonPrices.addonCode, addons.code))
              .where(and(inArray(addons.code, addonCodes), eq(addonPrices.currency, currency)))
        : [];
    return {
        pkg,
        addons: adds,
    };
}
