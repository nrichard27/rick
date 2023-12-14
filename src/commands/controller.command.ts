import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    GuildChannel,
    SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../interfaces/command.interface';
import { check_permissions, get_controller_embed } from '../utils';

const data = new SlashCommandBuilder()
    .setName('controller')
    .setDescription('Interaktív lejátszó indítása')
    .setDMPermission(false);

const command: Command = {
    data,
    run: async (interaction: ChatInputCommandInteraction) => {
        const playlist = global.playlists.get(interaction.guildId!);

        if (playlist?.controller) {
            return await interaction.reply({
                content: 'Már van egy aktív lejátszó!',
                ephemeral: true,
            });
        }

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

        const playerControls =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev_btn')
                    .setLabel('⏪')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('skip_btn')
                    .setLabel('⏩')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('loop_btn')
                    .setLabel('🔁')
                    .setStyle(ButtonStyle.Primary),
            );

        const botControls = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('play_btn')
                .setLabel('➕')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('dc_btn')
                .setLabel('Lecsatlakozás')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('close_btn')
                .setLabel('Lejátszó bezárása')
                .setStyle(ButtonStyle.Secondary),
        );

        playlist!.controller = true;

        await interaction
            .reply({
                embeds: [
                    get_controller_embed(
                        playlist!,
                        interaction.guild?.iconURL() as string,
                    ),
                ],
                ephemeral: false,
                components: [playerControls, botControls],
            })
            .then(async () => {
                const message = await interaction.fetchReply();

                playlist!.controller_msg = {
                    message_id: message.id,
                    channel_id: message.channelId,
                };
            });
    },
};

export default command;
