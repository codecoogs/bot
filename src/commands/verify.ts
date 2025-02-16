import {
  SlashCommandBuilder,
  EmbedBuilder,
  SlashCommandUserOption,
} from "discord.js";

import { CoCommand } from "../structures";
import { supabaseClient } from "../constants/supabase";
import { giveRole } from "../utils";

const Verify = new CoCommand({
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verifies your CodeCoogs membership.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to be verified")
    ),

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

    const user = interaction.options.getUser("user");

    const guildMember = interaction.guild?.members.cache.get(
      user?.id || interaction.user.id
    );

    if (!guildMember) {
      verifyEmbed
        .setColor("Red")
        .setTitle("Verfiying membership error")
        .setDescription("There was an error trying to access the database.");

      msg.edit({ embeds: [verifyEmbed] });
      return;
    }

    const { data, error } = await supabaseClient
      .from("users")
      .select()
      .eq("discord", guildMember.user.username);

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
