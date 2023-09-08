
# Text-video-chat-app

## Overview

**Text-video-chat-app** is an interactive communication platform. It's designed to provide seamless chat experiences, where users can participate in different groups and channels. The application comes with administrative functionalities, allowing management of users, groups, and channels.

## REST API Description

The frontend, built using Angular, communicates with a Node.js backend via a REST API. The routes utilised are as follows:

### Frontend Routes:

- **Login Route** 
  - **Path**: `/login`
  - **Component**: `LoginComponent`
  - **Purpose**: Authenticate users.

- **Register Route** 
  - **Path**: `/register`
  - **Component**: `RegisterComponent`
  - **Purpose**: Register new users.

- **Chat Route**
  - **Path**: `/chat`
  - **Component**: `ChatComponent`
  - **Purpose**: Serve as the primary chat interface.

- **Admin Dashboard Route**
  - **Path**: `/admin`
  - **Component**: `AdminDashboardComponent`
  - **Purpose**: Offer administrative functionalities.

*Note*: Users who haven't logged in will be redirected to the login page by default.



### Data Structures:

- **User**:
  - The `User` data structure is crucial for both authentication and user profile management. When a user registers, their details (username, email, role, etc.) are stored in the form of a `User` object. During the login process, the `username` and `password` fields are primarily used to verify the user's identity.
  - Example: When a user logs in, the application fetches a `User` object associated with the provided credentials. Once authenticated, this object can be used to populate user details in the chat interface.

- **AdminUser**:
  - `AdminUser` is an extended form of `User`. The unique attribute `newRole` allows admins to modify the roles of users within the platform.
  - Example: In the admin dashboard, an admin might select a user and change their role to a group admin. The `newRole` attribute will hold this new role designation.

- **Group**:
  - Represents distinct chat groups. Each group can contain multiple channels. Groups also maintain a list of their administrators and regular users.
  - Example: When users access the chat, they see a list of groups they are part of, represented by multiple `Group` objects. Upon selecting a group, they can view and interact with its channels.

- **Channel**:
  - Within each group, there are multiple channels. A `Channel` data structure contains details about each channel, including its users and any users banned from that channel.
  - Example: Within a "Work" group, there might be channels like "Announcements" and "General Discussion", each represented by a `Channel` object.

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

---
- **Services**:
  - **UserService**: Retrieves all users.
  - **ChatService**: Will be implemented in phase 2.
  - **AuthenticationService**: Manages user login, interfacing with the backend API.

### Git Repository Layout:

The Git repository is structured with two main branches:

- **main**: This branch contains the production-ready code. 
- **development**: All development and feature work is done on this branch. Once a feature or fix is tested and ready, it's merged into the `main` branch.

**Version Control Approach**:
- All feature and bugfix work is done on separate branches off the `development` branch.
- After thorough testing, changes from the development branch are merged into `main` for releases.

---

## Future Phases:

In the upcoming Phase 2, will be integrating the **ChatService**, enhancing the functionalities of the chat platform. The **AuthenticationService** will be further fleshed out with mongoDB. 
