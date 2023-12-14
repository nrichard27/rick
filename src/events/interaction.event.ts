import { BaseInteraction, Events } from 'discord.js';
import { Event } from '../interfaces/event.interface';
import { handle_command_interaction } from '../interactions/command.interaction';
import { handle_button_interaction } from '../interactions/button.interaction';
import { handle_modal_interaction } from '../interactions/modal.interaction';

const event: Event = {
    name: Events.InteractionCreate,
    once: false,
    run: (interaction: BaseInteraction) => {
        if (interaction.isChatInputCommand()) {
            return handle_command_interaction(interaction);
        }

        if (interaction.isButton()) {
            return handle_button_interaction(interaction);
        }

        if (interaction.isModalSubmit()) {
            return handle_modal_interaction(interaction);
        }
    },
};

export default event;
