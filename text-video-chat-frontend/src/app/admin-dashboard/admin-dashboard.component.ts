import { Component, OnInit } from '@angular/core';
import { User,AdminUser } from '../models/user.model';
import { Router } from '@angular/router';
import { Group  } from '../models/group.model';
import { Channel } from '../models/channel.model';
import { UserService } from '../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  groups: Group[] = [];
  users: User[] = [];
  groupChannels: { [groupId: string]: Channel[] } = {};  // Map to hold channels for each group
  currentUser?: User; 
group: Group = {
  name: '',
  _id: '',
  channels: [],
  admins: []
};
  constructor(private router: Router, private userService: UserService) { } // Inject UserService

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchGroups();
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
    
  }
  debugLog(item: any): void {
    console.log(item);
  }
  
  fetchUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data: User[]) => {
        this.users = data;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }
  fetchGroups(): void {
    this.userService.fetchAllGroups().subscribe(
      (data: Group[]) => {
        this.groups = data;
  
        // For each group fetched, fetch its channels
        this.groups.forEach(group => {
          this.fetchChannelsPerGroup(group._id);
        });
  
      },
      (error: any) => {
        console.error("Error fetching groups:", error);
      }
    );
  }
  

  fetchChannelsPerGroup(groupId: string): void {
    console.log(`Fetching channels for group ${groupId}`); //Fetching channels for group 6525c1e721a00f6bd9e5d901

    this.userService.getChannelsByGroupId(groupId).subscribe(
      (channels: Channel[]) => {
        this.groupChannels[groupId] = channels;
      },
      error => {
        console.error("Error fetching channels:", error); // up still getting this error
      }
    );
  }
  
  

  removeUser(user: User): void {
    this.userService.deleteUser(user._id!).subscribe(
      response => {
        console.log("User removed successfully:", response);
        this.fetchUsers();  // Refresh the list of users after deletion
      },
      error => {
        console.error('Error removing user:', error);
      }
    );
  }

  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }

  promoteUser(user: AdminUser): void {
    if (user.role) {
      this.userService.updateUserRole(user._id!, user.role)
        .subscribe(() => {
          console.log('User role updated successfully');
          this.fetchUsers(); // Refresh the list of users after the update
        }, error => {
          console.error('Error updating user role:', error);
        });
    }
  }
  
  

  logout(): void {
    sessionStorage.removeItem('currentUser');  // Remove the logged-in user from the session storage
    this.router.navigate(['/login']);   // Redirect to the login page
  }

  createGroup(): void {
    const currentUserId = JSON.parse(sessionStorage.getItem('currentUser')!)?._id ?? '';
    this.userService.createGroup(this.group.name, currentUserId)
      .subscribe((response: any) => {
        console.log('Group created:', response);
        this.fetchGroups();
      },  (error: HttpErrorResponse) => {
        console.error('Error creating group:', error);
      });
  }



  deleteGroup(groupId: string): void {
    this.userService.deleteGroup(groupId).subscribe(
      () => {
        console.log("Group deleted successfully");
        // Reload the groups or remove the deleted group from your local data
        this.fetchGroups();
      },
      (error: any) => {
        console.error("Error deleting group:", error);
      }
    );
  }
  createNewChannel(groupId: string, channelName: string): void {
    this.userService.createChannel(groupId, channelName).subscribe(
        response => {
            console.log("Channel created:", response);
            this.fetchGroups();
        },
        (error: any) => {
            console.error("Error creating channel:", error);
        }
    );
}


removeChannel(channelId: string): void {
  console.log(`Deleting channel ${channelId}`);
  this.userService.deleteChannel(channelId).subscribe(
      () => {
          console.log("Channel deleted successfully");
          this.fetchGroups();
      },
      (error: any) => {
          console.error("Error deleting channel:", error);
      }
  );
}



addUserToGroup(groupId: string, userId: string): void {
  this.userService.addUserToGroup(groupId, userId).subscribe(
    () => {
      console.log('User added to group successfully');
      this.fetchGroups();  // to reflect changes
    },
    (error: any) => {
      console.error('Error adding user to group:', error);
    }
  );
}


removeUserFromGroup(groupId: string, userId: string): void {
  this.userService.removeUserFromGroup(groupId, userId).subscribe(
    () => {
      console.log('User removed from group successfully');
      this.fetchGroups();  // to refresh the group data and reflect changes
    },
    (error: any) => {
      console.error('Error removing user from group:', error);
    }
  );
}

getUsernameById(userId: string): string {
  const user = this.users.find(u => u._id === userId);
  return user ? user.username : 'Unknown User';
}



joinChannel(userId: string, channelId: string): void {
  let channel: Channel | undefined;
  this.groups.forEach(group => {
    const foundChannel = group.channels.find(ch => ch._id === channelId);
    if (foundChannel) channel = foundChannel;
  });

  if (channel) {
      if (!channel.users) channel.users = [];
      if (!channel.users.includes(userId)) channel.users.push(userId);
      localStorage.setItem('groups', JSON.stringify(this.groups));
  }
}

reportUser(userId: string): void {
  const user = this.users.find(u => u._id === userId);
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
      const channel = group.channels.find(ch => ch._id === channelId);
      if (channel) foundChannel = channel;
  });
  return foundChannel;
}

unbanUserFromChannel(userId: string, channelId: string): void {
  const group = this.groups.find(g => g.channels.some(c => c._id === channelId));
  if (group) {
    const channel = group.channels.find(c => c._id === channelId);
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
  const user = this.users.find(u => u._id === userId);
  return user?.username || 'Unknown User';
}

getUserById(userId: string): AdminUser | undefined {
  return this.users.find(user => user._id === userId);
}

isUserBannedFromChannel(userId: string, channelId: string): boolean {
  const group = this.groups.find(g => g.channels.some(c => c._id === channelId));
  if (group) {
    const channel = group.channels.find(c => c._id === channelId);
    if (channel && channel.bannedUsers) {
      return channel.bannedUsers.includes(userId);
    }
  }
  return false;
}
getPendingUsersForGroup(groupId: string): User[] {
  let pendingUsers: User[] = [];
  this.groups.forEach(group => {
    if (group._id === groupId && group.pendingUsers) {
      group.pendingUsers.forEach(userId => {
        const user = this.users.find(u => u._id === userId);
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
  
  const user = users.find(u => u._id === userId);
  const group = groups.find(g => g._id === groupId);

  
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
  // are setting the users and groups in the component recall them again to update the UI
  this.users = JSON.parse(localStorage.getItem('users') || '[]');
this.groups = JSON.parse(localStorage.getItem('groups') || '[]');
}

isSuperAdmin(): boolean {
  const currentUserJSON = sessionStorage.getItem('currentUser');
  if (!currentUserJSON) return false;
  
  const currentUser = JSON.parse(currentUserJSON);
  return currentUser && currentUser.role === 'superAdmin';
}
getCurrentUsername(): string | null {
  const currentUser = sessionStorage.getItem('currentUser');
  if (currentUser) {
    return JSON.parse(currentUser).username;
  }
  return null;
}


}
