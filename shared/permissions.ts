// One permission matrix for API and UI: always check with can(), never compare roles inline.
export const roles = ['super_admin', 'owner', 'designer'] as const;
export type Role = (typeof roles)[number];

const matrix = {
    'dashboard.view': ['super_admin', 'owner', 'designer'],
    'revenue.view': ['super_admin', 'owner'],
    'orders.view': ['super_admin', 'owner', 'designer'],
    'orders.create': ['super_admin', 'owner'],
    'orders.update': ['super_admin', 'owner', 'designer'],
    'orders.publishWithBalance': ['super_admin', 'owner'],
    'customers.view': ['super_admin', 'owner'],
    'billing.view': ['super_admin', 'owner'],
    'billing.manage': ['super_admin', 'owner'],
    'catalog.manage': ['super_admin', 'owner'],
    'users.manage': ['super_admin'],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof matrix;

export const can = (role: Role | undefined, permission: Permission): boolean =>
    role !== undefined && (matrix[permission] as readonly Role[]).includes(role);
