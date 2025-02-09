import { ButtonInteraction, MessageFlags } from "discord.js";

export default async (interaction: ButtonInteraction) => {
  const guildMember = interaction.guild?.members.cache.get(interaction.user.id);

  if (!guildMember) return;

  guildMember.roles.remove("1337950088512802846");

  interaction
    .reply({
      content: "You have been verified!",
      flags: MessageFlags.Ephemeral,
    })
    .then((interaction) => setTimeout(() => interaction.delete(), 5000));
};
