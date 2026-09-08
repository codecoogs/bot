import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GuildMember } from "discord.js";
import { giveRole } from "./utils";

const makeMember = (roleNames: string[], addImpl?: () => Promise<unknown>) => {
    const add = vi.fn(addImpl ?? (() => Promise.resolve()));

    const member = {
        id: "123",
        guild: {
            name: "Code[Coogs]",
            roles: { cache: roleNames.map((name) => ({ name })) },
        },
        roles: { add },
    };

    // The cache is a discord.js Collection in production; giveRole only calls
    // find on it, which an array already provides.
    return { member: member as unknown as GuildMember, add };
};

describe("giveRole", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("adds the role and reports success", async () => {
        const { member, add } = makeMember(["Member", "Executive"]);

        await expect(giveRole(member, "Member")).resolves.toBe(true);
        expect(add).toHaveBeenCalledWith({ name: "Member" });
    });

    // The failure this whole change exists for: a member was told they had the
    // role while nothing had been added.
    it("reports failure when no role has that name", async () => {
        const { member, add } = makeMember(["Executive"]);

        await expect(giveRole(member, "Member")).resolves.toBe(false);
        expect(add).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
    });

    // The lookup is case sensitive, which is exactly how /points ended up gated
    // on a role name that could never match.
    it("does not match a role whose name differs only in case", async () => {
        const { member, add } = makeMember(["member"]);

        await expect(giveRole(member, "Member")).resolves.toBe(false);
        expect(add).not.toHaveBeenCalled();
    });

    // Discord rejects the add when the bot's own role sits below the target in
    // the hierarchy, or when it lacks Manage Roles.
    it("reports failure when Discord rejects the add", async () => {
        const { member, add } = makeMember(["Member"], () =>
            Promise.reject(new Error("Missing Permissions"))
        );

        await expect(giveRole(member, "Member")).resolves.toBe(false);
        expect(add).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
    });

    // It must settle only once the add has, or a caller that awaits it would
    // still be reporting success before Discord had accepted anything.
    it("waits for the add to settle before resolving", async () => {
        let settled = false;
        const { member } = makeMember(["Member"], async () => {
            await Promise.resolve();
            settled = true;
        });

        await giveRole(member, "Member");

        expect(settled).toBe(true);
    });
});
