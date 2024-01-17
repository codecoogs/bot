import type {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from "discord.js";

interface CommandExecuteOptions {
    interaction: ChatInputCommandInteraction;
};

type CommandExecute = (options: CommandExecuteOptions) => Promise<void>;

export type CoCommandOptions = {
    data: Partial<SlashCommandBuilder> | SlashCommandSubcommandsOnlyBuilder;
    execute: CommandExecute;
};


type EventExecute = (options: any) => Promise<void> | void;

export type CoCoEventOptions = {
    name: string;
    once?: boolean;
    execute: EventExecute;
}
