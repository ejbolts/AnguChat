import { Component, OnInit } from '@angular/core';
import { Group } from '../models/group.model';
import { User } from '../models/user.model';

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
 
}
