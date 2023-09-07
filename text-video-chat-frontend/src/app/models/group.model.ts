export interface Group {
    id?: string;                  // Group ID.
    name: string;                 // Group name.
    members: Array<string>;       // List of user IDs who are members of the group.
    admins: Array<string>;        // List of user IDs who are admins of the group.
    channels: Array<string>;      // List of channel IDs under this group.
    createdBy: string;            // User ID of the person who created the group. Useful for permissions.
}