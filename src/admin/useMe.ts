import { useQuery } from '@tanstack/react-query';

import { api } from '../lib/api';
import type { Me } from './types';

export function useMe() {
    return useQuery({
        queryKey: ['me'],
        queryFn: () => api<{ user: Me }>('/auth/me').then((r) => r.user),
    });
}
