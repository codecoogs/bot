import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { CoCommand } from "../structures";
import { embedSuccess, embedError } from "../constants/embeds";
import { API_BASE_URL } from "../constants/api";

type Todo = {
    id: number,
    title: string,
    deadline: string,
    completed: boolean
}

const Todos = new CoCommand({
    data: new SlashCommandBuilder()
        .setName("todos")
        .setDescription("Task management commands")
        .addSubcommand(subcommand =>
            subcommand
                .setName("view")
                .setDescription("View todos")
                .addMentionableOption(option => 
                    option.setName("mention")
                        .setDescription("Mention a discord user")
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("all")
                .setDescription("View all todos, sorted by deadline"))
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("Add a todo for yourself or a mentioned user")
                .addStringOption(option => 
                    option.setName("title")
                        .setDescription("Title of the todo")
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName("deadline")
                        .setDescription("Enter a date (MM-DD-YYYY)")
                        .setRequired(true))
                .addMentionableOption(option => 
                    option.setName("mention")
                        .setDescription("Mention a discord user")
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("complete")
                .setDescription("Mark a todo as completed (Executives only)")
                .addIntegerOption(option => 
                    option.setName("id")
                        .setDescription("ID of the todo")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("remove")
                .setDescription("Remove a todo (Executives only)")
                .addIntegerOption(option => 
                    option.setName("id")
                        .setDescription("ID of the todo")
                        .setRequired(true))),
    execute: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: false });

        const subCommand = interaction.options.getSubcommand();

        switch(subCommand) {
            case 'view':
                handleGetAllTodosOfUser(interaction)
                break;
            case 'all':
                handleAllTodos(interaction);
                break;
            case 'add':
                handleAddTodos(interaction);
                break;
            case 'complete':
                handleUpdateTodoCompletion(interaction);
                break;
            case 'remove':
                handleRemoveTodo(interaction);
                break;
        }
    }
});

export default Todos;

const handleGetAllTodosOfUser = async (interaction: ChatInputCommandInteraction) => {
    const mentionedUser = interaction.options.get("mention")?.member as GuildMember;
    const discordId = mentionedUser ? mentionedUser.id : interaction.user.id;
    const discordName = mentionedUser ? mentionedUser.displayName : interaction.user.username

    const url = `${API_BASE_URL}/todos?discord_id=${discordId}`;
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }
    try {
        const res = await fetch(url, options);
        const data = await res.json();
    
        if (data.success) {
            if (!data.data) {
                const embed = embedSuccess("Code[Coogs] Todos", `**${discordName}** has no todos, good job!`);
                interaction.editReply({ embeds: [embed] });
                return;
            }
            const embed = embedSuccess("Code[Coogs] Todos", `Here are all todos for **${discordName}**, sorted by deadline`);
            data.data.forEach((entry: Todo) => {
                embed.addFields(
                    { name: `${entry.id.toString()} - ${entry.title} - Due ${entry.deadline}`, value: `${entry.completed ? '✅ COMPLETE' : '🚧 INCOMPLETE'}` },
                );
            });
            interaction.editReply({ embeds: [embed] });
            return;
        } else {
            const embed = embedError(data.error.message);
            interaction.editReply({ embeds: [embed] });
        }
    } catch (error) {
        const embed = embedError(`${error}`)
        interaction.editReply({ embeds: [embed] });
    }
}

const handleAllTodos = async (interaction: ChatInputCommandInteraction) => {
    const url = `${API_BASE_URL}/todos`;
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }
    try {
        const res = await fetch(url, options);
        const data = await res.json();

        if (data.success) {
            if (!data.data) {
                const embed = embedSuccess("Code[Coogs] Todos", "There are currently no todos, good job!");
                interaction.editReply({ embeds: [embed] });
                return;
            }
            const embed = embedSuccess("Code[Coogs] Todos", "Here are all todos, sorted by deadline");
            data.data.forEach((entry: Todo, index: number) => {
                embed.addFields(
                    { name: `${entry.id.toString()} - ${entry.title} - Due ${entry.deadline}`, value: `${entry.completed ? '✅ COMPLETE' : '🚧 INCOMPLETE'}` },
                );
            });
            interaction.editReply({ embeds: [embed] });
            return;
        } else {
            const embed = embedError(data.error.message);
            interaction.editReply({ embeds: [embed] });
        }
    } catch (error) {
        const embed = embedError(`${error}`)
        interaction.editReply({ embeds: [embed] });
    }
}

const isProperDateFormat = (dateString: string) => {
    const pattern: RegExp = /^\d{2}-\d{2}-\d{4}$/;
    return pattern.test(dateString);
}

const handleAddTodos = async (interaction: ChatInputCommandInteraction) => {
    const mentionedUser = interaction.options.get("mention")?.member as GuildMember;
    const discordId = mentionedUser ? mentionedUser.id : interaction.user.id;
    const discordName = mentionedUser ? mentionedUser.displayName : interaction.user.username

    const title = interaction.options.getString('title') as string;
    const deadline = interaction.options.getString('deadline') as string;

    if (!isProperDateFormat(deadline)) {
        const embed = embedError("Enter a valid date (MM-DD-YYYY)")
        interaction.editReply({ embeds: [embed] });
        return
    }

    const url = `${API_BASE_URL}/todos?discord_id=${discordId}`;
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            deadline: deadline,
            completed: false
        })
    }
    try {
        const res = await fetch(url, options);
        const data = await res.json();
    
        if (data.success) {
            const embed = embedSuccess("Code[Coogs] Todos", `Assigning todo to **${discordName}**: **${title}** with deadline **${deadline}**.`);
            interaction.editReply({ embeds: [embed] });
        } else {
            const embed = embedError(data.error.message);
            interaction.editReply({ embeds: [embed] });
        }
    } catch (error) {
        const embed = embedError(`${error}`)
        interaction.editReply({ embeds: [embed] });
    }
}

const isExecutive = (user: GuildMember) => {
    return user.roles.cache.some(role => role.name === 'Executive');            
}

const handleUpdateTodoCompletion = async (interaction: ChatInputCommandInteraction) => {
    const user = interaction.member as GuildMember;
    if (!isExecutive(user)) {
        const embed = embedError("You do not have permission to use this command.")
        interaction.editReply({ embeds: [embed] });
        return 
    }

    const id = interaction.options.getInteger('id');
    const url = `${API_BASE_URL}/todos/completed?id=${id}`;
    const options = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            completed: true,
        })
    }
    try {
        const res = await fetch(url, options);
        const data = await res.json();

        if (data.success) {
            const embed = embedSuccess("Code[Coogs] Todos", `Marked todo ID **${id}** as completed.`);
            interaction.editReply({ embeds: [embed] });
        } else {
            const embed = embedError(data.error.message);
            interaction.editReply({ embeds: [embed] });
        }
    } catch (error) {
        const embed = embedError(`${error}`)
        interaction.editReply({ embeds: [embed] });
    }
}

const handleRemoveTodo = async (interaction: ChatInputCommandInteraction) => {
    const user = interaction.member as GuildMember;
    if (!isExecutive(user)) {
        const embed = embedError("You do not have permission to use this command.")
        interaction.editReply({ embeds: [embed] });
        return 
    }

    const id = interaction.options.getInteger('id');
    const url = `${API_BASE_URL}/todos?id=${id}`;
    const options = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    }
    try {
        const res = await fetch(url, options);
        const data = await res.json();

        if (data.success) {
            const embed = embedSuccess("Code[Coogs] Todos", `Removed todo ID **${id}**.`);
            interaction.editReply({ embeds: [embed] });
        } else {
            const embed = embedError(data.error.message);
            interaction.editReply({ embeds: [embed] });
        }
    } catch (error) {
        const embed = embedError(`${error}`)
        interaction.editReply({ embeds: [embed] });
    }
}