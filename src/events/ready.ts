const { ActivityType } = require("discord.js");

import { CoCoEvent } from "../structures";
import { bot } from "..";

const Ready = new CoCoEvent({
    name: "ready",
    once: true,
    execute() {
        bot.user?.setActivity("with cooders", { type: ActivityType.Playing });
        console.log("CoCo is online.");
    }
});

export default Ready;
