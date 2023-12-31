
import { 
    SlashCommandBuilder,
    SlashCommandMentionableOption,
    GuildMember,
} from "discord.js";
const dotenv = require('dotenv');

import { CoCommand } from "../structures";

if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.production' });
} else {
    dotenv.config({ path: '.env.development' });
}

const Points = new CoCommand({
    data: new SlashCommandBuilder()
        .setName("points")
        .setDescription("View member points!")
        .addMentionableOption((option: SlashCommandMentionableOption) => 
            option
                .setName("mention")
                .setDescription("Mention a discord user to view their member points!")
                .setRequired(false)),
    execute: async ({ interaction })=> {
        try {
            await interaction.deferReply({ ephemeral: false });
    
            const roleName = interaction.options.get("mention")?.role?.name
            const mentionedEveryoneOrHere = (roleName == "@everyone") || (roleName == "@here")
            if (mentionedEveryoneOrHere) {
                await interaction.editReply("Don't do that!")
                return
            }

            const mentionedUser = interaction.options.get("mention")?.member as GuildMember;
            if (mentionedUser) {
                const mentionedUserHasMemberRole = mentionedUser.roles.cache.some(role => role.name === 'member');
                if (!mentionedUserHasMemberRole) {
                    await interaction.editReply("The user you mentioned is not verified.")
                    return 
                }
            }
            else {
                const user = interaction.member as GuildMember;
                const hasMemberRole = user.roles.cache.some(role => role.name === 'member');            
                if (!hasMemberRole) {
                    await interaction.editReply("You are not verified, use the '/verify' command to verify.")
                    return 
                }
            }   

            const discordId = mentionedUser ? mentionedUser.id : interaction.user.id;

            const url = process.env.POINTS_API_ENDPOINT + `?discordId=${discordId}`
            const options = {
                method: "GET",
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
                        interaction.editReply(`${data.data.first_name} ${data.data.last_name}, you have ${data.data.points} points`);
                        return
                    }
                    interaction.editReply("Error: " + data.error.message);
                })
                .catch(error => {
                    interaction.editReply("Error: " + error);
                })
        } catch (error) {
            await interaction.editReply('Error: ' + error);
        }
    }
});

export default Points;