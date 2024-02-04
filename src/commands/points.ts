
import { 
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    GuildMember,
} from "discord.js";
import { CoCommand } from "../structures";
import { embedSuccess, embedError } from "../constants/embeds";
import { API_BASE_URL } from "../constants/api";

const Points = new CoCommand({
    data: new SlashCommandBuilder()
        .setName("points")
        .setDescription("View member points!")
        .addSubcommand(subcommand =>
            subcommand
                .setName("view")
                .setDescription("View points of yourself or a mentioned user")
                .addMentionableOption(option => 
                    option.setName("mention")
                        .setDescription("Mention a discord user")
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("leaderboard")
                .setDescription("View the points leaderboard")),
    execute: async ({ interaction })=> {
        await interaction.deferReply({ ephemeral: false });

        const subCommand = interaction.options.getSubcommand();

        switch(subCommand) {
            case 'view':
                handleViewPoints(interaction)
                break;
            case 'leaderboard':
                handleLeaderboard(interaction);
                break;
        }
    }
});

export default Points;

const isMember = (user: GuildMember) => {
    return user.roles.cache.some(role => role.name === 'member');             
}

const handleViewPoints = (interaction: ChatInputCommandInteraction) => {
    const mentionedUser = interaction.options.get("mention")?.member as GuildMember;
    if (mentionedUser) {
        if (!isMember(mentionedUser)) {
            const embed = embedError("The user you mentioned is not verified.")
            interaction.editReply({ embeds: [embed] });
            return 
        }
    } 
    else {
        const user = interaction.member as GuildMember;
        if (!isMember(user)) {
            const embed = embedError("You are not verified, use the `/verify` command to verify.")
            interaction.editReply({ embeds: [embed] });
            return 
        }
    }

    const discordId = mentionedUser ? mentionedUser.id : interaction.user.id;

    const url = `${API_BASE_URL}/users/points?discordId=${discordId}`
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
            const embed = embedError(error.toString())
            interaction.editReply({ embeds: [embed] });
        })
}

const handleLeaderboard = (interaction: ChatInputCommandInteraction) => {
    const amount = 10;
    const url = `${API_BASE_URL}/users/points/leaderboard?top=${amount}`
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
            const embed = embedError(error.toString())
            interaction.editReply({ embeds: [embed] });
        })
}