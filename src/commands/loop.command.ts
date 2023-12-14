import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../interfaces/command.interface';

const data = new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Ismétlés be- és kikapcsolása')
    .setDMPermission(false);

const command: Command = {
    data,
    run: async (interaction: ChatInputCommandInteraction) => {
        const playlist = global.playlists.get(interaction.guildId!);

        await interaction.reply({
            content: playlist?.loop()
                ? 'Ismétlés bekapcsolva!'
                : 'Ismétlés kikapcsolva!',
            ephemeral: playlist?.controller,
        });
    },
};

export default command;
