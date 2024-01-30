import { ChatMessage } from './chatmessage.model';

export interface Channel {
  _id: string; // A unique identifier for the channel.
  name: string; // The name of the channel.
  users?: string[]; // User IDs of members in the channel.
  history: ChatMessage[]; // An array of ChatMessages objects that are loaded in for DB upon login.
}
