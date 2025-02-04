import { supabaseClient } from "../constants/supabase";
import { CoCoEvent } from "../structures";
import { GuildMember, TextChannel } from "discord.js";

const welcomeChannel = "1336134974369431574"
const introductionChannel = "491622468197416965"

const guildMemberAdd = new CoCoEvent({
    name: "guildMemberAdd",
    once: false,
    execute: async (member: GuildMember) => {
        const channel = member.guild.channels.cache.get(welcomeChannel) as TextChannel;
        channel.send(`Hello ${member.user}! Welcome to the Code[Coogs] server. Don't forget to introduce yourself at <#${introductionChannel}>.`);

        const { data, error } = await supabaseClient
            .from("users")
            .select()
            .eq("discord", member.user.username);

        const role = member.guild.roles.cache.find(role => role.name == "Member");
        if (role && data && data.length > 0) {
            member.roles.add(role)
        }
    }
});

export default guildMemberAdd;