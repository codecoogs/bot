import { 
    SlashCommandBuilder,
    EmbedBuilder
} from "discord.js";

import { CoCommand } from "../structures";

const Hello = new CoCommand({
    data: new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Replies with Hello!"),
    execute: async ({ interaction })=> {
        const helloEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Welcome to Code[Coogs]')
        .setURL('https://www.codecoogs.com/')
        .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
        .setDescription('Hello!')
        .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

        interaction.reply({ embeds: [helloEmbed] });
    }
});

export default Hello;
