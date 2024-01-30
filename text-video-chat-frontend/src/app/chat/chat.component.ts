import { Component, HostListener, OnInit } from '@angular/core';
import { Group } from '../models/group.model';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { Channel } from '../models/channel.model';
import { UserService } from '../services/user.service';
import { ChatService } from '../services/chat.service';
import { ChatMessage } from '../models/chatmessage.model';
import Peer, { MediaConnection } from 'peerjs';
import { IncomingCallDetails } from '../models/callDetails.model';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  apiUrl = environment.apiUrl;
  isModalOpen: boolean = true;
  isOnline: boolean = false;

  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  typingStatus: { [channelId: string]: string } = {};

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }
  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(_: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (window.innerWidth <= 720) {
      this.isModalOpen = false;
    } else {
      this.isModalOpen = true;
    }
  }
  // Channel information
  channels: Channel[] = [];
  channelMessages = new Map<string, string>();
  channelId!: string;

  // Group and user information
  groupChannels: { [groupId: string]: Channel[] } = {};
  allGroups: Group[] = [];
  currentUser: User | null = null;
  users: User[] = [];
  guestUserID = '65796d84170bc85f6fbb4c30';
  // Image management
  selectedImage: string | null = null; // Base64 encoded image string
  selectedImageChannelId: string | null = null;
  selectedImages = new Map<string, string | ArrayBuffer>();

  // Call management
  private peer!: Peer;
  private localStream?: MediaStream;
  incomingCallFrom: string | null = null;
  private incomingCall: MediaConnection | null = null;
  incomingCallDetails: IncomingCallDetails | null = null;
  private activeCall: MediaConnection | null = null;
  isCallActive: boolean = false;
  private anotherUserSocketID: string | null = null;

  // Error handling
  errorMessage?: string;
  chatErrorMessage?: string;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private chatService: ChatService
  ) {
    this.chatService.incomingCallEvent.subscribe(
      (callDetails: IncomingCallDetails) => {
        //console.log("Received incoming call event:", callDetails);
        this.incomingCallDetails = callDetails; // Store the entire callDetails object
      }
    );
    this.chatService.socket.on('call-declined', (data: { message: string }) => {
      alert(data.message);
      this.stopCall();
    });

    this.chatService.getUserTyping().subscribe(({ channelId, message }) => {
      // used for displaying only to other users that the currently logged in user is tpying.
      if (message.indexOf(this.currentUser!.username) === -1) {
        this.typingStatus[channelId] = message;
        if (this.typingTimer !== null) {
          clearTimeout(this.typingTimer);
        }
        this.typingTimer = setTimeout(
          () => (this.typingStatus[channelId] = ''),
          3000
        );
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.checkScreenSize();
    this.isLoading = true;
    await this.fetchGroups();
    await this.fetchUsers();
    this.isLoading = false;
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }

    this.chatService.getMessages().subscribe((msg: ChatMessage) => {
      //console.log("Received message for channel", msg);

      // Iterate through each group
      Object.values(this.groupChannels).forEach((channels) => {
        // Find the channel within the group channels
        let channel = channels.find((c) => c._id === msg.channelId);
        if (channel) {
          channel.history.push(msg);
          //console.log("Channel history:", channel.history);
        }
      });
    });

    this.peer = new Peer({
      host: 'localhost',
      port: 3001,
      path: '/',
    });

    this.peer.on('open', (peerId) => {
      this.chatService.peerId = peerId;
      const currentUserId =
        JSON.parse(sessionStorage.getItem('currentUser')!)?._id ?? '';
      this.chatService.userId = currentUserId;
      this.chatService.sendConnectionIDs(currentUserId, peerId);
    });
    this.peer.on('call', (call) => {
      this.isCallActive = true;
      this.incomingCall = call;
    });
    this.peer.on('close', () => {
      //console.log("Peer connection is destroyed.");
    });

    this.chatService.getLoginUpdates().subscribe((userId: string) => {
      const userIndex = this.users.findIndex((user) => user._id === userId);
      if (userIndex !== -1) {
        this.users[userIndex].isOnline = true;
      }
    });
    this.chatService.getlogoutUser().subscribe((userId: string) => {
      const userIndex = this.users.findIndex((user) => user._id === userId);
      if (userIndex !== -1) {
        this.users[userIndex].isOnline = false;
      }
    });
  }

  async fetchGroups(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.fetchAllGroups().subscribe(
        async (data: Group[]) => {
          this.allGroups = data;

          try {
            for (const group of this.allGroups) {
              await this.fetchChannelsPerGroup(group._id);
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        (error: Error) => {
          console.error('Error fetching groups:', error);
          reject(error);
        }
      );
    });
  }

  fetchUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getUsers().subscribe(
        (users: User[]) => {
          this.users = users;
          resolve();
        },
        (error) => {
          console.error('Error fetching users:', error);
          reject(error);
        }
      );
    });
  }

  async fetchChannelsPerGroup(groupId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getChannelsByGroupId(groupId).subscribe(
        (channels: Channel[]) => {
          this.groupChannels[groupId] = channels;
          resolve();
        },
        (error: Error) => {
          console.error('Error fetching channels:', error);
          reject(error);
        }
      );
    });
  }

  /*The image file is read into an Image object.
    Once loaded, the image is drawn onto a canvas at a reduced size.
    The canvas.toDataURL method is used to get the compressed image as a Base64 string.
    The second argument (0.3 in this case) is the quality parameter, which can be adjusted
    to balance between size and quality.*/

  onImageSelected(event: Event, channelId: string): void {
    const eventInput = event.target as HTMLInputElement;
    if (!eventInput.files) {
      return;
    }

    const file: File = eventInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress the image and get the new Base64 string
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.3);
          this.selectedImages.set(channelId, compressedBase64);
          this.selectedImage = compressedBase64;
          this.selectedImageChannelId = channelId;
        };
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(channelId: string): void {
    // Remove the image for the specific channel ID
    this.selectedImages.delete(channelId);
  }
  startCall(userId: string | undefined, username: string): void {
    // Check for undefined userId
    if (!userId) {
      console.error('User ID is undefined');
      this.errorMessage = 'User ID is undefined.';
      return;
    }
    // Activate call flag
    this.isCallActive = true;

    this.userService.getUsersConnectionInfo(userId).subscribe(
      (connectionInfo) => {
        if (this.chatService.socketId && this.chatService.peerId) {
          const peerIdToCall = connectionInfo.peerId;
          this.anotherUserSocketID = connectionInfo.socketId;

          // Access user's webcam and microphone
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
              this.localStream = stream;
              const localVideo = document.getElementById(
                'localVideo'
              ) as HTMLVideoElement;
              localVideo.muted = true;
              localVideo.srcObject = stream;

              if (peerIdToCall && this.anotherUserSocketID) {
                this.chatService.startCall(this.anotherUserSocketID, username);
                const outgoingCall = this.peer.call(
                  peerIdToCall,
                  this.localStream
                );
                this.activeCall = outgoingCall; // Set the active call
                outgoingCall.on('stream', (remoteStream) => {
                  const remoteVideo = document.getElementById(
                    'remoteVideo'
                  ) as HTMLVideoElement;
                  remoteVideo.srcObject = remoteStream;
                  this.errorMessage = '';
                });

                if (this.activeCall) {
                  this.activeCall.on('close', () => {
                    this.stopCall(); // Use stopCall to handle cleanup
                  });
                }
              } else {
                console.error('Peer ID not provided');
              }
            })
            .catch((error: Error) => {
              console.log(error);
              this.errorMessage = 'Error accessing media devices';
              return;
            });
        }
      },
      (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.errorMessage = 'User Not Online.';
          return;
        }
        if (error.status === 500) {
          this.errorMessage = 'Internal Server Error Sorry!';
          return;
        }
      }
    );
    // on successful call
    this.errorMessage = '';
  }

  acceptCall(): void {
    if (this.incomingCall) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          this.localStream = stream;
          const localVideo = document.getElementById(
            'localVideo'
          ) as HTMLVideoElement;
          localVideo.muted = true;
          localVideo.srcObject = stream;

          // Answer the call with the local stream
          this.incomingCall?.answer(stream);
          this.activeCall = this.incomingCall; // Set the active call

          // Listen for the remote stream
          this.incomingCall?.on('stream', (remoteStream: MediaStream) => {
            const remoteVideo = document.getElementById(
              'remoteVideo'
            ) as HTMLVideoElement;
            remoteVideo.srcObject = remoteStream;
          });
          if (this.activeCall) {
            this.activeCall.on('close', () => {
              this.stopCall(); // Use stopCall to handle cleanup
            });
          }
        })
        .catch((error) => {
          console.error('Error accessing media devices.', error);
        });
      this.incomingCallDetails = null;
    } else {
      console.error('No incoming call to accept!');
    }
  }

  resetCallUI(): void {
    // Resetting state variables
    this.incomingCall = null;
    this.localStream = undefined;

    // Stopping the local video stream if it exists
    const localVideo = document.getElementById(
      'localVideo'
    ) as HTMLVideoElement;
    if (localVideo.srcObject) {
      const stream = localVideo.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      localVideo.srcObject = null;
    }
    // Resetting the remote video element
    const remoteVideo = document.getElementById(
      'remoteVideo'
    ) as HTMLVideoElement;
    remoteVideo.srcObject = null;
  }

  stopCall(): void {
    // Stop the local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = undefined;

      const localVideo = document.getElementById(
        'localVideo'
      ) as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = null;
      }
    }

    // Reset the remote video
    const remoteVideo = document.getElementById(
      'remoteVideo'
    ) as HTMLVideoElement;
    if (remoteVideo) {
      remoteVideo.srcObject = null;
    }

    // Close any active call
    if (this.activeCall) {
      this.activeCall.close();
      this.activeCall = null;
    }

    // Reset incoming call information
    this.incomingCall = null;
    this.incomingCallFrom = null;
    this.isCallActive = false;
  }

  ngOnDestroy(): void {
    this.stopCall();
    if (this.typingTimer !== null) {
      clearTimeout(this.typingTimer);
    }
  }

  declineCall(): void {
    if (this.incomingCall && this.incomingCallDetails?.socketID) {
      //console.log("Declining call from Socket ID:", this.incomingCallDetails.socketID);

      this.chatService.calldeclined(this.incomingCallDetails.socketID);
      this.incomingCall.close(); // Close the incoming call
      this.incomingCall = null; // Reset the incoming call to hide the UI
      this.incomingCallDetails = null; // Reset caller info
      this.stopCall(); // Stop the call and reset UI
    }
  }
  joinGroup(group: Group): void {
    const currentUserId =
      JSON.parse(sessionStorage.getItem('currentUser')!)?._id ?? '';
    //console.log(group._id ,currentUserId)
    this.userService.addUserToGroup(group._id, currentUserId).subscribe(
      (response) => {
        this.fetchGroups();
        // Optionally, update your UI or provide feedback to the user here
      },
      (error) => {
        console.error('Error joining group:', error);
      }
    );
  }

  logout(): void {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')!);
    if (currentUser) {
      const currentUsername = currentUser.username;
      const currentUserId = currentUser._id;

      this.chatService.logoutUser(currentUsername, currentUserId).subscribe({
        next: (response) => {
          //console.log(response.message);
        },
        error: (error) => {
          console.error('Logout error:', error);
        },
        complete: () => {
          sessionStorage.removeItem('currentUser');
          this.router.navigate(['/login']);
        },
      });
    } else {
      console.error('No current user found in sessionStorage');
    }
  }

  isMemberOfGroup(groupId: string): boolean {
    const group = this.allGroups.find((g) => g._id === groupId);

    if (!group) {
      console.error('Group not found:', groupId);
      return false;
    }

    return group.users?.includes(this.currentUser?._id ?? '') || false;
  }

  removeUserFromGroup(groupId: string): void {
    const currentUserId =
      JSON.parse(sessionStorage.getItem('currentUser')!)?._id ?? '';
    this.userService.removeUserFromGroup(groupId, currentUserId).subscribe(
      () => {
        //console.log('User removed from group successfully');
        this.fetchGroups();
      },
      (error: Error) => {
        console.error('Error removing user from group:', error);
      }
    );
  }

  handleSendMessages(channelId: string): void {
    const messageToSend = this.channelMessages.get(channelId) || '';
    const imageToSend = this.selectedImages.get(channelId);

    if (this.currentUser && (messageToSend.trim() !== '' || imageToSend)) {
      const chatMessage: ChatMessage = {
        username: this.currentUser.username,
        content: messageToSend,
        timestamp: new Date(),
        image: imageToSend ? imageToSend.toString() : null,
        channelId: channelId,
        profilePic: this.currentUser.profilePic,
      };

      // Call the service method with the channel ID and the chat message
      this.chatService.addMessageToChannel(channelId, chatMessage).subscribe(
        (response) => {
          //console.log('Message added', response);
        },
        (error) => {
          this.chatErrorMessage = error.message;
          console.error('Error adding message', error);
        }
      );
      this.chatService.sendMessage(channelId, chatMessage);

      this.channelMessages.set(channelId, '');
      this.chatErrorMessage = '';
      this.selectedImages.delete(channelId);
    } else {
      this.chatErrorMessage = 'Message must not be empty';
    }
  }

  handleMessageInput(event: Event, channelId: string): void {
    const message = (event.target as HTMLInputElement).value;
    this.channelMessages.set(channelId, message);

    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    if (this.currentUser) {
      this.chatService.notifyTyping(channelId, this.currentUser.username);
    }
  }

  handleJoinChannel(
    channelId: string,
    groupId: string,
    username: string,
    userId: string
  ): void {
    //console.log('Handling join channel:', channelId, groupId, this.currentUser?.username );
    this.userService.addUserToChannel(channelId, groupId, userId).subscribe(
      () => {
        this.chatService.joinChannel(channelId, groupId, username);
        //console.log('User added to channel successfully');

        this.fetchChannelsPerGroup(groupId);
      },
      (error: Error) => {
        console.error('Error adding user to channel:', error);
      }
    );
    this.chatService.getSystemMessages().subscribe((msg: ChatMessage) => {
      //console.log("Received message for channel", msg);

      // Iterate through each group
      Object.values(this.groupChannels).forEach((channels) => {
        // Find the channel within the group channels
        let channel = channels.find((c) => c._id === msg.channelId);
        //console.log("channel", channel)

        if (channel) {
          channel.history.push(msg);
          //console.log("Channel history:", channel.history);
        }
      });
    });
  }
  handleLeaveChannel(
    channelId: string,
    username: string,
    groupId: string,
    userId: string
  ): void {
    this.userService.removeUserFromChannel(channelId, userId).subscribe(
      () => {
        this.chatService.leaveChannel(channelId, groupId, username);
        //console.log("User removed from channel successfully");
        // Refetch channels for the group to reflect the change
        this.fetchChannelsPerGroup(groupId);
      },
      (error) => {
        console.error('Error removing user from channel:', error);
      }
    );
  }

  deleteAccount(user: User): void {
    // Confirmation before deleting
    const confirmDelete = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmDelete) return;
    this.userService.deleteUser(user._id!).subscribe(
      (response) => {
        //console.log("User removed successfully:", response);
      },
      (error) => {
        console.error('Error removing user:', error);
      }
    );
    this.logout();
  }

  isChannelMember(channelId: string, groupId: string): boolean {
    // Check if the channels for the group are fetched and stored
    if (!this.groupChannels[groupId]) {
      console.error(
        'Channels for group not yet fetched or not found:',
        groupId
      );
      return false;
    }

    // Find the channel within the groupChannels map
    const channel = this.groupChannels[groupId].find(
      (c) => c._id === channelId
    );

    if (!channel) {
      console.error('Channel not found:', channelId);
      return false;
    }

    return channel.users?.includes(this.currentUser?._id ?? '') || false;
  }

  get isAdmin(): boolean {
    const currentUser = JSON.parse(
      sessionStorage.getItem('currentUser') || '{}'
    );
    return (
      currentUser.role === 'groupAdmin' || currentUser.role === 'superAdmin'
    );
  }

  updateGroupsStorage(): void {
    // Update the groups in your storage (localStorage or elsewhere)
    localStorage.setItem('groups', JSON.stringify(this.allGroups));
  }
  navigateToDashboard(): void {
    this.router.navigate(['/admin']);
  }
}
