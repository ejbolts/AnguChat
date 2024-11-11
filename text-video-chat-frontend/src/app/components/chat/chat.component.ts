import {
  Component,
  HostListener,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { Channel } from '../../models/channel.model';
import { UserService } from '../../services/user.service';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chatmessage.model';
import Peer, { MediaConnection } from 'peerjs';
import { IncomingCallDetails } from '../../models/callDetails.model';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  apiUrl = environment.apiUrl;
  isModalOpen: { [groupId: string]: boolean } = {};
  dropdownOpen = false;
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;
  isOnline: boolean = false;
  editingMessageId: string | null = null;
  editingMessageOriginalContent: string | null = null;

  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  typingStatus: { [channelId: string]: string } = {};


    // Channel information
    channels: Channel[] = [];
    channelMessages = new Map<string, string>();
    channelId!: string;
  
    // Group and user information
    groupChannels: { [groupId: string]: Channel[] } = {};
    allGroups: Group[] = [];
    currentUser: User | null = null;
    groupUsers: { [groupId: string]: User[] } = {}; // need to use this
    guestUserID = '65bcc4ecfd6567b3a70f5746';
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

  toggleModal(groupId: string) {
    if (this.isModalOpen[groupId] === undefined) {
      this.isModalOpen[groupId] = false;
    }
    this.isModalOpen[groupId] = !this.isModalOpen[groupId];
  }
  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(_: any) {
    this.checkScreenSize();
  }

  isModalOpenForGroup(groupId: string): boolean {
    return !!this.isModalOpen[groupId];
  }

  checkScreenSize() {
    const isOpen = window.innerWidth > 720;
    this.allGroups.forEach((group) => {
      this.isModalOpen[group._id] = isOpen;
    });
  }

  startEditing(messageId: string, originalContent: string): void {
    this.editingMessageId = messageId;
    this.editingMessageOriginalContent = originalContent;
    //console.log('Editing message:', messageId, originalContent);
  }

  saveChanges(messageId: string, newContent: string, channelId: string): void {
    this.chatService.updateMessage(messageId, newContent, channelId).subscribe(
      (response) => {
        // console.log('Message updated:', response);
      },
      (error) => {
        console.error('Error updating message:', error);
      }
    );

    this.editingMessageId = null;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  triggerFileUpload() {
    this.fileInput?.nativeElement.click();
  }

  updateProfileImage(updatedImage: File): void {
    if (updatedImage) {
      this.userService.uploadFileToServer(this.currentUser!.username ,updatedImage).subscribe(
        (response) => {
          this.currentUser!.profilePic = response.imageUrl
          sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          console.log('Profile image updated:', response);
        },
        (error) => {
          console.error('Error updating profile image:', error);
        }
      );
    }
    this.dropdownOpen = false;
  }
  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Call your updateProfileImage method with the file data
      this.updateProfileImage(file);
    }
  }
  openFileInput() {
    this.fileInput!.nativeElement.click();
  }
  updateUsername() {
    let newUserName = prompt("Enter new username: ")
      if (this.currentUser?._id && newUserName) {
        this.userService.updateUsername(this.currentUser._id, newUserName).subscribe(
          (response) => {
            this.currentUser!.username = response.username;
            
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            console.log('Username updated:', response);
          },
          (error) => {
            console.error('Error updating username:', error);
          }
        );
      } else {
        console.error('Current user ID is undefined');
      }
    
    this.dropdownOpen = false;

  }

  updatePassword() {
    let newUserPassword = prompt("Enter new password: ")
      if (this.currentUser?._id && newUserPassword) {
        this.userService.updatePassword(this.currentUser._id, newUserPassword).subscribe(
          (response) => {
            this.currentUser!.password = response.password;
            
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            console.log('Password updated:', response);
            alert("Your password was updated successfully.")
          },
          (error) => {
            console.error('Error updating password:', error);
          }
        );
      } else {
        console.error('Current user ID is undefined');
      }
    this.dropdownOpen = false;
  }

  closeDropdown(event: Event) {
    if (!(event.target as HTMLElement).classList.contains('dropdown-toggle')) {
      this.dropdownOpen = false;
    }
  }



  cancelEditing(channelId: string): void {
    if (this.editingMessageId) {
      //Flatten all channels across all groups to find the specific channel
      const allChannels = Object.values(this.groupChannels).flat();
      let channel = allChannels.find((c) => c._id === channelId);

      if (channel) {
        //Find the message within this channel's history to reset its content
        let messageIndex = channel.history.findIndex(
          (msg) => msg.id === this.editingMessageId
        );
        if (messageIndex !== -1) {
          channel.history[messageIndex].content =
            this.editingMessageOriginalContent ?? '';
        }
      }

      this.editingMessageId = null;
      this.editingMessageOriginalContent = null;
    }
  }

  deleteMessage(messageId: string, channelId: string): void {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this message?'
    );

    if (isConfirmed) {
      this.chatService.deleteMessage(messageId, channelId).subscribe(
        (response) => {
          const deletedMessageId = messageId;

          // Find the channel and remove the message from its history
          const allChannels = Object.values(this.groupChannels).flat();
          let channel = allChannels.find((c) => c._id === channelId);
          if (channel) {
            channel.history = channel.history.filter(
              (msg) => msg.id !== deletedMessageId
            );
          }
        },
        (error) => {
          console.error('Error deleting message:', error, messageId, channelId);
        }
      );
    }
  }

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
    this.isLoading = true;
    await this.fetchGroups();
    this.checkScreenSize();

    this.isLoading = false;
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }

    this.chatService.getMessages().subscribe((msg: ChatMessage) => {
      Object.values(this.groupChannels).forEach((channels) => {
        // Find the channel within the group channels
        let channel = channels.find((c) => c._id === msg.channelId);
        if (channel) {
          channel.history.push(msg);
        }
      });
    });

    this.chatService
      .getDeleteMessage()
      .subscribe((data: { messageId: string; channelId: string }) => {
        const { messageId, channelId } = data;

        // Update UI to reflect the deleted message
        const allChannels = Object.values(this.groupChannels).flat();
        let channel = allChannels.find((c) => c._id === channelId);
        if (channel) {
          channel.history = channel.history.filter(
            (msg) => msg.id !== messageId
          );
        }
      });

    this.chatService
      .getUpdateMessage()
      .subscribe(
        (editedMessage: {
          messageId: string;
          messageContent: string;
          channelId: string;
        }) => {
          console.log('editedMessage', editedMessage);
          // Iterate through each group to find the relevant channel
          Object.values(this.groupChannels).forEach((channels) => {
            // Find the channel that contains the edited message
            let channel = channels.find(
              (c) => c._id === editedMessage.channelId
            );
            if (channel) {
              console.log('editedMessage', editedMessage);
              // Find the message within the channel's history and update it
              const messageIndex = channel.history.findIndex(
                (msg) => msg.id === editedMessage.messageId
              );
              if (messageIndex !== -1) {
                console.log(
                  'Message found and being edited:',
                  channel.history[messageIndex]
                );

                channel.history[messageIndex].content =
                  editedMessage.messageContent;
                channel.history[messageIndex].isEdited = true; // Mark the message as edited
              }
            }
          });
        }
      );

    this.peer = new Peer({
      host: environment.peerHost,
      port: environment.peerPort,
      path: environment.peerPath,
      secure: environment.peerSecure,
      config: {
        iceServers: environment.peerIceServers,
        iceTransportPolicy: environment.iceTransportPolicy,
        iceCandidatePoolSize: environment.iceCandidatePoolSize,
      },
    });

    this.peer.on('open', async (peerId) => {
      try {
        this.chatService.peerId = peerId;
        const currentUserId =
          JSON.parse(sessionStorage.getItem('currentUser')!)?._id ?? '';
        this.chatService.userId = currentUserId;
        this.chatService.sendConnectionIDs(currentUserId, peerId);

        for (const group of this.allGroups) {
          // Await the resolution of fetchChannelsPerGroup
          await this.fetchChannelsPerGroup(group._id);

          for (const channel of this.groupChannels[group._id]) {
            if (currentUserId && channel.users?.includes(currentUserId)) {
              this.chatService.joinChannel(
                channel._id,
                group._id,
                this.currentUser!.username
              );
            }
          }
        }
      } catch (error) {
        console.error('Error occurred:', error);
      }
    });
    this.peer.on('call', (call) => {
      this.isCallActive = true;
      this.incomingCall = call;
    });
    this.peer.on('close', () => {
      //console.log("Peer connection is destroyed.");
    });

    this.chatService.getLoginUpdates().subscribe((userId: string) => {
      // Iterate over each group in groupUsers
      Object.keys(this.groupUsers).forEach((groupId) => {
        const usersInGroup = this.groupUsers[groupId];
        const userIndex = usersInGroup.findIndex((user) => user._id === userId);
        if (userIndex !== -1) {
          // Found the user in this group, update their online status
          this.groupUsers[groupId][userIndex].isOnline = true;
        }
      });
    });

    this.chatService.getlogoutUser().subscribe((userId: string) => {
      Object.keys(this.groupUsers).forEach((groupId) => {
        const usersInGroup = this.groupUsers[groupId];
        const userIndex = usersInGroup.findIndex((user) => user._id === userId);
        if (userIndex !== -1) {
          this.groupUsers[groupId][userIndex].isOnline = false;
        }
      });
    });

    this.chatService.getSystemMessages().subscribe((msg: ChatMessage) => {
      //console.log('Received message for channel', msg);

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

  async fetchGroups(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.fetchAllGroups().subscribe(
        async (data: Group[]) => {
          this.allGroups = data;

          try {
            for (const group of this.allGroups) {
              await this.fetchChannelsPerGroup(group._id);
              await this.fetchUsersPerGroup(group._id);
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

  async fetchUsersPerGroup(groupId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getGroupUsers(groupId).subscribe(
        (users: User[]) => {
          this.groupUsers[groupId] = users;
          // console.log('groupUsers', this.groupUsers);
          resolve();
        },
        (error: Error) => {
          console.error('Error fetching channels:', error);
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

  logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser')!);
      if (currentUser) {
        const currentUsername = currentUser.username;
        const currentUserId = currentUser._id;

        this.chatService.logoutUser(currentUsername, currentUserId).subscribe({
          next: (response) => {
            // Logout successful
          },
          error: (error) => {
            console.error('Logout error:', error);
            reject(error); // Reject the promise if logout fails
          },
          complete: () => {
            sessionStorage.removeItem('currentUser');
            this.router.navigate(['/login']);
            resolve(); // Resolve the promise upon successful completion
          },
        });
      } else {
        console.error('No current user found in sessionStorage');
        reject('No current user found'); // Reject the promise if no user is found
      }
    });
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
    let uuid = self.crypto.randomUUID();
    if (this.currentUser && (messageToSend.trim() !== '' || imageToSend)) {
      const chatMessage: ChatMessage = {
        id: uuid,
        username: this.currentUser.username,
        content: messageToSend,
        timestamp: new Date(),
        image: imageToSend ? imageToSend.toString() : null,
        channelId: channelId,
        profilePic: this.currentUser.profilePic,
        isEdited: false,
      };

      // Call the service method with the channel ID and the chat message
      this.chatService.addMessageToChannel(channelId, chatMessage).subscribe(
        (response: any) => {
          chatMessage.image = response.message.image;
          if (chatMessage.image === 'inappropriate') {
            chatMessage.image = null;
            this.chatService.sendMessage(channelId, chatMessage);
            alert('removed inappropriate image!');
          } else {
            this.chatService.sendMessage(channelId, chatMessage);
          }
        },
        (error) => {
          this.chatErrorMessage = error.message;
          console.error('Error adding message', error);
        }
      );

      this.channelMessages.set(channelId, '');
      this.chatErrorMessage = '';
      this.selectedImages.delete(channelId);
    } else {
      this.chatErrorMessage = 'message error';
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
    this.logout()
      .then(() => {
        // Proceed with deletion after logout completes
        this.userService.deleteUser(user._id!).subscribe(
          (response) => {
            // User removed successfully
          },
          (error) => {
            console.error('Error removing user:', error);
          }
        );
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
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
