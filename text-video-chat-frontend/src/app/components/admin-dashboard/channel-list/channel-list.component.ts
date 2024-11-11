import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {User, AdminUser } from '../../../models/user.model'
import { Observable } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { Channel} from '../../../models/channel.model'
import { Group }from '../../../models/group.model'
@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html'
})
export class ChannelListComponent  {
    @Input() group: any;
    @Input() users: User[] = [];
    @Input() channels: Channel[] = [];  
    @Output() promoteUser = new EventEmitter<User>();
    @Output() removeUser = new EventEmitter<User>();
constructor(private userService: UserService){}

fetchChannelsPerGroup(groupId: string): Observable<Channel[]> {
    return this.userService.getChannelsByGroupId(groupId);
  }

  fetchGroups(): Observable<Group[]> {
    return this.userService.fetchAllGroups();
  }

  removeUserFromChannel(
    channelId: string,
    userId: string,
    groupId: string
  ): void {
    this.userService.removeUserFromChannel(channelId, userId).subscribe(
      () => {
        this.fetchChannelsPerGroup(groupId); // to reflect changes
      },
      (error) => {
        console.error('Error removing user from channel:', error);
      }
    );
  }

  getUsernameFromId(userId: string): string {
    const user = this.users.find((user) => user._id === userId);
    return user ? user.username : 'Unknown User';
  }

  removeChannel(channelId: string): void {
    this.userService.deleteChannel(channelId).subscribe(
      () => {
        this.fetchGroups();
      },
      (error: Error) => {
        console.error('Error deleting channel:', error);
      }
    );
  }

  addUserToChannel(channelId: string, groupId: string, userId: string): void {
    this.userService.addUserToChannel(channelId, groupId, userId).subscribe(
      () => {
        this.fetchChannelsPerGroup(groupId);
      },
      (error: Error) => {
        console.error('Error adding user to channel:', error);
      }
    );
  }

  


  
}
