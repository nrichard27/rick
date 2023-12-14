import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../interfaces/command.interface';
import { transform_array } from '../utils';

const data = new SlashCommandBuilder()
    .setName('list')
    .setDescription('Megmutatja a lejátszási listát')
    .setDMPermission(false);

const command: Command = {
    data,
    run: async (interaction: ChatInputCommandInteraction) => {
        const playlist = global.playlists.get(interaction.guildId!);

        const embeds: EmbedBuilder[] = [];
        const lists = transform_array(playlist!.list, 7);

        const mainEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('**Lejátszási lista**')
            .setThumbnail(interaction.guild!.iconURL())
            .addFields({
                name: 'Ismétlés',
                value: playlist!.looping ? 'bekapcsolva' : 'kikapcsolva',
            });
        embeds.push(mainEmbed);

        lists.forEach((list) => {
            const embed = new EmbedBuilder();
            let songs = '';
            let authors = '';

            list.forEach((song) => {
                authors += `${
                    playlist!.current == playlist!.list.indexOf(song)
                        ? '**'
                        : ''
                }${song.author}${
                    playlist!.current == playlist!.list.indexOf(song)
                        ? '**'
                        : ''
                }\n`;
                songs += `${
                    playlist!.current == playlist!.list.indexOf(song)
                        ? ':notes: **'
                        : ''
                }${playlist!.list.indexOf(song)}. [${song.title
                    .substring(0, 30)
                    .trim()}${song.title.length > 30 ? '...' : ''}](${
                    song.link
                })${
                    playlist!.current == playlist!.list.indexOf(song)
                        ? '**'
                        : ''
                }\n`;
            });

            embed.setColor(0x0099ff);
            embed.addFields(
                {
                    name: 'Zene',
                    value: songs,
                    inline: true,
                },
                {
                    name: 'Hozzáadta',
                    value: authors,
                    inline: true,
                },
            );
            embeds.push(embed);
        });

        await interaction.reply({ embeds, ephemeral: playlist!.controller });
    },
};

export default command;
