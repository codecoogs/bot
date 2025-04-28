import {  MessageReaction, User } from "discord.js";

export default async (reaction: MessageReaction, user: User) => {
  const guildMember = reaction.message.guild?.members.cache.get(user.id);

  if (!guildMember) return;

  guildMember.roles.remove("1337950088512802846");
};
