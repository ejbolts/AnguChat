
<p align="center">
  <img src="https://github.com/ejbolts/Text-video-chat-app/assets/86194451/c91e065e-e91b-4331-a22f-101a56546d05" alt="AnguChat" />
</p>
<h1 align="center">AnguChat</h1>

<b>Table of Context</b>

- [Overview](#Overview)
- [Architecture](#Architecture)
- [Responsibilities](#Responsibilities)
- [Angular Components](#Angular_Components)

<a name="Overview"></a>
## Overview

[**AnguChat**](https://www.anguchat.com) is a text and video streaming chat app. It's designed to provide seamless chat experiences, where participants can engage in various groups and channels centred around specific topics of interest. Admins have management capabilities, enabling them to oversee members, groups, and channels.

<a name="Architecture"></a>
## Architecture
![Anguchat-Architecture](https://github.com/user-attachments/assets/925a45ae-0e47-4597-8ec4-f09c0529384b)


## Peerjs/WebRTC Connection Lifecycle:
1. Peer A and Peer B use the PeerJS server (signalling server) to exchange connection information (called ICE candidates).
2. Both peers connect to Google's STUN server to discover their public IP addresses and NAT details while simultaneously exchanging with peerjs server.
3. The peers attempt to establish a direct P2P connection using the ICE candidates.
4. If the direct connection fails (due to NAT or firewall restrictions), the peers fall back to using a TURN server to relay the data between them.

![Anguchat Peerjs](https://github.com/user-attachments/assets/320a05a3-767a-4650-b040-2bae094a502b)

## Socketio Connection Lifecycle:
1. Connection Initiation: The client sends an HTTP request to establish an initial handshake with the Socket.IO server.
2. Protocol Negotiation: The server and client decide on the best protocol to use (preferably WebSockets else fallback to long HTTP polling).
3. Bi-directional Communication: Once connected, both client and server can emit and listen for events using the persistent connection.
4. Rooms/Namespaces: Messages can be sent to specific groups (rooms) or communication channels (namespaces).
5. Disconnection and Reconnection: Socket.IO automatically handles connection loss and reconnection attempts.
   
![Anguchat socketio](https://github.com/user-attachments/assets/50deaaca-a497-4ff9-8d52-fd367c2a7e76)

<a name="Responsibilities"></a>
## Responsibilities Division between Client and Server

The chat application, while appearing seamless to end-users, is underpinned by a clear division of responsibilities between the client and server. The server provides a RESTful API, which returns JSON data. The client, on the other hand, communicates with this API to achieve desired functionalities.

In this Git repository, all routes are prefixed with `/api`. This design choice is made to closely mimic the behavior of the production environment. In the production setup, the `/api` prefix is not explicitly included in the URLs. Instead, a reverse proxy configured on the Apache server automatically appends `/api` to each request as it forwards them from the client to the server. This ensures seamless integration and consistency between the development and production environment.


### Client-Side Responsibilities:

#### UserService 

The `UserService` handles various tasks related to user, group, and channel management:

#### ChatService

The `ChatService` is responsible for real-time communication using WebSockets (socket.io). Its primary responsibilities include:

- Manage socket connection to the server.
- Send a message to the server for broadcast.
- Listen for system and user messages from the server.

### Server-Side Responsibilities:

The server is set up using ExpressJS. Additionally, it integrates two HTTP servers on port 3000 for SocketIO and 3001 for PeerJS:

- **PeerServer**: For WebRTC communication, enabling direct data connections between users.
- **Socket.io**: For real-time, bi-directional communication.


<a name="Angular_Components"></a>
## Angular Components:

- **LoginComponent**:
  - Activated when the user navigates to `/login`. It contains fields for the user to input their credentials and communicates with the backend to authenticate the user. If authentication is successful, the user is redirected to the chat interface.

- **RegisterComponent**:
  - Presented when a new user accesses `/register`. This component collects the necessary details for user registration, including username, email, and password, and sends them to the backend for processing.

- **ChatComponent**:
  - This is the heart of the chat experience. Once a user is authenticated, they're brought to this component. Here, they can view the groups and channels they're part of, start conversations, and interact with other users.

- **AdminDashboardComponent**:
  - Exclusive to admin users. This component offers functionalities like user management, group/channel management, and other administrative tasks.
