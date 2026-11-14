// Admin light/dark preference, remembered per browser. The visual editor forces dark while open
// and hands back to this preference when it closes.
export type AdminTheme = 'light' | 'dark';

const KEY = 'toran-admin-theme';

export function readAdminTheme(): AdminTheme {
    try {
        return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
}

export function applyAdminTheme(theme: AdminTheme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function saveAdminTheme(theme: AdminTheme) {
    try {
        localStorage.setItem(KEY, theme);
    } catch {
        // Private mode: the toggle still works for this visit.
    }
    applyAdminTheme(theme);
}
