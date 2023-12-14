import { getVoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction, GuildMember } from 'discord.js';

export async function handle_command_interaction(
    interaction: ChatInputCommandInteraction,
) {
    const command = global.commands.get(interaction.commandName);

    if (!command) {
        return interaction.reply({
            content: 'Hiba történt a parancs futtatása közben!',
            ephemeral: true,
        });
    }

    if (!['play', 'devinfo', 'leave'].includes(command.data.name)) {
        const connection = getVoiceConnection(interaction.guildId!);

        if (!connection) {
            return await interaction.reply({
                content: 'Rick nincs bent egy hangszobában sem!',
                ephemeral: true,
            });
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
                .channelId !=
            (interaction.member as GuildMember).voice.channelId
        ) {
            return await interaction.reply({
                content: 'Ugyan abban a hangszobában kell lenned mint Rick!',
                ephemeral: true,
            });
        }
    }

    try {
        await command.run(interaction);
    } catch (error) {
        console.log(error);
        await interaction.reply({
            content: 'Hiba történt a parancs futtatása közben!',
            ephemeral: true,
        });
    }
}
