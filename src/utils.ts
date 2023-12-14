import playdl from 'play-dl';
import { Song } from './interfaces/song.interface';
import {
    ClientUser,
    EmbedBuilder,
    GuildChannel,
    PermissionsString,
} from 'discord.js';
import { Playlist } from './playlist';

export async function get_song(
    link: string,
    author: string,
): Promise<Song | undefined> {
    const youtube = playdl.yt_validate(link);

    if (youtube == 'video') {
        const info = await playdl.video_info(link);

        return {
            link: info.video_details.url,
            title: info.video_details.title as string,
            author,
            platform: 'youtube',
        };
    }

    return undefined;
}

export function transform_array(
    arr: Array<Song>,
    mod: number,
): Array<Array<Song>> {
    let result: Array<Array<Song>> = [];

    if (mod > 0) {
        result = [];
        for (let i = 0; i < arr.length; i += mod) {
            result.push(arr.slice(i, i + mod));
        }
    }

    return result;
}

export function check_permissions(
    permissions: Array<PermissionsString>,
    messages: Array<string>,
    channel: GuildChannel,
    user: ClientUser,
): string | undefined {
    for (const perm of permissions) {
        if (!channel.permissionsFor(user)!.toArray().includes(perm)) {
            return messages[permissions.indexOf(perm)];
        }
    }

    return undefined;
}

export function get_controller_embed(playlist: Playlist, icon: string) {
    let songs = '';
    let authors = '';

    if (playlist.has_prev()) {
        const song = playlist.list[playlist.current - 1];
        songs += `Előző: [${song.title.substring(0, 30).trim()}${
            song.title.length > 30 ? '...' : ''
        }](${song.link})\n`;
        authors += `${song.author}\n`;
    }

    const currentSong = playlist.list[playlist.current];
    songs += `:notes: **Most: [${currentSong.title.substring(0, 30).trim()}${
        currentSong.title.length > 30 ? '...' : ''
    }](${currentSong.link})**\n`;
    authors += `**${currentSong.author}**\n`;

    if (playlist.has_next()) {
        const song = playlist.list[playlist.current + 1];
        songs += `Következő: [${song.title.substring(0, 30).trim()}${
            song.title.length > 30 ? '...' : ''
        }](${song.link})`;
        authors += `${song.author}\n`;
    }

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('**Lejátszási lista**')
        .setThumbnail(icon)
        .addFields({
            name: 'Ismétlés',
            value: playlist!.looping ? 'bekapcsolva' : 'kikapcsolva',
        })
        .addFields(
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
        )
        .setColor(0x0099ff);

    return embed;
}
