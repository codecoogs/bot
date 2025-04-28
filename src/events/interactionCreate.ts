import { GuildMember, Interaction, MessageFlags } from "discord.js";
import { bot } from "..";
import { CoCoEvent } from "../structures";

import rolesAssign from "../interactions/rolesAssign";
import acceptRules from "../interactions/acceptRules";

const checkSpecialInteractions = (interaction: any) => {
  const customId: string = interaction.customId;

  if (customId) {
    if (customId.startsWith("RoleSelection")) {
      const role = customId.replace("RoleSelection", "");
      rolesAssign(role, interaction);
    }
  }
};

const InteractionCreate = new CoCoEvent({
  name: "interactionCreate",
  execute: async (interaction) => {
    checkSpecialInteractions(interaction);

    if (!interaction.isChatInputCommand()) return;

    const command = bot.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute({
        interaction,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error",
        ephemeral: true,
      });
    }
  },
});

export default InteractionCreate;
