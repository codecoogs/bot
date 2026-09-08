import { describe, expect, it } from "vitest";
import { mapGoogleEvent, type GoogleEvent } from "./calendarSync";

const timedEvent: GoogleEvent = {
    id: "5kv39l574625kddc4o3loc470s",
    status: "confirmed",
    summary: "Competitions 1 Workshop",
    description: "Data Structures workshop, Extra credit opportunity",
    location: "Heyne Building H 34",
    start: { dateTime: "2026-02-23T22:30:00Z" },
    end: { dateTime: "2026-02-24T00:00:00Z" },
};

describe("mapGoogleEvent", () => {
    it("maps a timed event onto the columns GoGo owns", () => {
        const got = mapGoogleEvent(timedEvent);

        expect(got.google_event_id).toBe("5kv39l574625kddc4o3loc470s");
        expect(got.title).toBe("Competitions 1 Workshop");
        expect(got.description).toBe("Data Structures workshop, Extra credit opportunity");
        expect(got.location).toBe("Heyne Building H 34");
        expect(got.start_time).toBe("2026-02-23T22:30:00Z");
        expect(got.end_time).toBe("2026-02-24T00:00:00Z");
        expect(got.status).toBe("scheduled");
    });

    // All-day events carry `date` instead of `dateTime`, and the events table
    // stores them as the bare date.
    it("reads all-day events from the date field", () => {
        const got = mapGoogleEvent({
            ...timedEvent,
            start: { date: "2026-01-22" },
            end: { date: "2026-01-23" },
        });

        expect(got.start_time).toBe("2026-01-22");
        expect(got.end_time).toBe("2026-01-23");
    });

    it.each([
        ["confirmed", "scheduled"],
        ["tentative", "scheduled"],
        ["cancelled", "cancelled"],
    ])("maps Google status %s onto %s", (googleStatus, expected) => {
        const got = mapGoogleEvent({ ...timedEvent, status: googleStatus });

        expect(got.status).toBe(expected);
    });

    // A deleted event comes back from showDeleted=true with almost nothing on
    // it but an id and a cancelled status. It still has to sync, because that
    // cancellation is how a removal reaches the website.
    it("maps a deleted event that carries no other fields", () => {
        const got = mapGoogleEvent({
            id: "deleted-one",
            status: "cancelled",
        });

        expect(got.google_event_id).toBe("deleted-one");
        expect(got.status).toBe("cancelled");
        expect(got.title).toBe("Untitled event");
        expect(got.description).toBeNull();
        expect(got.location).toBeNull();
    });

    it("nulls the optional fields Google omits rather than dropping the keys", () => {
        const got = mapGoogleEvent({
            id: "abc",
            status: "confirmed",
            summary: "No extras",
            start: { dateTime: "2026-02-23T22:30:00Z" },
            end: { dateTime: "2026-02-24T00:00:00Z" },
        });

        expect(got.description).toBeNull();
        expect(got.location).toBeNull();
        expect("description" in got).toBe(true);
        expect("location" in got).toBe(true);
    });

    // PostgREST builds the upsert's SET clause from the union of keys across the
    // batch and fills a key some rows omit with the column default. If these two
    // rows serialised different key sets, syncing them together would blank out
    // whichever field the other row supplied.
    it("produces the same key set whether or not the optional fields are present", () => {
        const withEverything = Object.keys(mapGoogleEvent(timedEvent)).sort();
        const withNothing = Object.keys(mapGoogleEvent({ id: "x", status: "cancelled" })).sort();

        expect(withEverything).toEqual(withNothing);
    });

    // is_public, point_category and flyer_url are set by officers on the website.
    // The calendar knows nothing about them, so a poll must never send them --
    // an upsert that included them would reset every event it touched.
    it("never sends the columns officers own", () => {
        const got = mapGoogleEvent(timedEvent) as Record<string, unknown>;

        expect(got).not.toHaveProperty("is_public");
        expect(got).not.toHaveProperty("point_category");
        expect(got).not.toHaveProperty("flyer_url");
        expect(got).not.toHaveProperty("id");
    });
});
