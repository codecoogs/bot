const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.production' });
} else {
    dotenv.config({ path: '.env.development' });
}

export const API_BASE_URL = process.env.API_BASE_URL;

type ApiEnvelope<T> = {
    success: boolean;
    data?: T;
    error?: { message: string };
};

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

type ApiFetchOptions = {
    method?: string;
    body?: unknown;
    /** Writes to GoGo are gated on the shared AUTH_SECRET. */
    authorized?: boolean;
};

/**
 * Calls GoGo and unwraps its { success, data, error } envelope. Throws an
 * ApiError carrying the status so callers can tell "no such account" from
 * "already linked" without re-reading the response.
 */
export const apiFetch = async <T>(path: string, options: ApiFetchOptions = {}): Promise<T | undefined> => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (options.authorized) {
        const secret = process.env.AUTH_SECRET;
        if (!secret) throw new Error("AUTH_SECRET is required for this request");
        headers.Authorization = secret;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    let envelope: ApiEnvelope<T> | undefined;
    try {
        envelope = await res.json() as ApiEnvelope<T>;
    } catch {
        // A gateway timeout or crash returns HTML, not our envelope.
        throw new ApiError(res.status, `The API returned an unreadable response (${res.status}).`);
    }

    if (!res.ok || !envelope.success) {
        throw new ApiError(res.status, envelope.error?.message ?? `Request failed with ${res.status}.`);
    }

    return envelope.data;
};
