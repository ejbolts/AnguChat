import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user.service';
import { Group } from '../../models/group.model';
import { Channel } from 'src/app/models/channel.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private userService: UserService) {}

  fetchChannelsPerGroup(groupId: string): Observable<Channel[]> {
    return this.userService.getChannelsByGroupId(groupId);
  }

  fetchGroups(): Observable<Group[]> {
    return this.userService.fetchAllGroups();
  }
}
