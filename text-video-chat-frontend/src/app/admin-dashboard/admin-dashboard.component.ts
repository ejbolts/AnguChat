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



  createGroup(groupName: string): void {
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
}

  createChannel(groupId: string, channelName: string): void {
    const groupIndex = this.groups.findIndex(group => group.id === groupId);
    if (groupIndex !== -1) {
      const newChannel: Channel = {
        id: Date.now().toString(),
        name: channelName
      };
      this.groups[groupIndex].channels.push(newChannel);
      localStorage.setItem('groups', JSON.stringify(this.groups));
    }
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
}
