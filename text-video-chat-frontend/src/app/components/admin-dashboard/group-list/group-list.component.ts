import { Component, Input, Output, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { User } from '../../../models/user.model';
import { Group }from '../../../models/group.model'
import { Channel }from '../../../models/channel.model'
import { UserService } from 'src/app/services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html'
})
export class GroupListComponent implements OnInit {
  @Input() users: User[] = [];
  @Output() group: Group[]= []
  groups: Group[] = [];
  groupChannels: { [groupId: string]: Channel[] } = {};

  constructor(private userService: UserService, private dashboardService: DashboardService) {}
  fetchGroups(): Observable<Group[]> {
    return this.userService.fetchAllGroups();
  }
  async ngOnInit() {
    try {
      this.groups = (await this.dashboardService.fetchGroups().toPromise()) || [];
      for (const group of this.groups) {
        this.groupChannels[group._id] = (await this.dashboardService
          .fetchChannelsPerGroup(group._id)
          .toPromise()) || [];
      }
    } catch (error) {
      console.error('Error initializing group list:', error);
    }
  }
  deleteGroup(groupId: string): void {
    this.userService.deleteGroup(groupId).subscribe(
      () => {
        this.fetchGroups(); // to reflect change 
      },
      (error: Error) => {
        console.error('Error deleting group:', error);
      }
    );
  }

  createNewChannel(groupId: string, channelName: string): void {
    this.userService.createChannel(groupId, channelName).subscribe(
      (response) => {
        this.fetchGroups();
      },
      (error: Error) => {
        console.error('Error creating channel:', error);
      }
    );
  }

  addUserToGroup(groupId: string, userId: string): void {
    this.userService.addUserToGroup(groupId, userId).subscribe(
      () => {
        this.fetchGroups(); // to reflect changes
      },
      (error: Error) => {
        console.error('Error adding user to group:', error);
      }
    );
  }

  getUsernameById(userId: string): string {
    const user = this.users.find((u) => u._id === userId);
    return user ? user.username : 'Unknown User';
  }

  removeUserFromGroup(groupId: string, userId: string): void {
    this.userService.removeUserFromGroup(groupId, userId).subscribe(
      () => {
        this.fetchGroups(); 
      },
      (error: Error) => {
        console.error('Error removing user from group:', error);
      }
    );
  }
}
