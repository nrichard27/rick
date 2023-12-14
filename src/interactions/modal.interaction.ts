import { GuildChannel, GuildMember, ModalSubmitInteraction } from 'discord.js';
import { check_permissions, get_controller_embed, get_song } from '../utils';
import { getVoiceConnection } from '@discordjs/voice';

export async function handle_modal_interaction(
    interaction: ModalSubmitInteraction,
) {
    const playlist = global.playlists.get(interaction.guildId!);

    const permissions = check_permissions(
        ['ViewChannel', 'SendMessages', 'ManageMessages', 'EmbedLinks'],
        [
            'Nincs jogom megnézni ezt a csatornát!',
            'Nincs jogom üzenetet küldeni ezen a csatornán!',
            'Nincs jogom üzeneteket kezelni ezen a csatornán!',
            'Nincs jogom linkeket küldeni ezen a csatornán!',
        ],
        interaction.channel as GuildChannel,
        global.client.user!,
    );

    if (permissions) {
        return await interaction.reply({
            content: permissions,
            ephemeral: true,
        });
    }

    const connection = getVoiceConnection(playlist!.id);

    if (!connection) {
        await interaction.message?.delete();
    }

    if (interaction.customId == 'addSong') {
        const link = interaction.fields.getTextInputValue('linkInput');

        const song = await get_song(
            link,
            (interaction.member as GuildMember).user.tag,
        );

        if (!song) {
            return await interaction.reply({
                content: 'A link rossz vagy ilyen zene nem található!',
                ephemeral: true,
            });
        }

        if (playlist?.is_idle()) {
            playlist?.play(song);
        } else {
            playlist?.add(song);
        }

        await interaction.message?.edit({
            embeds: [
                get_controller_embed(
                    playlist!,
                    interaction.guild?.iconURL() as string,
                ),
            ],
        });

        await interaction.reply({
            content: `Lejátszás: ${song.link}`,
            ephemeral: true,
        });
    }
}
