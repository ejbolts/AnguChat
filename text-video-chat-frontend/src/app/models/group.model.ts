import { Channel } from './channel.model';
export interface Group {
    id: string;
    name: string;
    channels: Channel[];
    admins: string[];  // Array of User IDs who are admins of this group
}