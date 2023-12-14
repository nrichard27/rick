import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection,
} from '@discordjs/voice';
import { ControllerMessage } from './interfaces/controller.interface';
import { Song } from './interfaces/song.interface';
import playdl from 'play-dl';
import { GuildChannel, GuildTextBasedChannel } from 'discord.js';
import { check_permissions, get_controller_embed } from './utils';

export class Playlist {
    id: string;
    list: Array<Song>;
    current: number;
    private player: AudioPlayer;
    looping: boolean;
    controller: boolean;
    controller_msg?: ControllerMessage;

    constructor(guild_id: string) {
        this.id = guild_id;
        this.list = [];
        this.current = 0;
        this.player = createAudioPlayer();
        this.looping = false;
        this.controller = false;
        this.controller_msg = undefined;

        this.player.on(AudioPlayerStatus.Idle, () => {
            if (this.looping) {
                this.play();
            } else {
                this.skip();
            }

            if (this.controller) {
                (async () => {
                    const guild = global.client.guilds.cache.get(this.id);

                    const channel = guild!.channels.cache.get(
                        this.controller_msg!.channel_id,
                    ) as GuildTextBasedChannel;

                    const permissions = check_permissions(
                        ['ViewChannel', 'ManageMessages', 'ReadMessageHistory'],
                        ['asd', 'asd', 'asd'],
                        channel as GuildChannel,
                        global.client.user!,
                    );

                    if (!permissions) {
                        const message = (await channel?.messages.fetch()).get(
                            this.controller_msg!.message_id,
                        );

                        await message?.edit({
                            embeds: [
                                get_controller_embed(
                                    this,
                                    guild?.iconURL() as string,
                                ),
                            ],
                        });
                    }
                })();
            }
        });

        this.player.on('error', (error) => {
            console.log(`PLAYLIST PLAYER ERROR: ${error}`);
        });
    }

    add(song: Song) {
        this.list.push(song);
    }

    async play(song?: Song) {
        const connection = getVoiceConnection(this.id);

        this.player.stop();

        if (song) {
            this.add(song);
            this.current = this.list.length - 1;
        }

        const stream = await playdl.stream(this.list[this.current].link);
        const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
        });

        this.player.play(resource);

        connection?.subscribe(this.player);
    }

    has_prev() {
        return this.list[this.current - 1] != undefined;
    }

    has_next() {
        return this.list[this.current + 1] != undefined;
    }

    prev() {
        if (this.has_prev()) {
            this.current -= 1;
            this.play();
            return true;
        } else {
            return false;
        }
    }

    skip() {
        if (this.has_next()) {
            this.current += 1;
            this.play();
            return true;
        } else {
            this.player.pause();
            return false;
        }
    }

    loop() {
        this.looping = !this.looping;
        return this.looping;
    }

    is_idle() {
        return (
            this.player.state.status == 'idle' ||
            this.player.state.status == 'paused' ||
            this.player.state.status == 'autopaused'
        );
    }

    async disconnect() {
        this.player.stop();

        const connection = getVoiceConnection(this.id);
        connection?.destroy();
    }

    get_current() {
        return this.current;
    }
}
