import { Client, Events } from 'discord.js';
import { Event } from '../interfaces/event.interface';

const event: Event = {
    name: Events.ClientReady,
    once: true,
    run: (c: Client) => {
        console.log(`Ready! Logged in as ${c.user!.tag}`);
    },
};

export default event;
