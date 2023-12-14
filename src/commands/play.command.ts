import {
    ChatInputCommandInteraction,
    GuildChannel,
    GuildMember,
    GuildTextBasedChannel,
    SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../interfaces/command.interface';
import {
    VoiceConnectionStatus,
    getVoiceConnection,
    joinVoiceChannel,
} from '@discordjs/voice';
import { check_permissions, get_song } from '../utils';
import { Playlist } from '../playlist';

const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Zene lejátszás YouTube link alapján')
    .addStringOption((option) =>
        option
            .setName('link')
            .setDescription('YouTube videó link')
            .setRequired(true),
    )
    .setDMPermission(false);

const command: Command = {
    data,
    run: async (interaction: ChatInputCommandInteraction) => {
        if (!(interaction.member as GuildMember).voice.channel) {
            return await interaction.reply({
                content: 'Először be kell lépned egy hangcsatornába!',
                ephemeral: true,
            });
        }

        const link = interaction.options.getString('link');

        const song = await get_song(
            link!,
            (interaction.member as GuildMember).user.tag,
        );

        if (!song) {
            return await interaction.reply({
                content: 'A link rossz vagy ilyen zene nem található!',
                ephemeral: true,
            });
        }

        const channel = (interaction.member as GuildMember).voice.channel;
        const connection = getVoiceConnection(interaction.guildId!);
        let playlist: Playlist | undefined;

        if (!connection) {
            const permissions = check_permissions(
                ['ViewChannel', 'Connect', 'Speak'],
                [
                    'Nincs jogom megnézni a hangcsatornát amiben vagy!',
                    'Nincs jogom csatlakozni a hangcsatornához amiben vagy!',
                    'Nincs jogom beszélni a hangcsatornában amiben vagy!',
                ],
                channel!,
                global.client.user!,
            );

            if (permissions) {
                return await interaction.reply({
                    content: permissions,
                    ephemeral: true,
                });
            }

            global.playlists.set(
                interaction.guildId!,
                new Playlist(interaction.guildId!),
            );

            playlist = global.playlists.get(interaction.guildId!);

            const connection = joinVoiceChannel({
                channelId: channel!.id,
                guildId: channel!.guild.id,
                adapterCreator: channel!.guild.voiceAdapterCreator,
            });

            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                if (playlist!.controller) {
                    const channel = global.client.guilds.cache
                        .get(playlist!.id)!
                        .channels.cache.get(
                            playlist!.controller_msg!.channel_id,
                        ) as GuildTextBasedChannel;

                    const permissions = check_permissions(
                        ['ViewChannel', 'ManageMessages', 'ReadMessageHistory'],
                        ['asd', 'asd', 'asd'],
                        channel as GuildChannel,
                        global.client.user!,
                    );

                    if (!permissions) {
                        const message = (await channel?.messages.fetch()).get(
                            playlist!.controller_msg!.message_id,
                        );

                        message?.edit({
                            content: 'A lejátszó lejárt. Készíts újat!',
                            components: [],
                            embeds: [],
                        });
                    }

                    playlist!.controller = false;
                    playlist!.controller_msg = undefined;
                }

                playlist?.disconnect();
                global.playlists.delete(playlist!.id);
            });

            playlist!.play(song);

            return await interaction.reply({
                content: `Lejátszás: ${song.link}`,
                ephemeral: playlist?.controller,
            });
        } else {
            playlist = global.playlists.get(interaction.guildId!);
        }

        if (playlist?.is_idle()) {
            playlist?.play(song);
        } else {
            playlist?.add(song);
        }

        return await interaction.reply({
            content: `Lejátszás: ${song.link}`,
            ephemeral: playlist?.controller,
        });
    },
};

export default command;
