import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../interfaces/command.interface';

const data = new SlashCommandBuilder()
    .setName('dc')
    .setDescription('Lecsatlakozás a hangszobáról')
    .setDMPermission(false);

const command: Command = {
    data,
    run: async (interaction: ChatInputCommandInteraction) => {
        const playlist = global.playlists.get(interaction.guildId!);

        await playlist?.disconnect();

        await interaction.reply({
            content: 'Lecsatlakoztatva!',
            ephemeral: playlist?.controller,
        });
    },
};

export default command;
