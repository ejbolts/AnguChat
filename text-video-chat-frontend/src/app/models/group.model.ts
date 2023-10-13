import { Channel } from './channel.model';
export interface Group {
    _id: string;
    name: string;
    channels: Channel[];
    admins: string[]; // Admin IDs
    users?: string[]; // User IDs. Marked as optional initially.
    pendingUsers?: string[]; // Users awaiting approval to join
}
