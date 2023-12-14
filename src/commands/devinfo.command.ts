import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../interfaces/command.interface';

const data = new SlashCommandBuilder()
    .setName('devinfo')
    .setDescription('Fejlesztői információk megtekintése')
    .addStringOption((option) =>
        option.setName('id').setDescription('Szerver ID').setRequired(false),
    )
    .setDMPermission(false);

const command: Command = {
    data,
    run: async (interaction: ChatInputCommandInteraction) => {
        if (interaction.user.id != process.env.DC_DEV_USER_ID) {
            return interaction.reply({
                content: 'Csak a fejlesztő használhatja a parancsot!',
                ephemeral: true,
            });
        }

        const id = interaction.options.getString('id');

        if (id) {
            const guild = global.client.guilds.cache.get(id);

            if (!guild)
                return interaction.reply({
                    content: 'A megadott szerver nem található!',
                    ephemeral: true,
                });

            const owner = await guild.fetchOwner();
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(guild.name)
                .setThumbnail(guild.iconURL())
                .addFields({
                    name: 'Tulajdonos',
                    value: owner.user.tag,
                    inline: true,
                })
                .addFields({
                    name: 'Tulajdonos ID',
                    value: guild.ownerId,
                    inline: true,
                })
                .addFields({
                    name: 'Szerver ID',
                    value: guild.id,
                    inline: true,
                })
                .addFields({
                    name: 'Létrehozva',
                    value: `${guild.createdAt}`,
                    inline: true,
                })
                .addFields({
                    name: 'Rick hozzáadva',
                    value: `${guild.joinedAt}`,
                    inline: true,
                })
                .addFields({
                    name: 'Tagok száma',
                    value: `${guild.memberCount}`,
                    inline: true,
                });

            await interaction.reply({ embeds: [embed] });
        } else {
            const embeds: EmbedBuilder[] = [];

            for (let i = 0; i < client.guilds.cache.size; i++) {
                const guild = client.guilds.cache.at(i);
                const owner = await guild!.fetchOwner();
                const embed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(guild!.name)
                    .setThumbnail(guild!.iconURL())
                    .addFields({
                        name: 'Tulajdonos',
                        value: owner.user.tag,
                        inline: true,
                    })
                    .addFields({
                        name: 'Szerver ID',
                        value: guild!.id,
                        inline: true,
                    });
                embeds.push(embed);
            }

            await interaction.reply({ embeds: embeds });
        }
    },
};

export default command;
