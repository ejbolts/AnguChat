import { Component, OnInit } from '@angular/core';
import { User, AdminUser } from '../models/user.model';
import { Router } from '@angular/router';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';
import { UserService } from '../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  groups: Group[] = [];
  users: User[] = [];
  groupChannels: { [groupId: string]: Channel[] } = {}; // Map to hold channels for each group
  currentUser?: User;
  group: Group = {
    name: '',
    _id: '',
    channels: [],
    admins: [],
  };
  constructor(private router: Router, private userService: UserService) {} // Inject UserService

  async ngOnInit(): Promise<void> {
    await this.fetchUsers();
    await this.fetchGroups();
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
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

  async fetchGroups(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.fetchAllGroups().subscribe(
        async (data: Group[]) => {
          this.groups = data;

          try {
            for (const group of this.groups) {
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

  async fetchChannelsPerGroup(groupId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getChannelsByGroupId(groupId).subscribe(
        (channels: Channel[]) => {
          this.groupChannels[groupId] = channels;
          resolve();
        },
        (error) => {
          console.error('Error fetching channels:', error); // up still getting this error
          reject(error);
        }
      );
    });
  }
  removeUser(user: User): void {
    this.userService.deleteUser(user._id!).subscribe(
      (response) => {
        //console.log("User removed successfully:", response);
        this.fetchUsers(); // Refresh the list of users after deletion
      },
      (error) => {
        console.error('Error removing user:', error);
      }
    );
  }

  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }

  promoteUser(user: AdminUser): void {
    if (user.role) {
      this.userService.updateUserRole(user._id!, user.role).subscribe(
        () => {
          //console.log('User role updated successfully');
          this.fetchUsers(); // Refresh the list of users after the update
        },
        (error) => {
          console.error('Error updating user role:', error);
        }
      );
    }
  }

  logout(): void {
    sessionStorage.removeItem('currentUser'); // Remove the logged-in user from the session storage
    this.router.navigate(['/login']); // Redirect to the login page
  }

  createGroup(event: any): void {
    event.preventDefault();
    const currentUserId =
      JSON.parse(sessionStorage.getItem('currentUser')!)?._id ?? '';
    this.userService.createGroup(this.group.name, currentUserId).subscribe(
      (response) => {
        //console.log('Group created:', response);
        this.fetchGroups();
      },
      (error: HttpErrorResponse) => {
        console.error('Error creating group:', error);
      }
    );
  }
  getUsernameFromId(userId: string): string {
    const user = this.users.find((user) => user._id === userId);
    return user ? user.username : 'Unknown User';
  }

  deleteGroup(groupId: string): void {
    this.userService.deleteGroup(groupId).subscribe(
      () => {
        //console.log("Group deleted successfully");
        // Reload the groups or remove the deleted group from your local data
        this.fetchGroups();
      },
      (error: Error) => {
        console.error('Error deleting group:', error);
      }
    );
  }
  createNewChannel(groupId: string, channelName: string): void {
    this.userService.createChannel(groupId, channelName).subscribe(
      (response) => {
        //console.log("Channel created:", response);
        this.fetchGroups();
      },
      (error: Error) => {
        console.error('Error creating channel:', error);
      }
    );
  }

  removeChannel(channelId: string): void {
    //console.log(`Deleting channel ${channelId}`);
    this.userService.deleteChannel(channelId).subscribe(
      () => {
        //console.log("Channel deleted successfully");
        this.fetchGroups();
      },
      (error: Error) => {
        console.error('Error deleting channel:', error);
      }
    );
  }

  addUserToGroup(groupId: string, userId: string): void {
    //console.log("added user")
    this.userService.addUserToGroup(groupId, userId).subscribe(
      () => {
        //console.log('User added to group successfully');
        this.fetchGroups(); // to reflect changes
      },
      (error: Error) => {
        console.error('Error adding user to group:', error);
      }
    );
  }

  addUserToChannel(channelId: string, groupId: string, userId: string): void {
    this.userService.addUserToChannel(channelId, groupId, userId).subscribe(
      () => {
        //console.log('User added to channel successfully');
        this.fetchChannelsPerGroup(groupId);
      },
      (error: Error) => {
        console.error('Error adding user to channel:', error);
      }
    );
  }

  removeUserFromChannel(
    channelId: string,
    userId: string,
    groupId: string
  ): void {
    this.userService.removeUserFromChannel(channelId, userId).subscribe(
      () => {
        //console.log("User removed from channel successfully");
        // Refetch channels for the group to reflect the change
        this.fetchChannelsPerGroup(groupId);
      },
      (error) => {
        console.error('Error removing user from channel:', error);
      }
    );
  }

  removeUserFromGroup(groupId: string, userId: string): void {
    this.userService.removeUserFromGroup(groupId, userId).subscribe(
      () => {
        //console.log('User removed from group successfully');
        this.fetchGroups(); // to refresh the group data and reflect changes
      },
      (error: Error) => {
        console.error('Error removing user from group:', error);
      }
    );
  }

  getUsernameById(userId: string): string {
    const user = this.users.find((u) => u._id === userId);
    return user ? user.username : 'Unknown User';
  }

  joinChannel(userId: string, channelId: string): void {
    let channel: Channel | undefined;
    this.groups.forEach((group) => {
      const foundChannel = group.channels.find((ch) => ch._id === channelId);
      if (foundChannel) channel = foundChannel;
    });

    if (channel) {
      if (!channel.users) channel.users = [];
      if (!channel.users.includes(userId)) channel.users.push(userId);
      localStorage.setItem('groups', JSON.stringify(this.groups));
    }
  }

  // Utility function to fetch channel by ID
  findChannelById(channelId: string): Channel | undefined {
    let foundChannel: Channel | undefined;
    this.groups.forEach((group) => {
      const channel = group.channels.find((ch) => ch._id === channelId);
      if (channel) foundChannel = channel;
    });
    return foundChannel;
  }

  // Utility function to fetch user name by ID
  getUserIdName(userId: string): string {
    const user = this.users.find((u) => u._id === userId);
    return user?.username || 'Unknown User';
  }

  getUserById(userId: string): AdminUser | undefined {
    return this.users.find((user) => user._id === userId);
  }

  approveUserForGroup(userId: string, groupId: string): void {
    this.userService.approveUserForGroup(groupId, userId).subscribe(
      (response) => {
        //console.log('User approved:', response);
        // Refetch group data to update the UI
        this.fetchGroups();
      },
      (error) => {
        console.error('Error approving user:', error);
      }
    );
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
