import { Collection } from 'discord.js';
import { Commands } from '../types';
import { Command, is_command } from '../interfaces/command.interface';
import fs from 'node:fs';
import path from 'node:path';

export async function get_commands(): Promise<Commands> {
    const commands = new Collection<string, Command>();

    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.command.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);

        const command: Command = (await import(filePath)).default;

        if (is_command(command)) {
            commands.set(command.data.name, command);
        } else {
            console.log(
                `[WARNING] ${filePath} is not a command file! Skipping...`,
            );
        }
    }

    return commands;
}
