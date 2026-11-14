// Shared by the invitation cover, the doors opening and the link-preview card (server/og).
import type { CultureId } from './cultures';

// Doorway silhouettes per tradition: jharokha, mihrab, lancet, gurdwara dome, chuppah canopy.
export function archPath(culture: CultureId): string {
    switch (culture) {
        case 'hindu':
        case 'jain': {
            // Cusped (multifoil) jharokha: seven lobes along a semicircle.
            const cx = 150;
            const cy = 200;
            const r = 130;
            const lobes = 7;
            const points = Array.from({ length: lobes + 1 }, (_, i) => {
                const a = Math.PI - (Math.PI / lobes) * i;
                return [cx + r * Math.cos(a), cy - r * Math.sin(a)] as const;
            });
            const arcs = points
                .slice(1)
                .map(([x, y]) => `A30 30 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`)
                .join(' ');
            return `M20 470 V200 ${arcs} V470`;
        }
        case 'islamic':
            return 'M20 470 V220 C20 130 85 98 118 66 C138 46 148 24 150 8 C152 24 162 46 182 66 C215 98 280 130 280 220 V470';
        case 'christian':
            return 'M20 470 V210 Q20 70 150 8 Q280 70 280 210 V470';
        case 'sikh':
            return 'M20 470 V230 C20 165 58 140 96 122 C128 106 132 70 150 30 C168 70 172 106 204 122 C242 140 280 165 280 230 V470';
        case 'jewish':
            return 'M20 470 V70 Q85 92 150 70 Q215 92 280 70 V470';
        case 'universal':
            return 'M20 470 V180 A130 130 0 0 1 280 180 V470';
    }
}
