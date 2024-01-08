
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
            else if (mentionOptionChose || (!inputOptionChose && !mentionOptionChose)) {
                const roleName = interaction.options.get("mention")?.role?.name
                const mentionedEveryoneOrHere = (roleName == "@everyone") || (roleName == "@here")
                if (mentionedEveryoneOrHere) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ED4245')
                        .setTitle('Code[Coogs] Error')
                        .setURL('https://www.codecoogs.com/')
                        .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
                        .setDescription("Don't mention @everyone or @here")
                        .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

                    interaction.editReply({ embeds: [errorEmbed] });
                    return
                }

                const mentionedUser = interaction.options.get("mention")?.member as GuildMember;
                if (mentionedUser) {
                    const mentionedUserHasMemberRole = mentionedUser.roles.cache.some(role => role.name === 'member');
                    if (!mentionedUserHasMemberRole) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ED4245')
                            .setTitle('Code[Coogs] Error')
                            .setURL('https://www.codecoogs.com/')
                            .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
                            .setDescription("The user you mentioned is not verified")
                            .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

                        interaction.editReply({ embeds: [errorEmbed] });
                        return 
                    }
                }
                else {
                    const user = interaction.member as GuildMember;
                    const hasMemberRole = user.roles.cache.some(role => role.name === 'member');            
                    if (!hasMemberRole) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ED4245')
                            .setTitle('Code[Coogs] Error')
                            .setURL('https://www.codecoogs.com/')
                            .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
                            .setDescription("You are not verified, use the '/verify' command to verify.")
                            .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')
    
                        interaction.editReply({ embeds: [errorEmbed] });
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
                            const pointsEmbed = new EmbedBuilder()
                                .setColor(0x0099FF)
                                .setTitle('Code[Coogs] User Points')
                                .setURL('https://www.codecoogs.com/')
                                .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
                                .setDescription('View a users points!')
                                .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

                            pointsEmbed.addFields(
                                { name: `${data.data.first_name} ${data.data.last_name}`, value: `${data.data.points} points` }
                            );

                            interaction.editReply({ embeds: [pointsEmbed] });
                            return
                        }
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ED4245')
                            .setTitle('Code[Coogs] Error')
                            .setURL('https://www.codecoogs.com/')
                            .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
                            .setDescription(`${data.error.message}`)
                            .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

                        interaction.editReply({ embeds: [errorEmbed] });
                    })
                    .catch(error => {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ED4245')
                            .setTitle('Code[Coogs] Error')
                            .setURL('https://www.codecoogs.com/')
                            .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
                            .setDescription(`${error}`)
                            .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

                        interaction.editReply({ embeds: [errorEmbed] });
                    })
            }
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('Code[Coogs] Error')
                .setURL('https://www.codecoogs.com/')
                .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
                .setDescription(`${error}`)
                .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

            interaction.editReply({ embeds: [errorEmbed] });
        }
    }
});

export default Points;