import { giveRole } from "../utils";
import { supabaseClient } from "../constants/supabase";
import { CoCoEvent } from "../structures";
import { GuildMember, TextChannel } from "discord.js";

const welcomeChannel = "897562746126761996";
const rulesChannel = "897566470387671092";
const introductionChannel = "897595954679644161";

const guildMemberAdd = new CoCoEvent({
  name: "guildMemberAdd",
  once: false,
  execute: async (member: GuildMember) => {
    const role = member.guild.roles.cache.find(
      (role) => role.id === "1337950088512802846"
    );

    if (!role) return;
    
    member.roles.add(role);

    const channel = member.guild.channels.cache.get(
      welcomeChannel
    ) as TextChannel;
    
    channel.send(
      `Hello ${member.user}! Welcome to the Code[Coogs] server. Don't forget to read the <#${rulesChannel}> and introduce yourself at <#${introductionChannel}>.`
    );

    // const { data, error } = await supabaseClient
    //   .from("users")
    //   .select()
    //   .eq("discord", member.user.username);

    // if (data && data.length > 0) {
    //   giveRole(member, "Member");
    // }
  },
});

export default guildMemberAdd;
