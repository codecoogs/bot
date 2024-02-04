import { EmbedBuilder } from "discord.js";

export const embedError = (description: string) => {
    const errorEmbed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('Code[Coogs] Error')
        .setURL('https://www.codecoogs.com/')
        .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
        .setDescription(description)
        .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

    return errorEmbed;
}

export const embedSuccess = (title: string, description: string) => {
    const successEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(title)
        .setURL('https://www.codecoogs.com/')
        .setAuthor({ name: 'CoCo Bot', iconURL: 'https://www.codecoogs.com/assets/determined-coco.5399a2c0.webp', url: 'https://www.codecoogs.com/' })
        .setDescription(description)
        .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

    return successEmbed
}