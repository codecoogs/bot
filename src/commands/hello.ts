import { 
    SlashCommandBuilder 
} from "discord.js";

import { CoCommand } from "../structures";

const Hello = new CoCommand({
    data: new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Replies with Hello!"),
    execute: async ({ interaction })=> {
        await interaction.reply("Hello!");
    }
});

export default Hello;
