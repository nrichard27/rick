import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface Command {
    data: SlashCommandBuilder;
    run: (interaction: ChatInputCommandInteraction) => void;
}

export function is_command(obj: object) {
    return 'data' in obj && 'run' in obj;
}
