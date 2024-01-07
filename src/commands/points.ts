
import { 
    SlashCommandBuilder,
    SlashCommandMentionableOption,
    GuildMember,
    SlashCommandStringOption,
    EmbedBuilder
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
                .setRequired(false))
        .addStringOption((option: SlashCommandStringOption) => 
            option
                .setName("input")
                .setDescription("View the points leaderboard by passing in 'lb' to the input!")
                .setRequired(false)),
    execute: async ({ interaction })=> {
        try {
            await interaction.deferReply({ ephemeral: false });

            const mentionOptionChose = interaction.options.get("mention")
            const inputOptionChose = interaction.options.get("input")
            if (mentionOptionChose && inputOptionChose) {
                await interaction.editReply("Only choose one option, either 'mention' or 'input'")
                return
            }
            else if (inputOptionChose) {
                const inputField = interaction.options.get("input")?.value
                if (inputField != 'lb') {
                    await interaction.editReply("The only choices allowed in the input are: 'lb'")
                    return
                }
                const amount = 10;
                const url = process.env.POINTS_LEADERBOARD_API_ENDPOINT + `?top=${amount}`
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
                            const leaderboardEmbed = new EmbedBuilder()
                                .setColor(0x0099FF)
                                .setTitle('Code[Coogs] Points Leaderboard')
                                .setURL('https://www.codecoogs.com/')
                                .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
                                .setDescription('View the top 10 members with most points!')
                                .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')
                                .setTimestamp()
                            data.data.forEach((entry: any, index: number) => {
                                const rank = (index + 1).toString();
                                leaderboardEmbed.addFields(
                                    { name: `#${rank} - ${entry.first_name} ${entry.last_name}`, value: `${entry.points} points` }
                                );
                            });

                            interaction.editReply({ embeds: [leaderboardEmbed] });
                            return
                        }
                        interaction.editReply("Error: " + data.error.message);
                    })
                    .catch(error => {
                        interaction.editReply("Error: " + error);
                    })
            }
            else if (mentionOptionChose) {
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
            }
        } catch (error) {
            await interaction.editReply('Error: ' + error);
        }
    }
});

export default Points;