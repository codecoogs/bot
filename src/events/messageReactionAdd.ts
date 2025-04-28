import { giveRole } from "../utils";
import { supabaseClient } from "../constants/supabase";
import { CoCoEvent } from "../structures";
import {
  GuildMember,
  MessageFlags,
  MessageReaction,
  ReactionType,
  TextChannel,
  User,
} from "discord.js";
import acceptRules from "../interactions/acceptRules";

const rulesMessageId = "898697885863002113";

const messageReactionAdd = new CoCoEvent({
  name: "messageReactionAdd",
  once: false,
  execute: async (reaction: MessageReaction, user: User) => {
    if (
      reaction.message.id === rulesMessageId &&
      reaction.emoji.name === "🥥"
    ) {
      acceptRules(reaction, user);
    }
  },
});

export default messageReactionAdd;
