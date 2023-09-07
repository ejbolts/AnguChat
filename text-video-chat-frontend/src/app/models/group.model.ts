import { Channel } from './channel.model';
export interface Group {
    id: string;
    name: string;
    channels: Channel[];
    admins: string[]; // Admin IDs
    users?: string[]; // User IDs. Marked as optional initially.
}
