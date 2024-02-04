import { 
    SlashCommandBuilder,
    SlashCommandStringOption,
    GuildMemberRoleManager,
} from "discord.js";
import { CoCommand } from "../structures";
import { embedSuccess, embedError } from "../constants/embeds";
import { API_BASE_URL } from "../constants/api";

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
            const userDiscordId = interaction.user.id
            const url = `${API_BASE_URL}/users/discord/verify?email=${userEmail}&discordId=${userDiscordId}`
            const options = {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                }
            }
            fetch(url, options)
                .then(res => {
                    return res.json()
                })
                .then(data => {
                    if (data.success) {
                        const roleName = "member"
                        const memberRole = interaction.guild?.roles.cache.find(role => role.name === roleName);
                        if (!memberRole) {
                            const embed = embedError(`Role name '${roleName}' does not exist`)
                            interaction.editReply({ embeds: [embed] });
                            return
                        }
                        (interaction.member?.roles as GuildMemberRoleManager).add(memberRole);

                        const embed = embedSuccess("Code[Coogs] Verification", "Successfully verified user!")
                        interaction.editReply({ embeds: [embed] });
                        return
                    }
                    else {
                        const embed = embedError(data.error.message)
                        interaction.editReply({ embeds: [embed] });
                    }
                })
                .catch(error => {
                    const embed = embedError(error.toString())
                    interaction.editReply({ embeds: [embed] });
                })
        } catch (error) {
            const embed = embedError(`${error}`)
            interaction.editReply({ embeds: [embed] });
        }
    }
});

export default Verify;