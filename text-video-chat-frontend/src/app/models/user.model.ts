// user.model.ts

export interface User {
    id?: string;               // Optional because when registering a new user, might not have the ID yet. It'll be created in the backend.
    username: string;          // Required for registration and login
    email: string;             // Required for registration
    password?: string;         // Required for registration and login. Marked as optional here because may not want to carry the password around in every user object once logged in.
    roles: Array<string>;      // ['user', 'groupAdmin', 'superAdmin']
    groups: Array<string>;     // List of group IDs the user is a part of
}
