import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public apiUrl = 'http://localhost:3000'; // Your backend server URL

  constructor(private http: HttpClient) {}

  // Method to register a new user
  registerUser(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // Method to login a user
  loginUser(credentials: {username: string, password: string}): Observable<{message: string, user: User}> {
    return this.http.post<{message: string, user: User}>(`${this.apiUrl}/login`, credentials);
  }
  

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${userId}`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${userId}/role`, { role: role });
  }
  
  // Method to fetch all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/login`);
  }

  // Method to fetch a specific user by its _id
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/login/${id}`);
  }


  createGroup(name: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/group/create`, { name: name, userId: userId });
  }

  fetchAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/group`);
  }
  

  deleteGroup(groupId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/group/${groupId}`);
  }

  createChannel(groupId: string, channelName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/channel`, { groupId: groupId, name: channelName });
  }
  
deleteChannel(channelId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/channel/${channelId}`);
}
getChannelsByGroupId(groupId: string): Observable<Channel[]> {
  return this.http.get<Channel[]>(`${this.apiUrl}/group/${groupId}/channels`);
}
addUserToGroup(groupId: string, userId: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/group/${groupId}/addUser`, { userId });
}

removeUserFromGroup(groupId: string, userId: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/group/${groupId}/removeUser`, { userId });
}

addUserToChannel(channelId: string, groupId: string, userId: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/channel/${channelId}/addUser`, { groupId, userId });
}

removeUserFromChannel(channelId: string, userId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/channel/${channelId}/removeUser`, { body: { userId: userId } });
}

joinGroup(groupId: string, userId: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/group/${groupId}/join`, { userId: userId });
}

approveUserForGroup(groupId: string, userId: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/group/${groupId}/approveUser`, { userId: userId });
}



}
