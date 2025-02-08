import {
  ApplicationCommandDataResolvable,
  Client,
  Collection,
  GatewayIntentBits,
  Routes,
} from "discord.js";
import { REST } from "@discordjs/rest";

import type { CoCommandOptions, CoCoEventOptions } from "./types";
import { getDefaultObject, getFilesFromFolder, getFolderPath } from "./utils";

const token = process.env.BOT_TOKEN;

export class CoCommand {
  constructor(options: CoCommandOptions) {
    Object.assign(this, options);
  }
}

export class CoCoEvent {
  constructor(options: CoCoEventOptions) {
    Object.assign(this, options);
  }
}

export class CoCo extends Client {
  commands: Collection<string, CoCommandOptions> = new Collection();
  clientID = process.env.CLIENT_ID;
  guildID = process.env.GUILD_ID;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  run() {
    this.registerCommands();
    this.registerEvents();
    this.login(token);
  }

  registerCommands() {
    const slashCommands: ApplicationCommandDataResolvable[] = [];

    const commandsPath = getFolderPath("commands");
    const commandFiles = getFilesFromFolder(commandsPath);
    for (const file of commandFiles) {
      const command = getDefaultObject(commandsPath, file);

      this.commands.set(command.data.name, command);
      slashCommands.push(command.data.toJSON());
    }

    if (!token) return;

    const rest = new REST({ version: "10" }).setToken(token);

    if (!this.guildID || !this.clientID) return;

    rest
      .put(Routes.applicationGuildCommands(this.clientID, this.guildID), {
        body: slashCommands,
      })
      .then(() => console.log("Successfully registered slash commands."))
      .catch(console.error);
  }

  registerEvents() {
    const eventsPath = getFolderPath("events");
    const eventFiles = getFilesFromFolder(eventsPath);
    for (const file of eventFiles) {
      const event = getDefaultObject(eventsPath, file);

      if (event.once) {
        this.once(event.name, (...args: any[]) => event.execute(...args));
        continue;
      }

      this.on(event.name, (...args: any[]) => event.execute(...args));
    }
  }
}
