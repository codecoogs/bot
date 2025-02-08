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
import { getRoleById } from "../utils";

const roleChannelId = "1337856668226289678";

const roleKeys = [
  "Classification",
  "Games",
  "Programming Languages",
  "IDEs and Text Editors",
  "Operating Systems",
];

const Roles = new CoCommand({
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Select your roles using the menu.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  execute: async ({ interaction }) => {
    const roleChannel = interaction.guild?.channels.cache.get(
      roleChannelId
    ) as TextChannel;

    for (let index = 0; index < roleKeys.length; index++) {
      const role = roleKeys[index];
      const customId = "RoleSelection" + role.replace(" ", "");
      const rolesData = roles[role as keyof typeof roles];

      //   console.log(role);

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

      const reply = await roleChannel.send({
        embeds: [rolesEmbed],
        components: [actionRow],
        //   flags: "Ephemeral",
      });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === customId) {
          const guildUser = await interaction.guild?.members.fetch(
            interaction.user.id
          );

          await guildUser.roles.remove(
            rolesData.map((roleData) => roleData.id)
          );
          await guildUser.roles.add(interaction.values);

          return await interaction.reply({
            content: "Role assigned",
            flags: MessageFlags.Ephemeral,
          });
        }
      });
    }

    interaction.reply({
      content: "Created the role menu!",
      flags: "Ephemeral",
    });
  },
});

export default Roles;
