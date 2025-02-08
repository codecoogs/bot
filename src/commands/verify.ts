import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

import { CoCommand } from "../structures";
import { supabaseClient } from "../constants/supabase";
import { giveRole } from "../utils";

const Verify = new CoCommand({
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verifies your CodeCoogs membership."),
  execute: async ({ interaction }) => {
    const verifyEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Verfiying membership")
      .setURL("https://www.codecoogs.com/")
      .setAuthor({
        name: "CoCo Bot",
        iconURL: "https://www.codecoogs.com/assets/determined-coco.webp",
        url: "https://www.codecoogs.com/",
      })
      .setDescription("Searching through the database. Please wait.");

    const msg = await interaction.reply({ embeds: [verifyEmbed] });

    const guildMember = interaction.guild?.members.cache.get(
      interaction.user.id
    );

    const { data, error } = await supabaseClient
      .from("users")
      .select()
      .eq("discord", interaction.user.username);

    if (data) {
      verifyEmbed
        .setColor(data.length > 0 ? "Green" : "Red")
        .setTitle("Verfiying membership completed!")
        .setDescription(
          data.length > 0
            ? "Yipee! You are a member of CodeCoogs :D"
            : "It appears that you might not be a member :("
        );

      if (data.length > 0 && guildMember) {
        giveRole(guildMember, "Member");
      }
    } else {
      verifyEmbed
        .setColor("Red")
        .setTitle("Verfiying membership error")
        .setDescription("There was an error trying to access the database.");
    }

    msg.edit({ embeds: [verifyEmbed] });
  },
});

export default Verify;
