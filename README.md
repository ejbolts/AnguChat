
# Text-video-chat-app

## Overview

**Text-video-chat-app** is an interactive communication platform. It's designed to provide seamless chat experiences, where users can participate in different groups and channels. The application comes with administrative functionalities, allowing management of users, groups, and channels.

## Responsibilities Division between Client and Server

The chat application, while appearing seamless to end-users, is underpinned by a clear division of responsibilities between the client and server. The server provides a RESTful API, which returns JSON data. The client, on the other hand, communicates with this API to achieve desired functionalities.

### Client-Side Responsibilities:

#### UserService (Angular Service)

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

The server is set up using ExpressJS. Additionally, it integrates:

- **PeerServer**: For WebRTC communication, enabling direct data connections between users.
- **Socket.io**: For real-time, bi-directional communication.

#### Middleware:

- **CORS**: Enables cross-origin resource sharing.
- **BodyParser**: Parses incoming request bodies in a middleware before your handlers.

#### API Endpoints:

The server provides several API endpoints to facilitate the operations listed in the `UserService` and `ChatService` on the client side:

## API Routes Documentation

This documentation lists and describes the various API routes used in the chat application. Each route is outlined with its HTTP verb, path, expected parameters, return values, and its purpose.

### User Routes:

1. **Register User**
   - **Route**: `POST /register`
   - **Parameters**:
     - `User` object
   - **Return**: Typically a JSON object containing a message indicating success or an error.
   - **Purpose**: To register a new user in the system.

2. **Login User**
   - **Route**: `POST /login`
   - **Parameters**:
     - `username`: User's username.
     - `password`: User's password.
   - **Return**: A JSON object containing a message indicating success/failure and the authenticated `User` object.
   - **Purpose**: To authenticate a user and log them into the system.

3. **Delete User**
   - **Route**: `DELETE /remove/:userId`
   - **Parameters**: `userId` (from URL)
   - **Return**: A JSON object containing a message indicating success or an error.
   - **Purpose**: To delete a user from the system based on their ID.

4. **Update User Role**
   - **Route**: `PUT /update/:userId/role`
   - **Parameters**:
     - `userId` (from URL)
     - `role`: The new role to assign to the user.
   - **Return**: A JSON object containing a message indicating success or an error.
   - **Purpose**: To update the role of a user in the system.

5. **Get All Users**
   - **Route**: `GET /login`
   - **Parameters**: None
   - **Return**: An array of `User` objects.
   - **Purpose**: To fetch all registered users.

6. **Get User by ID**
   - **Route**: `GET /login/:id`
   - **Parameters**: `id` (from URL)
   - **Return**: A `User` object.
   - **Purpose**: To fetch details of a specific user based on their ID.

### Group Routes:

7. **Create Group**
   - **Route**: `POST /group/create`
   - **Parameters**:
     - `name`: Name of the new group.
     - `userId`: ID of the user creating the group.
   - **Return**: A JSON object containing a message indicating success or an error.
   - **Purpose**: To create a new chat group.

8. **Fetch All Groups**
   - **Route**: `GET /group`
   - **Parameters**: None
   - **Return**: An array of `Group` objects.
   - **Purpose**: To fetch all the chat groups in the system.

9. **Delete Group**
   - **Route**: `DELETE /group/:groupId`
   - **Parameters**: `groupId` (from URL)
   - **Return**: A JSON object containing a message indicating success or an error.
   - **Purpose**: To delete a specific chat group based on its ID.

### Channel Routes:

10. **Create Channel**
   - **Route**: `POST /channel`
   - **Parameters**:
     - `groupId`: ID of the group where the channel will be created.
     - `name`: Name of the new channel.
   - **Return**: A JSON object containing a message indicating success or an error.
   - **Purpose**: To create a new channel within a specific group.

11. **Delete Channel**
   - **Route**: `DELETE /channel/:channelId`
   - **Parameters**: `channelId` (from URL)
   - **Return**: A JSON object containing a message indicating success or an error.
   - **Purpose**: To delete a specific channel based on its ID.

12. **Get Channels by Group ID**
   - **Route**: `GET /group/:groupId/channels`
   - **Parameters**: `groupId` (from URL)
   - **Return**: An array of `Channel` objects associated with the group.
   - **Purpose**: To fetch all channels associated with a specific group.

### Additional Group and Channel Routes:

These routes handle operations like adding/removing users from groups or channels and are critical for maintaining the structure and membership of chat rooms.

Each of these routes can be described similarly, detailing their HTTP verb, expected parameters, return values, and purpose.


- **RESTful API**: The server provides a REST API for structured data operations like CRUD operations for users, groups, and channels.
  
- **Real-time Communication**: For chat functionality, the application uses WebSockets (socket.io) to allow for real-time message broadcasting.

The division of responsibilities ensures that the server handles data management and business logic, while the client focuses on presenting data and interacting with the user. This separation aids in scalability and maintainability.



## Data Structures

This document outlines the various data structures utilised in the chat application, both on the client and server side. These structures are foundational to the application's operations, enabling functionalities such as user management, group and channel organisation, message dissemination, and more.

### Table of Contents

- [User](#user)
- [Group](#group)
- [Channel](#channel)
- [ChatMessage](#chatmessage)

---

<a name="user"></a>
## User

The `User` object represents an individual user within the application. 

```typescript
export interface User {
    _id?: string;
    username: string;
    email: string;
    password?: string;
    role: string;   // 'user', 'groupAdmin', 'superAdmin'
    groups: Array<string>;
    reported?: boolean;
    bannedChannels?: string[];
    pendingGroups?: string[];
}
```

### Description:
- **_id**: A unique identifier for the user, generated on the server-side upon registration.
- **username**: The user's chosen name used during login and displayed in chat rooms.
- **email**: User's email address used for registration.
- **password**: User's password. This field may not always be present for security reasons.
- **role**: Defines the user's privileges in the system. Roles can be 'user', 'groupAdmin', or 'superAdmin'.
- **groups**: A list of group IDs that the user is a part of.
- **reported**: Flag to indicate if the user has been reported.
- **bannedChannels**: Channels the user is banned from.
- **pendingGroups**: Groups the user has requested to join but is awaiting approval.

---


<a name="group"></a>
## Group

Represents a chat group within the application.

```typescript
export interface Group {
    _id: string;
    name: string;
    channels: Channel[];
    admins: string[];
    users?: string[];
    pendingUsers?: string[];
}
```

### Description:
- **_id**: A unique identifier for the group.
- **name**: The name of the chat group.
- **channels**: A list of channels within the group.
- **admins**: A list of user IDs who have administrative rights over the group.
- **users**: User IDs of members in the group.
- **pendingUsers**: User IDs of members who have requested to join the group and are awaiting approval.

---

<a name="channel"></a>
## Channel

A subsection within a group for more topic-specific discussions.

```typescript
export interface Channel {
    _id: string;
    name: string;
    users?: string[];
    bannedUsers?: string[];
}
```

### Description:
- **_id**: A unique identifier for the channel.
- **name**: The name of the channel.
- **users**: User IDs of members in the channel.
- **bannedUsers**: User IDs of members banned from the channel.

---

<a name="chatmessage"></a>
## ChatMessage

An individual message in a chat, containing the message content, sender information, and timestamp.

```typescript
export interface ChatMessage {
    username: string;
    content: string;
    timestamp: Date;
    isSystemMessage?: boolean;
    image?: string | null;  // Base64 encoded image
}
```

### Description:
- **username**: The name of the user who sent the message.
- **content**: The text content of the message.
- **timestamp**: The time the message was sent.
- **isSystemMessage**: A flag to differentiate system-generated messages from user messages.
- **image**: Base64 encoded image string if the message contains an image attachment.

---

This documentation provides a comprehensive look at the foundational data structures that power the chat application, from user management to chat interactions.

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

## Interaction between Client and Server

The interaction between the client (front-end) and the server (back-end) can be outlined by observing the flow of data and the methods that act as bridges between them. Here’s a detailed examination of this interaction:

### Client-Side:

The client-side application, built using Angular, consists of various components representing different parts of the user interface. Each component fetches, displays, and sends data to the server via the services defined (like `UserService` and `ChatService`).

### Server-Side:

The server-side application, typically built with Express.js, hosts endpoints (routes) that handle incoming requests, interact with databases, manage global variables, and send back appropriate responses.

---

### Flow of Interaction:

#### 1. User Registration:

- **Client**: The registration component collects user details.
- **Server**: On form submission, a `POST` request is made to `/register`. The server saves the user data into the database.
- **Global Variables**: None affected.
- **Display Update**: The client may redirect the user to the login page with a success message or display an error based on the server's response.

#### 2. User Login:

- **Client**: The login component collects the username and password.
- **Server**: On form submission, a `POST` request is made to `/login`. The server validates the user credentials.
- **Global Variables**: A session variable to update an indicate the logged-in state of a user.
- **Display Update**: The client may redirect the user to the main chat interface or display a login error.

#### 3. Fetch All Users:

- **Client**: An admin component might request a list of all users.
- **Server**: On component load, a `GET` request to `/login` fetches all users.
- **Global Variables**: None affected directly.
- **Display Update**: The client displays a list/table of all users.

#### 4. Create Group:

- **Client**: A group management component collects the name of the new group.
- **Server**: On form submission, a `POST` request is made to `/group/create`. The server creates a new group and associates it with the creating user.
- **Display Update**: The client updates the list of groups or navigates the user to the newly created group.

#### 5. Sending/Receiving Chat Messages:

- **Client**: The chat component allows users to type and send messages.
- **Server**: Using sockets, when a message is sent, it’s broadcasted to other users in real-time.
- **Display Update**: The chat component updates in real-time, displaying new messages as they arrive.

---

### Git Repository Layout:

The Git repository is structured with two main branches:

- **main**: This branch contains the production-ready code. 
- **development**: All development and feature work is done on this branch. Once a feature or fix is tested and ready, it's merged into the `main` branch.

**Version Control Approach**:
- All feature and bugfix work is done on separate branches off the `development` branch.
- After thorough testing, changes from the development branch are merged into `main` for releases.

