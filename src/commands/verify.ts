
import { 
    SlashCommandBuilder,
    SlashCommandStringOption,
    GuildMemberRoleManager
} from "discord.js";

import { CoCommand } from "../structures";
import axios from "axios";

const Verify = new CoCommand({
    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Verify membership with your email!")
        .addStringOption((option: SlashCommandStringOption) => 
        option
            .setName("email")
            .setDescription("Your email address")
            .setRequired(true)
    ),
    execute: async ({ interaction })=> {
        try {
            await interaction.deferReply({ ephemeral: true });

            const userEmail = interaction.options.get("email")?.value;
            const discordId = interaction.user.id
            const verifyUser = await axios.patch(`http://localhost:3000/v1/users/discord/verify?email=${userEmail}&discordId=${discordId}`)

            if (verifyUser.data?.success) {
                const roleName = "member"
                const memberRole = interaction.guild?.roles.cache.find(role => role.name === roleName);
                if (!memberRole) {
                    await interaction.editReply("Role name '" + roleName + "' does not exist.");
                    return
                }
                (interaction.member?.roles as GuildMemberRoleManager).add(memberRole);

                await interaction.editReply("Successfully verified user!");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                await interaction.editReply(error.response?.data.error.message);
            } else {
                await interaction.editReply('An unknown error occurred: ' + error);
            }
        }
    }
});

export default Verify;