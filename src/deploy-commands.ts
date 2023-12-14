import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { Command, is_command } from './interfaces/command.interface';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const rest = new REST().setToken(process.env.RICK_DISCORD_TOKEN as string);

(async () => {
    const commands: unknown[] = [];

    const commandsPath = path.join(__dirname, './commands');
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.command.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);

        const command: Command = (await import(filePath)).default;

        if (is_command(command)) {
            commands.push(command.data.toJSON());
        } else {
            console.log(
                `[WARNING] ${filePath} is not a command file! Skipping...`,
            );
        }
    }

    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`,
        );

        const data: Array<unknown> = (await rest.put(
            Routes.applicationCommands(
                process.env.RICK_DISCORD_APP_ID as string,
            ),
            { body: commands },
        )) as Array<unknown>;

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`,
        );
    } catch (error) {
        console.error(error);
    }
})();
