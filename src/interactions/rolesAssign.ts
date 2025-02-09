import { MessageFlags, StringSelectMenuInteraction } from "discord.js";
import roles from "../constants/roles";

export default async (
  role: string,
  interaction: StringSelectMenuInteraction
) => {
  const customId = "RoleSelection" + role;
  const rolesData = roles[role as keyof typeof roles];

  if (interaction.customId === customId) {
    const guildUser = await interaction.guild?.members.fetch(
      interaction.user.id
    );

    if (!guildUser) return;

    await guildUser.roles.remove(rolesData.map((roleData) => roleData.id));
    await guildUser.roles.add(interaction.values);

    return interaction
      .reply({
        content: "Your roles have been updated!",
        flags: MessageFlags.Ephemeral,
      })
      .then((interaction) => setTimeout(() => interaction.delete(), 5000));
  }
};
