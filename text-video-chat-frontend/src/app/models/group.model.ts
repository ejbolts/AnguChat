import { Channel } from './channel.model';
export interface Group {
  _id: string; // A unique identifier for the group.
  name: string; // The name of the chat group.
  channels: Channel[]; // A list of channels within the group.
  admins: string[]; // A list of user IDs who have administrative rights over the group.
  users?: string[]; // User IDs of members in the group.
  pendingUsers?: string[]; // User IDs of members who have requested to join the group and are awaiting approval.
}
