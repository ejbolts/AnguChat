import { Component, OnInit } from '@angular/core';
import { Group } from '../models/group.model';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { Channel } from '../models/channel.model';
import { UserService } from '../services/user.service';
import { ChatService } from '../services/chat.service' ; 
import { ChatMessage } from '../models/chatmessage.model';  


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})



export class ChatComponent implements OnInit {
  public messages: ChatMessage[] = [];

  public message: string = '';
  groupChannels: { [groupId: string]: Channel[] } = {};  // Map to hold channels for each group
  allGroups: Group[] = [];
  currentUser: User | null = null;
  users: User[] = [];
  selectedImage: string | null = null; // Base64 encoded image string


  constructor(private router: Router, private userService: UserService, private chatService: ChatService) { } // Inject UserService

  
  ngOnInit(): void {
    this.fetchGroups();
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
    }
    this.chatService.getMessages().subscribe((msg: ChatMessage) => {
      this.messages.push(msg);
    });
    this.chatService.getSystemMessages().subscribe((msg: ChatMessage) => {
      this.messages.push(msg);
    });

    
  }
  fetchGroups(): void {
    this.userService.fetchAllGroups().subscribe(
      (data: Group[]) => {
        this.allGroups = data;
  
        // For each group fetched, fetch its channels
        this.allGroups.forEach(group => {
          this.fetchChannelsPerGroup(group._id);
          
        });
  
      },
      (error: any) => {
        console.error("Error fetching groups:", error);
      }
    );
  }
  fetchChannelsPerGroup(groupId: string): void {
    console.log(`Fetching channels for group ${groupId}`); 

    this.userService.getChannelsByGroupId(groupId).subscribe(
      (channels: Channel[]) => {
        this.groupChannels[groupId] = channels;
      },
      error => {
        console.error("Error fetching channels:", error);
      }
    );
  }


onImageSelected(event: any): void {
  const file: File = event.target.files[0];
  const reader = new FileReader();

  reader.onloadend = () => {
      const base64String = reader.result as string;
      // Do something with the Base64 string, like attach it to your message object
      this.selectedImage = base64String;
  };
  
  reader.readAsDataURL(file);
}
sendMessage(): void {
  if (this.message.trim() && this.currentUser) {
      const chatMessage: ChatMessage = {
          username: this.currentUser.username,
          content: this.message.trim(),
          timestamp: new Date(),
          image: this.selectedImage
      };
      
      this.chatService.sendMessage(chatMessage);
      this.message = '';  
      this.selectedImage = null;
  }
}



  
 
  joinGroup(group: Group): void {
    const currentUserId = JSON.parse(sessionStorage.getItem('currentUser')!)?._id ?? '';
  
    this.userService.joinGroup(group._id, currentUserId).subscribe(
      response => {
        console.log('Join request sent:', response);
        // Optionally, update your UI or provide feedback to the user here
      },
      error => {
        console.error('Error joining group:', error);
      }
    );
  }
  
  
  isPending(groupId: string): boolean {
    const pending = this.currentUser?.pendingGroups?.includes(groupId) || false;
    return pending;
 }

 logout(): void {
  sessionStorage.removeItem('currentUser'); // Assuming 'currentUser' is the session key
  this.router.navigate(['/login']); 
}

isMemberOfGroup(groupId: string): boolean {
  const group = this.allGroups.find(g => g._id === groupId);
  
  if (!group) {
    console.error('Group not found:', groupId);
    return false;
  }

  return group.users?.includes(this.currentUser?._id ?? '') || false;
}


removeUserFromGroup(groupId: string): void {
  const currentUserId = JSON.parse(sessionStorage.getItem('currentUser')!)?._id ?? '';
  this.userService.removeUserFromGroup(groupId, currentUserId).subscribe(
    () => {
      console.log('User removed from group successfully');
      
      this.fetchGroups();  // to refresh the group data and reflect changes

    },
    (error: any) => {
      console.error('Error removing user from group:', error);
    }
  );
}
addUserToChannel(channelId: string, groupId: string, userId: string): void {
  this.userService.addUserToChannel(channelId, groupId, userId).subscribe(
    () => {
      console.log('User added to channel successfully');

      this.fetchChannelsPerGroup(groupId);
    },
    (error: any) => {
      console.error('Error adding user to channel:', error);
    }
  );
}
removeUserFromChannel(channelId: string, userId: string, groupId: string): void {
  this.userService.removeUserFromChannel(channelId, userId).subscribe(
    () => {
      console.log("User removed from channel successfully");
      // Refetch channels for the group to reflect the change

      this.fetchChannelsPerGroup(groupId);
    },
    error => {
      console.error("Error removing user from channel:", error);
    }
  );
}


deleteAccount(user: User): void {
    // Confirmation before deleting
    const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmDelete) return;
  this.userService.deleteUser(user._id!).subscribe(
    response => {
      console.log("User removed successfully:", response);
    },
    error => {
      console.error('Error removing user:', error);
    }
  );
  this.logout();

}



isChannelMember(channelId: string, groupId: string): boolean {
  // Check if the channels for the group are fetched and stored
  if (!this.groupChannels[groupId]) {
    console.error('Channels for group not yet fetched or not found:', groupId);
    return false;
  }

  // Find the channel within the groupChannels map
  const channel = this.groupChannels[groupId].find(c => c._id === channelId);

  if (!channel) {
    console.error('Channel not found:', channelId);
    return false;
  }

  return channel.users?.includes(this.currentUser?._id ?? '') || false;
}

get isAdmin(): boolean {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  return currentUser.role === 'groupAdmin' || currentUser.role === 'superAdmin';
}


updateGroupsStorage(): void {
  // Update the groups in your storage (localStorage or elsewhere)
  localStorage.setItem('groups', JSON.stringify(this.allGroups));
} navigateToDashboard(): void {
  this.router.navigate(['/admin']);
}



}
