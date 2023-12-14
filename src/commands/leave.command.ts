import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../interfaces/command.interface';

const data = new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Kilépés egy szerverről')
    .addStringOption((option) =>
        option.setName('id').setDescription('szerver id').setRequired(false),
    )
    .setDMPermission(false);

const command: Command = {
    data,
    run: async (interaction: ChatInputCommandInteraction) => {
        if (interaction.user.id != process.env.DC_DEV_USER_ID) {
            return await interaction.reply({
                content: 'Csak a fejlesztő használhatja a parancsot!',
                ephemeral: true,
            });
        }

        const id = interaction.options.getString('id');

        if (id) {
            const guild = global.client.guilds.cache.get(id);

            if (!guild)
                return await interaction.reply({
                    content: 'A megadott szerver nem található!',
                    ephemeral: true,
                });

            guild.leave();

            return interaction.reply({
                content: 'Sikeres kilépés!',
                ephemeral: true,
            });
        } else {
            const guild = interaction.guild;

            guild?.leave();

            return interaction.reply({
                content: 'Sikeres kilépés!',
                ephemeral: true,
            });
        }
    },
};

export default command;
