import { Component, OnInit } from '@angular/core';
import { Group } from '../models/group.model';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { Channel } from '../models/channel.model';

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
  constructor(private router: Router) { } // Inject the Router
  // Update your ngOnInit method:
  
  ngOnInit(): void {
    this.allGroups = JSON.parse(localStorage.getItem('groups') || '[]');
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
    }
    this.users = JSON.parse(localStorage.getItem('users') || '[]'); // Get all users from localStorage
  }

 
  requestToJoinGroup(groupId: string): void {
    const user: User = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const groups: Group[] = JSON.parse(localStorage.getItem('groups') || '[]');
    
    // Add groupId to the user's pendingGroups
    if (!user.pendingGroups) {
      user.pendingGroups = [];
    }
    if (!user.pendingGroups.includes(groupId)) {
      user.pendingGroups.push(groupId);
    }
  
    // Add userId to the group's pendingUsers
    const group = groups.find(g => g.id === groupId);
if (group) {
  if (!group.pendingUsers) {
    group.pendingUsers = [];
  }
  if (!group.pendingUsers.includes(user.id || '')) {
    group.pendingUsers.push(user.id || '');
  }
}

    
    // Update the user and groups in your storage
    sessionStorage.setItem('currentUser', JSON.stringify(user));
this.currentUser = user; // Important to update the component's state.

    localStorage.setItem('groups', JSON.stringify(groups));
    alert('Join request sent! Waiting for admin approval.');
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
  const group = this.allGroups.find(g => g.id === groupId);

  // If the group exists and the current user's ID is part of its users, return true
  const isMember = group?.users?.includes(this.currentUser?.id || '') || false;
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
      const userIndex = users.findIndex(u => u.id === this.currentUser?.id);
      if (userIndex > -1) {
          users[userIndex] = this.currentUser;
      }
  }

  // Remove userId from the group's users
  const group = groups.find(g => g.id === groupId);
  if (group?.users) {
      const index = group.users.indexOf(this.currentUser?.id || '');
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

deleteAccount(): void {
  if (!this.currentUser) {
    console.error('No current user found!');
    return;
  }
  
  // Confirmation before deleting
  const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
  if (!confirmDelete) return;

  // Filter out the user from the users array in localStorage
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const updatedUsers = users.filter(user => user.id !== this.currentUser!.id);
  localStorage.setItem('users', JSON.stringify(updatedUsers));

  // Log the user out and redirect (if needed)
  this.logout();
}

joinChannel(channelId: string, groupId: string): void {

  if (!this.currentUser) {
    console.error('No current user found!');
    return;
  }
  const group: Group | undefined = this.allGroups.find(g => g.id === groupId);
  if (!group) {
    console.error('No matching group found!');
    return;
  }
  const channel: Channel | undefined = group.channels.find(ch => ch.id === channelId);
  if (!channel) {
    console.error('No matching channel found!');
    return;
  }
  // Ensure users array exists
  if (!channel.users) {
    channel.users = [];
  }
  // Add the user to the channel's users if not already there
  if (!channel.users.includes(this.currentUser.id || '')) {
    channel.users.push(this.currentUser.id || '');
    // Update groups in your storage
    this.updateGroupsStorage();
  }
}

isChannelMember(channelId: string, groupId: string): boolean {
  const group: Group | undefined = this.allGroups.find(g => g.id === groupId);
  const channel: Channel | undefined = group?.channels.find(ch => ch.id === channelId);
  return channel?.users?.includes(this.currentUser?.id || '') || false;
}

updateGroupsStorage(): void {
  // Update the groups in your storage (localStorage or elsewhere)
  localStorage.setItem('groups', JSON.stringify(this.allGroups));
}


}
