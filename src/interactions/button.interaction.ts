import {
    ActionRowBuilder,
    ButtonInteraction,
    GuildChannel,
    GuildMember,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { check_permissions, get_controller_embed } from '../utils';
import { getVoiceConnection } from '@discordjs/voice';

export async function handle_button_interaction(
    interaction: ButtonInteraction,
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

    if (!(interaction.member as GuildMember).voice.channel) {
        return await interaction.reply({
            content:
                'A parancs használatához lépj be a hangszobába ahol Rick van!',
            ephemeral: true,
        });
    }

    if (
        interaction.guild?.members.cache.get(client.user!.id)?.voice
            .channelId != (interaction.member as GuildMember).voice.channelId
    ) {
        return await interaction.reply({
            content: 'Ugyan abban a hangszobában kell lenned mint Rick!',
            ephemeral: true,
        });
    }

    if (interaction.customId == 'play_btn') {
        const modal = new ModalBuilder()
            .setCustomId('addSong')
            .setTitle('Zene hozzáadása')
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('linkInput')
                        .setLabel('YouTube Link:')
                        .setPlaceholder('YouTube video link')
                        .setStyle(TextInputStyle.Short)
                        .setValue('')
                        .setRequired(true),
                ),
            );

        return await interaction.showModal(modal);
    }

    await interaction.deferUpdate();

    if (interaction.customId == 'close_btn') {
        playlist!.controller = false;
        playlist!.controller_msg = undefined;

        await interaction.message.edit({
            content: 'A lejátszó lejárt. Készíts újat!',
            components: [],
            embeds: [],
        });

        return;
    }

    if (interaction.customId == 'dc_btn') {
        interaction.message.edit({
            content: 'A lejátszó lejárt. Készíts újat!',
            components: [],
            embeds: [],
        });

        const connection = getVoiceConnection(playlist!.id);
        await connection?.destroy();

        global.playlists.delete(playlist!.id);

        return;
    }

    switch (interaction.customId) {
        case 'prev_btn':
            playlist?.prev();
            break;
        case 'skip_btn':
            playlist?.skip();
            break;
        case 'loop_btn':
            playlist?.loop();
            break;
    }

    interaction.message.edit({
        embeds: [
            get_controller_embed(
                playlist!,
                interaction.guild?.iconURL() as string,
            ),
        ],
    });
}
