import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

import { CoCommand } from "../structures";
import { supabaseClient } from "../constants/supabase";
import { giveRole } from "../utils";

const Help = new CoCommand({
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all the bot's commands and description"),
  execute: async ({ interaction }) => {
    const commandsEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("List of CoCo Commands")
      .setURL("https://www.codecoogs.com/")
      .setAuthor({
        name: "CoCo Bot",
        iconURL: "https://www.codecoogs.com/assets/determined-coco.webp",
        url: "https://www.codecoogs.com/",
      });
  },
});

export default Help;
