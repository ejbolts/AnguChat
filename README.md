
# AnguChat

![294302427-36ac81db-9fc5-41f2-b09f-62e11c245342](https://github.com/ejbolts/Text-video-chat-app/assets/86194451/c91e065e-e91b-4331-a22f-101a56546d05)


### Table of Contents

- [Overview](#Overview)
- [Architecture](#Architecture)
- [Responsibilities](#Responsibilities)
- [Data Structures](#Data_Structures)
- [Angular Components](#Angular_Components)

<a name="Overview"></a>
## Overview

**AnguChat** is a text and video streaming chat app. It's designed to provide seamless chat experiences, where users can participate in different groups and channels. The application comes with administrative functionalities, allowing management of users, groups, and channels.

<a name="Architecture"></a>
## Architecture

![Anguchat_Diagram](https://github.com/ejbolts/Text-video-chat-app/assets/86194451/cc6729fd-a50d-4864-a716-c1f87daeda8b)

## Responsibilities Division between Client and Server

The chat application, while appearing seamless to end-users, is underpinned by a clear division of responsibilities between the client and server. The server provides a RESTful API, which returns JSON data. The client, on the other hand, communicates with this API to achieve desired functionalities.
<a name="Responsibilities"></a>
### Client-Side Responsibilities:

#### UserService 


The `UserService` handles various tasks related to user, group, and channel management:

- **User Management**:
  - Register a user
  - Login a user
  - Delete a user
  - Update a user's role
  - Fetch all users
  - Fetch a specific user by ID

- **Group Management**:
  - Create a group
  - Fetch all groups
  - Delete a group
  - Add a user to a group
  - Remove a user from a group
  - Allow a user to join a group
  - Approve a user for a group

- **Channel Management**:
  - Create a channel within a group
  - Delete a channel
  - Get channels based on group ID
  - Add a user to a channel
  - Remove a user from a channel

#### ChatService (Angular Service)

The `ChatService` is responsible for real-time communication using WebSockets (socket.io). Its primary responsibilities include:

- Manage socket connection to the server.
- Send a message to the server for broadcast.
- Listen for system and user messages from the server.

### Server-Side Responsibilities:

#### General Setup:

The server is set up using ExpressJS. Additionally, it integrates two HTTP servers on port 3000 for SocketIO and 3001 for PeerJS:

- **PeerServer**: For WebRTC communication, enabling direct data connections between users.
- **Socket.io**: For real-time, bi-directional communication.



<a name="Data_Structures"></a>
## Data Structures

Outlines the various data structures utilised in the chat application, both on the client and server side. These structures are foundational to the application's operations, enabling functionalities such as user management, group and channel organisation, message dissemination, and more.


## User

Represents an individual user within the application. 

```typescript
export interface User {
    _id?: string;               // A unique identifier for the user, generated on the server-side upon registration. Optional because when registering a new user, might not have the ID yet. It'll be created in the backend.
    username: string;           // The user's chosen name used during login and displayed in chat rooms. Required for registration and login
    email: string;              //  User's email address used for registration. 
    password?: string;          // Required for registration and login. Marked as optional here because dont want to carry the password around in every user object once logged in.
    role: string;               // Defines the user's privileges in the system. Roles can be 'user', 'groupAdmin', or 'superAdmin'.
    profilePic?: string | null; // The s3 URL for the users profile picture
    groups: string[];           // List of group IDs the user is a part of
}
```
---
## Group

Represents a chat group within the application.

```typescript
export interface Group {
    _id: string;             // A unique identifier for the group.
    name: string;            // The name of the chat group.
    channels: Channel[];     // A list of channels within the group.
    admins: string[];        // A list of user IDs who have administrative rights over the group.
    users?: string[];        // User IDs of members in the group.
    pendingUsers?: string[]; // User IDs of members who have requested to join the group and are awaiting approval.
}
```
---
## Channel

A subsection within a group for more topic-specific discussions.

```typescript
export interface Channel {
    _id: string;            // A unique identifier for the channel.
    name: string;           // The name of the channel.
    users?: string[];       // User IDs of members in the channel.
    history: ChatMessage[]; // An array of ChatMessages objects that are loaded in for DB upon login.
}
```
---
## ChatMessage

An individual message in a chat, containing the message content, sender information, and timestamp.

```typescript
export interface ChatMessage {
    username: string;           // The name of the user who sent the message.
    content: string;            // The text content of the message.
    timestamp: Date;            // The time the message was sent.
    isSystemMessage?: boolean;  // A flag to differentiate system-generated messages from user messages.
    image?: string | null;      // Base64 encoded image string if the message contains an image attachment.
    channelId?: string;         // Used for displaying the right message in the correct channel.
    profilePic?: string | null; // The s3 URL for displaying the profile picture of the user.
  }
```
<a name="Angular_Components"></a>

### Angular Components:

- **LoginComponent**:
  - Activated when the user navigates to `/login`. It contains fields for the user to input their credentials and communicates with the backend to authenticate the user. If authentication is successful, the user is redirected to the chat interface.
  - Example: A returning user visits the application and is directed to the login page. They enter their details and, once verified, are taken to the main chat page.

- **RegisterComponent**:
  - Presented when a new user accesses `/register`. This component collects the necessary details for user registration, including username, email, and password, and sends them to the backend for processing.
  - Example: A first-time user wishes to join the platform. They access the registration page, fill in their details, and upon successful registration, are redirected to the login page.

- **ChatComponent**:
  - This is the heart of the chat experience. Once a user is authenticated, they're brought to this component. Here, they can view the groups and channels they're part of, start conversations, and interact with other users.
  - Example: A user enters the chat, sees the list of groups, selects a group, and starts chatting in one of its channels.

- **AdminDashboardComponent**:
  - Exclusive to admin users. This component offers functionalities like user management, group/channel management, and other administrative tasks.
  - Example: An admin logs into their dashboard. They see a list of users and decide to promote one to the role of group admin. They also create a new group and add channels to it.
