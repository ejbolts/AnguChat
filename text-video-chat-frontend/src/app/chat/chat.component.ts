import { Component, OnInit } from '@angular/core';
import { Group } from '../models/group.model';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { Channel } from '../models/channel.model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
// chat.component.ts

export class ChatComponent implements OnInit {
  allGroups: Group[] = [];
  currentUser: User | null = null;
  users: User[] = [];
  constructor(private router: Router, private userService: UserService) { } // Inject UserService

  
  ngOnInit(): void {
    this.allGroups = JSON.parse(localStorage.getItem('groups') || '[]');
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
    }
    this.users = JSON.parse(localStorage.getItem('users') || '[]'); // Get all users from localStorage
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
  // Find the group with the given groupId
  const group = this.allGroups.find(g => g._id === groupId);

  // If the group exists and the current user's ID is part of its users, return true
  const isMember = group?.users?.includes(this.currentUser?._id || '') || false;
  console.log(`Is user member of group ${groupId}? ${isMember}`);
  return isMember;
}


leaveGroup(groupId: string): void {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const groups: Group[] = JSON.parse(localStorage.getItem('groups') || '[]');

  // Remove groupId from the user's groups
  if (this.currentUser?.groups) {
      const index = this.currentUser.groups.indexOf(groupId);
      if (index > -1) {
          this.currentUser.groups.splice(index, 1);
      }

      // Update the user in local storage
      const userIndex = users.findIndex(u => u._id === this.currentUser?._id);
      if (userIndex > -1) {
          users[userIndex] = this.currentUser;
      }
  }

  // Remove userId from the group's users
  const group = groups.find(g => g._id === groupId);
  if (group?.users) {
      const index = group.users.indexOf(this.currentUser?._id || '');
      if (index > -1) {
          group.users.splice(index, 1);
      }
  }

  // Update the groups in local storage
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('groups', JSON.stringify(groups));

  // Refresh the allGroups and currentUser from local storage to update UI
  this.allGroups = JSON.parse(localStorage.getItem('groups') || '[]');
  const storedUser = sessionStorage.getItem('currentUser');
  if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
  }

  alert('You have left the group.');
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

joinChannel(channelId: string, groupId: string): void {

  if (!this.currentUser) {
    console.error('No current user found!');
    return;
  }
  const group: Group | undefined = this.allGroups.find(g => g._id === groupId);
  console.log('group', group);
  console.log('channelId', channelId);
  console.log('groupId', groupId);
  if (!group) {
    console.error('No matching group found!');
    return;
  }
  const channel: Channel | undefined = group.channels.find(ch => ch._id === channelId);
  if (!channel) {
    console.error('No matching channel found!');
    return;
  }
  // Ensure users array exists
  if (!channel.users) {
    channel.users = [];
  }
  // Add the user to the channel's users if not already there
  if (!channel.users.includes(this.currentUser._id || '')) {
    channel.users.push(this.currentUser._id || '');
    // Update groups in your storage
    this.updateGroupsStorage();
  }
}

isChannelMember(channelId: string, groupId: string): boolean {
  const group: Group | undefined = this.allGroups.find(g => g._id === groupId);
  const channel: Channel | undefined = group?.channels.find(ch => ch._id === channelId);
  return channel?.users?.includes(this.currentUser?._id || '') || false;
}
// chat.component.ts
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
