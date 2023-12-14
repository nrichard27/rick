import { Collection } from 'discord.js';
import { Playlist } from './playlist';
import { Command } from './interfaces/command.interface';

export type Playlists = Collection<string, Playlist>;
export type Commands = Collection<string, Command>;
