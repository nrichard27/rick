/* eslint-disable no-var */
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { get_commands } from './handlers/command.handler';
import { handle_events } from './handlers/event.handler';
import { Commands, Playlists } from './types';

declare global {
    var client: Client;
    var playlists: Playlists;
    var commands: Commands;
}

global.client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

(async () => {
    global.playlists = new Collection();
    global.commands = await get_commands();

    await handle_events();

    client.login(process.env.RICK_DISCORD_TOKEN);
})();
