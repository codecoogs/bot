import type {
    ClientEvents,
    CommandInteraction,
    SlashCommandBuilder
} from "discord.js";

import type { CoCo } from "./structures";

interface CommandExecuteOptions {
    interaction: CommandInteraction;
};

type CommandExecute = (options: CommandExecuteOptions) => Promise<any> | any;

export type CoCommandOptions = {
    data: SlashCommandBuilder;
    execute: CommandExecute;
};


type EventExecute = (options: any) => Promise<any> | any;

export type CoCoEventOptions = {
    name: string;
    once?: boolean;
    execute: EventExecute;
}
