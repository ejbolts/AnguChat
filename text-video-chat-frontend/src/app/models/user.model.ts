// user.model.ts

export interface User {
  _id?: string; // A unique identifier for the user, generated on the server-side upon registration. Optional because when registering a new user, might not have the ID yet. It'll be created in the backend.
  username: string; // The user's chosen name used during login and displayed in chat rooms. Required for registration and login
  password?: string; // Required for registration and login. Marked as optional here because dont want to carry the password around in every user object once logged in.
  role: string; // Defines the user's privileges in the system. Roles can be 'user', 'groupAdmin', or 'superAdmin'.
  profilePic?: string | null; // The s3 URL for the users profile picture
  groups: string[]; // List of group IDs the user is a part of
  reported?: boolean; // Flag to check if user has been reported
  bannedChannels?: string[]; // Channels from which the user is banned
  pendingGroups?: string[]; // Groups they have requested to join but not approved yet
  isOnline: boolean;
}
export interface AdminUser extends User {
  newRole?: string;
}
