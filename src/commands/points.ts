
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

const embedError = (description: string) => {
    const errorEmbed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('Code[Coogs] Error')
        .setURL('https://www.codecoogs.com/')
        .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
        .setDescription(description)
        .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

    return errorEmbed;
}

const embedSuccess = (title: string, description: string) => {
    const successEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(title)
        .setURL('https://www.codecoogs.com/')
        .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
        .setDescription(description)
        .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

    return successEmbed
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
                const embed = embedError("Only choose one option, either 'mention' or 'input'")
                interaction.editReply({ embeds: [embed] });
                return
            }
            else if (inputOptionChose) {
                const inputField = interaction.options.get("input")?.value
                if (inputField != 'lb') {
                    const embed = embedError("The only choices allowed in the input are: 'lb'")
                    interaction.editReply({ embeds: [embed] });
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
                            const embed = embedSuccess('Code[Coogs] Points Leaderboard', 'View the top 10 members with most points!')
                            data.data.forEach((entry: any, index: number) => {
                                const rank = (index + 1).toString();
                                embed.addFields(
                                    { name: `#${rank} - ${entry.first_name} ${entry.last_name}`, value: `${entry.points} points` }
                                );
                            });

                            interaction.editReply({ embeds: [embed] });
                            return
                        }
                        const embed = embedError(data.error.message)
                        interaction.editReply({ embeds: [embed] });
                    })
                    .catch(error => {
                        const embed = embedError(error)
                        interaction.editReply({ embeds: [embed] });
                    })
            }
            else if (mentionOptionChose || (!inputOptionChose && !mentionOptionChose)) {
                const roleName = interaction.options.get("mention")?.role?.name
                const mentionedEveryoneOrHere = (roleName == "@everyone") || (roleName == "@here")
                if (mentionedEveryoneOrHere) {
                    const embed = embedError("Don't mention @everyone or @here")
                    interaction.editReply({ embeds: [embed] });
                    return
                }

                const mentionedUser = interaction.options.get("mention")?.member as GuildMember;
                if (mentionedUser) {
                    const mentionedUserHasMemberRole = mentionedUser.roles.cache.some(role => role.name === 'member');
                    if (!mentionedUserHasMemberRole) {
                        const embed = embedError("The user you mentioned is not verified")
                        interaction.editReply({ embeds: [embed] });
                        return 
                    }
                }
                else {
                    const user = interaction.member as GuildMember;
                    const hasMemberRole = user.roles.cache.some(role => role.name === 'member');            
                    if (!hasMemberRole) {
                        const embed = embedError("You are not verified, use the '/verify' command to verify.")
                        interaction.editReply({ embeds: [embed] });
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
                            const embed = embedSuccess('Code[Coogs] User Points', 'View a users points!')
                            embed.addFields(
                                { name: `${data.data.first_name} ${data.data.last_name}`, value: `${data.data.points} points` }
                            );

                            interaction.editReply({ embeds: [embed] });
                            return
                        }
                        const embed = embedError(data.error.message)
                        interaction.editReply({ embeds: [embed] });
                    })
                    .catch(error => {
                        const embed = embedError(error)
                        interaction.editReply({ embeds: [embed] });
                    })
            }
        } catch (error) {
            const embed = embedError(`${error}`)
            interaction.editReply({ embeds: [embed] });
        }
    }
});

export default Points;