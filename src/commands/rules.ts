import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
  ButtonBuilder,
  ButtonComponent,
  ActionRowBuilder,
  ButtonStyle,
} from "discord.js";

import { CoCommand } from "../structures";
import { supabaseClient } from "../constants/supabase";
import { giveRole } from "../utils";
import discordRules from "../constants/rules";

const Rules = new CoCommand({
  data: new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Creates the rules board")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async ({ interaction }) => {
    const rulesChannel = interaction.channel as TextChannel;

    const rulesButton = new ButtonBuilder()
      .setLabel("Gain access")
      .setCustomId("acceptRules")
      .setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      rulesButton
    );

    rulesChannel.send({ content: discordRules, components: [actionRow] });

    interaction.reply({
      content: "Created the rules board!",
      flags: "Ephemeral",
    });
  },
});

export default Rules;
