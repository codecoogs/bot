import { 
    SlashCommandBuilder,
    SlashCommandStringOption,
    GuildMemberRoleManager,
    EmbedBuilder
} from "discord.js";
const dotenv = require('dotenv');

import { CoCommand } from "../structures";

if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.production' });
} else {
    dotenv.config({ path: '.env.development' });
}

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
                            const errorEmbed = new EmbedBuilder()
                                .setColor('#ED4245')
                                .setTitle('Code[Coogs] Error')
                                .setURL('https://www.codecoogs.com/')
                                .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
                                .setDescription(`Role name '${roleName}' does not exist`)
                                .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

                            interaction.editReply({ embeds: [errorEmbed] });
                            return
                        }
                        (interaction.member?.roles as GuildMemberRoleManager).add(memberRole);

                        const successEmbed = new EmbedBuilder()
                            .setColor('#57F287')
                            .setTitle('Code[Coogs] Success')
                            .setURL('https://www.codecoogs.com/')
                            .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
                            .setDescription("Successfully verified user!")
                            .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

                        interaction.editReply({ embeds: [successEmbed] });
                        return
                    }
                    else {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ED4245')
                            .setTitle('Code[Coogs] Error')
                            .setURL('https://www.codecoogs.com/')
                            .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
                            .setDescription(data.error.message)
                            .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

                        interaction.editReply({ embeds: [errorEmbed] });
                    }
                })
                .catch(error => {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ED4245')
                        .setTitle('Code[Coogs] Error')
                        .setURL('https://www.codecoogs.com/')
                        .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
                        .setDescription(error)
                        .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

                    interaction.editReply({ embeds: [errorEmbed] });
                })
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

export default Verify;