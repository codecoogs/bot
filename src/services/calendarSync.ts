import { apiFetch } from "../constants/api";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars";

// How far either side of today to keep GoGo in step with the calendar. Past
// events stay on the website's history, future ones are what members care about.
const WINDOW_DAYS_BACK = 30;
const WINDOW_DAYS_FORWARD = 180;

const DEFAULT_INTERVAL_MINUTES = 15;

export type GoogleEvent = {
    id: string;
    status?: string;
    summary?: string;
    description?: string;
    location?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
};

/**
 * The columns Google Calendar owns. is_public, point_category and flyer_url are
 * set by officers and are deliberately absent: GoGo upserts on google_event_id,
 * and PostgREST only writes the keys it is given, so leaving them out is what
 * keeps a poll from resetting them.
 */
export type SyncEvent = {
    google_event_id: string;
    title: string;
    description: string | null;
    location: string | null;
    start_time: string;
    end_time: string;
    status: "scheduled" | "cancelled";
};

// Google's vocabulary is confirmed/tentative/cancelled; the events table's is
// scheduled/cancelled.
const mapStatus = (status?: string): SyncEvent["status"] =>
    status === "cancelled" ? "cancelled" : "scheduled";

// Timed events carry dateTime, all-day events carry date. Deleted events carry
// neither, so they fall back to the epoch date rather than failing validation --
// the row already exists in GoGo and only its status matters.
const readTime = (slot?: { dateTime?: string; date?: string }) =>
    slot?.dateTime ?? slot?.date ?? "1970-01-01";

/**
 * Every optional field is written explicitly as null rather than omitted. A
 * bulk upsert's column list is the union of keys across the batch, so a row
 * that dropped a key would blank out the value another row supplied.
 */
export const mapGoogleEvent = (event: GoogleEvent): SyncEvent => ({
    google_event_id: event.id,
    title: event.summary?.trim() || "Untitled event",
    description: event.description ?? null,
    location: event.location ?? null,
    start_time: readTime(event.start),
    end_time: readTime(event.end),
    status: mapStatus(event.status),
});

const syncWindow = () => {
    const start = new Date();
    start.setDate(start.getDate() - WINDOW_DAYS_BACK);

    const end = new Date();
    end.setDate(end.getDate() + WINDOW_DAYS_FORWARD);

    return { timeMin: start.toISOString(), timeMax: end.toISOString() };
};

export const fetchGoogleEvents = async (): Promise<GoogleEvent[]> => {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!calendarId || !apiKey) {
        throw new Error("GOOGLE_CALENDAR_ID and GOOGLE_API_KEY are required to sync the calendar");
    }

    const { timeMin, timeMax } = syncWindow();
    const events: GoogleEvent[] = [];
    let pageToken: string | undefined;

    do {
        const params = new URLSearchParams({
            timeMin,
            timeMax,
            // Expand recurring events into individual instances, and include
            // deletions so a removed event reaches GoGo as a cancellation.
            singleEvents: "true",
            showDeleted: "true",
            orderBy: "startTime",
            maxResults: "250",
        });
        if (pageToken) params.set("pageToken", pageToken);

        const url = `${GOOGLE_CALENDAR_API}/${encodeURIComponent(calendarId)}/events?${params}`;

        // Google accepts the API key either as ?key= or as this header. The
        // header keeps the credential out of the URL, and so out of anything
        // that logs one -- proxies, stack traces, error reporting.
        const res = await fetch(url, { headers: { "X-Goog-Api-Key": apiKey } });

        if (!res.ok) {
            // Deliberately does not include the URL: it names the calendar and
            // would grow to carry the key again if anyone re-added it there.
            throw new Error(`Google Calendar returned ${res.status}`);
        }

        const page = await res.json() as { items?: GoogleEvent[]; nextPageToken?: string };
        events.push(...(page.items ?? []));
        pageToken = page.nextPageToken;
    } while (pageToken);

    return events;
};

export const syncCalendar = async (): Promise<number> => {
    const googleEvents = await fetchGoogleEvents();
    const events = googleEvents.map(mapGoogleEvent);

    await apiFetch("/events/calendar", {
        method: "POST",
        body: events,
        authorized: true,
    });

    return events.length;
};

/**
 * Polls on an interval for the life of the process. GoGo runs on Vercel
 * functions with no cron, so the long-running bot is where this belongs.
 */
export const startCalendarSync = () => {
    if (!process.env.GOOGLE_CALENDAR_ID || !process.env.GOOGLE_API_KEY) {
        console.log("Calendar sync disabled: GOOGLE_CALENDAR_ID or GOOGLE_API_KEY is not set.");
        return;
    }

    const minutes = Number(process.env.CALENDAR_SYNC_INTERVAL_MINUTES) || DEFAULT_INTERVAL_MINUTES;

    const run = async () => {
        try {
            const synced = await syncCalendar();
            console.log(`Calendar sync complete: ${synced} events.`);
        } catch (error) {
            // One bad poll must not take the interval -- or the bot -- down with it.
            console.error("Calendar sync failed", error);
        }
    };

    run();
    setInterval(run, minutes * 60 * 1000);

    console.log(`Calendar sync running every ${minutes} minutes.`);
};
