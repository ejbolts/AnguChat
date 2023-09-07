export interface Channel {
    id?: string;                  // Channel ID. 
    name: string;                 // Channel name.
    groupId: string;              // ID of the group this channel belongs to.
    members: Array<string>;       // List of user IDs who can access this channel.
}