import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

import { CoCommand } from "../structures";
import { supabaseClient } from "../constants/supabase";

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
    // .setThumbnail('https://www.codecoogs.com/assets/computer-coco.60087ab0.webp')

    const msg = await interaction.reply({ embeds: [verifyEmbed] });

    const { data, error } = await supabaseClient
      .from("users")
      .select()
      .eq("discord", interaction.user.username);

    if (data) {
      verifyEmbed
        .setTitle("Verfiying membership completed!")
        .setDescription(
          data.length > 0
            ? "Yipee! You are a member of CodeCoogs :D"
            : "It appears that you might not be a member :("
        );
    } else {
      verifyEmbed
        .setTitle("Verfiying membership error")
        .setDescription("There was an error trying to access the database.");
    }

    msg.edit({ embeds: [verifyEmbed] });
  },
});

export default Verify;
