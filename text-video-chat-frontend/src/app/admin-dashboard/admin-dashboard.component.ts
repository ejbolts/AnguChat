import { Component, OnInit } from '@angular/core';
import { User,AdminUser } from '../models/user.model';
import { Router } from '@angular/router';
import { Group  } from '../models/group.model';
import { Channel } from '../models/channel.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: AdminUser[] = [];
  groups: Group[] = [];

  constructor(private router: Router) { } 

  ngOnInit(): void {
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    this.groups = JSON.parse(localStorage.getItem('groups') || '[]');
  
  }
  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }

  promoteUser(user: AdminUser): void {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index > -1 && user.newRole) {
      this.users[index].role = user.newRole;
      localStorage.setItem('users', JSON.stringify(this.users));
    }
  }
  

  removeUser(user: AdminUser): void {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.users.splice(index, 1);
      localStorage.setItem('users', JSON.stringify(this.users));
    }
  }
  logout(): void {
    sessionStorage.removeItem('currentUser');  // Remove the logged-in user from the session storage
    this.router.navigate(['/login']);   // Redirect to the login page
  }



  createGroup(groupInput: HTMLInputElement): void {
    const groupName = groupInput.value;
    const currentUser = sessionStorage.getItem('currentUser');
    const parsedUser = currentUser ? JSON.parse(currentUser) : null;

    if (!parsedUser || !parsedUser.id) {
      console.error('Failed to get current user id');
      return; // Exit the function if the user or its ID doesn't exist
    }
    const newGroup: Group = {
      id: Date.now().toString(),
      name: groupName,
      channels: [],
      admins: [parsedUser.id] // Assign the current user as an admin
    };
    this.groups.push(newGroup);
    localStorage.setItem('groups', JSON.stringify(this.groups));
    groupInput.value = '';
}

createChannel(groupId: string, channelInput: HTMLInputElement): void {
  const channelName = channelInput.value;
    const groupIndex = this.groups.findIndex(group => group.id === groupId);
    if (groupIndex !== -1) {
      const newChannel: Channel = {
        id: Date.now().toString(),
        name: channelName
      };
      this.groups[groupIndex].channels.push(newChannel);
      localStorage.setItem('groups', JSON.stringify(this.groups));
    } // Clear input field
    channelInput.value = '';
  }

  removeGroup(groupId: string): void {
    const index = this.groups.findIndex(group => group.id === groupId);
    if (index > -1) {
      this.groups.splice(index, 1);
      localStorage.setItem('groups', JSON.stringify(this.groups));
    }
  }

  removeChannel(groupId: string, channelId: string): void {
    const groupIndex = this.groups.findIndex(group => group.id === groupId);
    if (groupIndex !== -1) {
      const channelIndex = this.groups[groupIndex].channels.findIndex(channel => channel.id === channelId);
      if (channelIndex !== -1) {
        this.groups[groupIndex].channels.splice(channelIndex, 1);
        localStorage.setItem('groups', JSON.stringify(this.groups));
      }
    }
  }

  addUserToGroup(userId: string, groupId: string): void {
    const group = this.groups.find(g => g.id === groupId);
    if (group) {
        if (!group.users) {
            group.users = [];
        }
        if (!group.users.includes(userId)) {
            group.users.push(userId);
            localStorage.setItem('groups', JSON.stringify(this.groups));
        }
    }
}

removeUserFromGroup(userId: string, groupId: string): void {
    const group = this.groups.find(g => g.id === groupId);
    if (group && group.users) {
        const index = group.users.indexOf(userId);
        if (index > -1) {
            group.users.splice(index, 1);
            localStorage.setItem('groups', JSON.stringify(this.groups));
        }
    }
}getUsernameById(userId: string): string {
  const user = this.users.find(u => u.id === userId);
  return user ? user.username : 'Unknown User';
}



joinChannel(userId: string, channelId: string): void {
  let channel: Channel | undefined;
  this.groups.forEach(group => {
    const foundChannel = group.channels.find(ch => ch.id === channelId);
    if (foundChannel) channel = foundChannel;
  });

  if (channel) {
      if (!channel.users) channel.users = [];
      if (!channel.users.includes(userId)) channel.users.push(userId);
      localStorage.setItem('groups', JSON.stringify(this.groups));
  }
}

reportUser(userId: string): void {
  const user = this.users.find(u => u.id === userId);
  if (user) {
      user.reported = true;
      localStorage.setItem('users', JSON.stringify(this.users));
  }
}


addUserToChannel(userId: string, channelId: string): void {
  const channel = this.findChannelById(channelId);
  if (channel) {
      if (!channel.users) channel.users = [];
      if (!channel.users.includes(userId)) channel.users.push(userId);
      localStorage.setItem('groups', JSON.stringify(this.groups));
  }
}

banUserFromChannel(userId: string, channelId: string): void {
  const channel = this.findChannelById(channelId);
  if (channel) {
    if (!channel.bannedUsers) channel.bannedUsers = [];
    if (!channel.bannedUsers.includes(userId)) {
      channel.bannedUsers.push(userId);
      this.removeUserFromChannel(userId, channelId); // Ban and remove from the channel's users list
      localStorage.setItem('groups', JSON.stringify(this.groups));
    }
  }
}


removeUserFromChannel(userId: string, channelId: string): void {
  const channel = this.findChannelById(channelId);
  if (channel && channel.users) {
      const index = channel.users.indexOf(userId);
      if (index > -1) {
          channel.users.splice(index, 1);
          localStorage.setItem('groups', JSON.stringify(this.groups));
      }
  }
}

// Utility function to fetch channel by ID
findChannelById(channelId: string): Channel | undefined {
  let foundChannel: Channel | undefined;
  this.groups.forEach(group => {
      const channel = group.channels.find(ch => ch.id === channelId);
      if (channel) foundChannel = channel;
  });
  return foundChannel;
}

unbanUserFromChannel(userId: string, channelId: string): void {
  const group = this.groups.find(g => g.channels.some(c => c.id === channelId));
  if (group) {
    const channel = group.channels.find(c => c.id === channelId);
    if (channel) {
      // Remove the user from the list of banned users
      if (channel.bannedUsers) {
        const index = channel.bannedUsers.indexOf(userId);
        if (index > -1) {
          channel.bannedUsers.splice(index, 1);
        }
      }
      // Add the user back to the channel
      if (!channel.users) {
        channel.users = [];
      }
      if (!channel.users.includes(userId)) {
        channel.users.push(userId);
      }
      // Update localStorage
      localStorage.setItem('groups', JSON.stringify(this.groups));
    }
  }
}

// Utility function to fetch user name by ID
getUserIdName(userId: string): string {
  const user = this.users.find(u => u.id === userId);
  return user?.username || 'Unknown User';
}

getUserById(userId: string): AdminUser | undefined {
  return this.users.find(user => user.id === userId);
}

isUserBannedFromChannel(userId: string, channelId: string): boolean {
  const group = this.groups.find(g => g.channels.some(c => c.id === channelId));
  if (group) {
    const channel = group.channels.find(c => c.id === channelId);
    if (channel && channel.bannedUsers) {
      return channel.bannedUsers.includes(userId);
    }
  }
  return false;
}
getPendingUsersForGroup(groupId: string): User[] {
  let pendingUsers: User[] = [];
  this.groups.forEach(group => {
    if (group.id === groupId && group.pendingUsers) {
      group.pendingUsers.forEach(userId => {
        const user = this.users.find(u => u.id === userId);
        if (user) {
          pendingUsers.push(user);
        }
      });
    }
  });
  return pendingUsers;
}

approveUserForGroup(userId: string, groupId: string): void {
  

  if (!userId || !groupId) {
    return;
  }

  // Fetch the user and the group from your storage
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const groups: Group[] = JSON.parse(localStorage.getItem('groups') || '[]');
  
  const user = users.find(u => u.id === userId);
  const group = groups.find(g => g.id === groupId);

  
  // Move user from pendingGroups to groups
  if (user && user.pendingGroups) {
    const userIndex = user.pendingGroups.indexOf(groupId);
    if (userIndex > -1) {
      user.pendingGroups.splice(userIndex, 1);
      if (!user.groups) {
        user.groups = [];
      }
      user.groups.push(groupId);
    }
  }

  // Move userId from group's pendingUsers to users
  if (group) {
    if (!group.users) {
      group.users = [];
    }
    const groupIndex = group.pendingUsers ? group.pendingUsers.indexOf(userId) : -1;
    if (groupIndex > -1) {
      group.pendingUsers?.splice(groupIndex, 1);
      group.users.push(userId);
    }
  }

  
  // Update users and groups in your storage
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('groups', JSON.stringify(groups));
  alert(`${user?.username} approved for ${group?.name}`);
  this.users = JSON.parse(localStorage.getItem('users') || '[]');
this.groups = JSON.parse(localStorage.getItem('groups') || '[]');

}
getGroupNameById(groupId: string): string {
  const group = this.groups.find(g => g.id === groupId);
  return group ? group.name : 'Unknown Group';
}

isSuperAdmin(): boolean {
  const currentUserJSON = sessionStorage.getItem('currentUser');
  if (!currentUserJSON) return false;
  
  const currentUser = JSON.parse(currentUserJSON);
  return currentUser && currentUser.role === 'superAdmin';
}

}
