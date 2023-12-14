import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../interfaces/command.interface';

const data = new SlashCommandBuilder()
    .setName('prev')
    .setDescription('Visszaugrás az előző zenére')
    .setDMPermission(false);

const command: Command = {
    data,
    run: async (interaction: ChatInputCommandInteraction) => {
        const playlist = global.playlists.get(interaction.guildId!);

        await interaction.reply({
            content: playlist?.prev()
                ? 'Visszaugrás!'
                : 'Nem sikerült visszaugrani: Nincs előző zene!',
            ephemeral: playlist?.controller,
        });
    },
};

export default command;
