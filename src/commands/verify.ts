
import { 
    SlashCommandBuilder,
    SlashCommandStringOption,
    GuildMemberRoleManager
} from "discord.js";
const dotenv = require('dotenv');

import { CoCommand } from "../structures";

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
        
            if (process.env.NODE_ENV === 'production') {
                dotenv.config({ path: '.env.production' });
            } else {
                dotenv.config({ path: '.env.development' });
            }
            
            const url = process.env.VERIFY_DISCORD_API_ENDPOINT + `?email=${userEmail}&discordId=${userDiscordId}`
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
                            interaction.editReply("Role name '" + roleName + "' does not exist.");
                            return
                        }
                        (interaction.member?.roles as GuildMemberRoleManager).add(memberRole);

                        interaction.editReply("Successfully verified user!");
                    }
                    else {
                        interaction.editReply("Error: " + data.error.message);
                    }
                })
                .catch(error => {
                    interaction.editReply("Error: " + error);
                })
        } catch (error) {
            await interaction.editReply('Error: ' + error);
        }
    }
});

export default Verify;