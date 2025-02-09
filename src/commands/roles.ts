import {
  SlashCommandBuilder,
  EmbedBuilder,
  RoleSelectMenuBuilder,
  TextChannel,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";

import { CoCommand } from "../structures";
import roles from "../constants/roles";

const roleKeys = [
  "Classification",
  "Games",
  "Programming Languages",
  "IDEs and Text Editors",
  "Operating Systems",
  "Announcement Pings",
];

const Roles = new CoCommand({
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Select your roles using the menu.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  execute: async ({ interaction }) => {
    const roleChannel = interaction.channel as TextChannel;

    for (let index = 0; index < roleKeys.length; index++) {
      const role = roleKeys[index];
      const customId = "RoleSelection" + role;
      const rolesData = roles[role as keyof typeof roles];

      const rolesEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(role)
        .setDescription("Select your roles.");

      const rolesMenu = new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder(`Select a ${role} role...`)
        .setMinValues(0)
        .setMaxValues(rolesData.length)
        .addOptions(
          rolesData.map((roleData) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(roleData.name)
              .setEmoji(roleData.emote)
              .setValue(roleData.id)
          )
        );

      if (role == "Classification") {
        rolesMenu.setMaxValues(1);
      }

      const actionRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          rolesMenu
        );

      await roleChannel.send({
        embeds: [rolesEmbed],
        components: [actionRow],
      });
    }

    interaction.reply({
      content: "Created the role menu!",
      flags: "Ephemeral",
    });
  },
});

export default Roles;
