import { Component, OnInit } from '@angular/core';
import { User, AdminUser } from '../../models/user.model';
import { Router } from '@angular/router';
import { Group } from '../../models/group.model';
import { Channel } from '../../models/channel.model';
import { UserService } from '../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  groups: Group[] = [];
  users: User[] = [];
  currentUser?: User;
  group: Group = {
    name: '',
    _id: '',
    channels: [],
    admins: [],
  };
  constructor(private router: Router, private userService: UserService) {}
  fetchGroups(): Observable<Group[]> {
    return this.userService.fetchAllGroups();
  }
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

  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }


  logout(): void {
    sessionStorage.removeItem('currentUser'); 
    this.router.navigate(['/login']); 
  }

  createGroup(event: any): void {
    event.preventDefault();
    const currentUserId =
      JSON.parse(sessionStorage.getItem('currentUser')!)?._id ?? '';
    this.userService.createGroup(this.group.name, currentUserId).subscribe(
      (response) => {
        this.fetchGroups();
      },
      (error: HttpErrorResponse) => {
        console.error('Error creating group:', error);
      }
    );
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
