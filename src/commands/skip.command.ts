import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../interfaces/command.interface';

const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Jelenleg játszott zene átugrása')
    .setDMPermission(false);

const command: Command = {
    data,
    run: async (interaction: ChatInputCommandInteraction) => {
        const playlist = global.playlists.get(interaction.guildId!);

        await interaction.reply({
            content: playlist?.skip()
                ? 'Átugrás!'
                : 'Nem található következő zene. A lejátszás leállítása...',
            ephemeral: playlist?.controller,
        });
    },
};

export default command;
