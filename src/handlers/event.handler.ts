import fs from 'node:fs';
import path from 'node:path';
import { Event, is_event } from '../interfaces/event.interface';

export async function handle_events() {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs
        .readdirSync(eventsPath)
        .filter((file) => file.endsWith('.event.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);

        const event: Event = (await import(filePath)).default;

        if (is_event(event)) {
            if (event.once) {
                global.client.once(event.name, (...args) => event.run(...args));
            } else {
                global.client.on(event.name, (...args) => event.run(...args));
            }
        } else {
            console.log(
                `[WARNING] ${filePath} is not an event file! Skipping...`,
            );
        }
    }

    return commands;
}
