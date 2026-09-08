import { GuildMember, MessageFlags, SlashCommandBuilder } from "discord.js";

import { CoCommand } from "../structures";
import { embedError, embedSuccess } from "../constants/embeds";
import { ApiError, apiFetch } from "../constants/api";
import { giveRole } from "../utils";

const MEMBER_ROLE = "Member";

// GoGo already distinguishes these cases; each one needs a different next step
// from the member, so they must not collapse into one "verification failed".
const messageForStatus = (status: number, fallback: string) => {
    switch (status) {
        case 404:
            return "We could not find an account with that email. Sign up at https://www.codecoogs.com/ and try again.";
        case 409:
            return "That account is already linked to a Discord user. Reach out to an officer if this is not you.";
        case 403:
            return "That account is not an active member yet. Finish your membership payment at https://www.codecoogs.com/ and try again.";
        default:
            return fallback;
    }
};

const Verify = new CoCommand({
    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Verifies your Code[Coogs] membership.")
        .addStringOption((option) =>
            option
                .setName("email")
                .setDescription("The email address you signed up with")
                .setRequired(true)
        ),

    execute: async ({ interaction }) => {
        // The member types their email into whatever channel they are in, so the
        // whole exchange stays ephemeral.
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const email = interaction.options.getString("email", true).trim();
        const member = interaction.member as GuildMember | null;

        if (!member) {
            const embed = embedError("This command only works inside the Code[Coogs] server.");
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        try {
            await apiFetch(
                `/users/discord/verify?email=${encodeURIComponent(email)}&discordId=${encodeURIComponent(member.id)}`,
                { method: "PATCH" }
            );
        } catch (error) {
            const message = error instanceof ApiError
                ? messageForStatus(error.status, error.message)
                : `${error}`;

            const embed = embedError(message);
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        giveRole(member, MEMBER_ROLE);

        const embed = embedSuccess(
            "Code[Coogs] Membership Verified",
            `Welcome in, <@${member.id}>! Your Discord account is now linked to **${email}** and you have the ${MEMBER_ROLE} role.`
        );
        await interaction.editReply({ embeds: [embed] });
    },
});

export default Verify;
