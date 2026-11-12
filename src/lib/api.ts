export class ApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}

interface ApiFailure {
    error?: string;
}

function withJson(headers: HeadersInit | undefined): Headers {
    const merged = new Headers(headers);
    if (!merged.has('content-type')) merged.set('content-type', 'application/json');
    return merged;
}

// Thin JSON client for /api/*; a 401 bounces admins to the sign-in page.
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`/api${path}`, {
        ...init,
        headers: withJson(init.headers),
        credentials: 'same-origin',
    });
    if (
        res.status === 401 &&
        path.startsWith('/admin') &&
        !window.location.pathname.startsWith('/admin/login')
    ) {
        window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    const data: unknown = await res.json().catch(() => ({}));
    if (!res.ok)
        throw new ApiError(
            (data as ApiFailure).error ?? `Request failed (${res.status})`,
            res.status,
        );
    return data as T;
}

export const post = <T>(path: string, body: unknown) =>
    api<T>(path, {
        method: 'POST',
        body: JSON.stringify(body),
    });
export const patch = <T>(path: string, body: unknown) =>
    api<T>(path, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
