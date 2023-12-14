import { ClientEvents } from 'discord.js';

export interface Event {
    name: keyof ClientEvents;
    once: boolean;
    run: (...args) => void;
}

export function is_event(obj: object) {
    return 'name' in obj && 'once' in obj && 'run' in obj;
}
