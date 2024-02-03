import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { CoCommand } from "../structures";
import { embedSuccess, embedError } from "../constants/embeds";

const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.production' });
} else {
    dotenv.config({ path: '.env.development' });
}

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
                        .setRequired(true)))
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
                // TODO: Add logic for viewing todos
                const mention = interaction.options.getMentionable('mention');
                await interaction.editReply(`Viewing todos for ${mention ? mention : 'you'}.`);
                break;
            case 'all':
                handleAllTodos(interaction);
                break;
            case 'add':
                // TODO: Add logic for adding todos
                // NOTE: This should validate that the deadline is a valid date
                const title = interaction.options.getString('title');
                const deadline = interaction.options.getString('deadline');
                await interaction.editReply(`Adding todo: ${title} with deadline ${deadline}.`);
                break;
            case 'complete':
                // TODO: Add logic for completing todos
                // NOTE: This should only be available to executive roles
                const completeId = interaction.options.getInteger('id');
                await interaction.editReply(`Marking todo ID ${completeId} as completed.`);
                break;
            case 'remove':
                // TODO: Add logic for removing todos
                // NOTE: This should only be available to executive roles
                const removeId = interaction.options.getInteger('id');
                await interaction.editReply(`Removing todo ID ${removeId}.`);
                break;
            default:
                await interaction.editReply("Unknown command.");
        }
    }
});

export default Todos;

const handleAllTodos = (interaction: ChatInputCommandInteraction) => {
    const url = process.env.TODOS_API_ENDPOINT + '';
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }
    try {
        fetch(url, options)
        .then(res => {
            return res.json()
        })
        .then(data => {
            if (data.success) {
                const embed = embedSuccess("Code[Coogs] Todos", "Here are all todos, sorted by deadline")
                data.data.forEach((entry: Todo, index: number) => {
                    embed.addFields(
                        { name: `${entry.id.toString()} - ${entry.title} [${entry.completed ? 'COMPLETE' : 'INCOMPLETE'}]`, value: `Due ${entry.deadline}` },
                    );
                });
                interaction.editReply({ embeds: [embed] });
                return
            }
            else {
                const embed = embedError(data.error.message)
                interaction.editReply({ embeds: [embed] });
            }
        })
        .catch(error => {
            const embed = embedError(error.toString())
            interaction.editReply({ embeds: [embed] });
        })
    } catch (error) {
        const embed = embedError(`${error}`)
        interaction.editReply({ embeds: [embed] });
    }
}
