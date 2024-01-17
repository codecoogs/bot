import { bot } from "..";
import { CoCoEvent } from "../structures";

const InteractionCreate = new CoCoEvent({
    name: "interactionCreate", 
    execute: async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = bot.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute({
                interaction
            }); 
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "There was an error",
                ephemeral: true
            });
        }
    }
});

export default InteractionCreate;
