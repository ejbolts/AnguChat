import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public apiUrl = 'http://localhost:3000'; 
  private csrfToken: string = '';
  constructor(private http: HttpClient, ) {}
  public fetchCsrfToken(): void {
    this.http.get<{ csrfToken: string }>(`${this.apiUrl}/get-csrf-token`, { withCredentials: true })
      .subscribe(response => {
        this.csrfToken = response.csrfToken;
      });
  }

  
  public getCsrfToken(): string {
    return this.csrfToken;
  }

  // Method to register a new user
  registerUser(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user, { withCredentials: true });
  }
  

  // Method to login a user
  loginUser(credentials: {username: string, password: string}): Observable<{message: string, user: User}> {
    return this.http.post<{message: string, user: User}>(`${this.apiUrl}/login`, credentials, { withCredentials: true });
  }
  

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${userId}`, { withCredentials: true });
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${userId}/role`, { role: role }, { withCredentials: true });
  }
  
  // Method to fetch all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/login`);
  }

  getUsersConnectionInfo(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sockets/getConnectionInfo/${userId}`);
  }
  

  // Method to fetch a specific user by its _id
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/login/${id}`);
  }


  createGroup(name: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/group/create`, { name: name, userId: userId }, { withCredentials: true });
  }

  fetchAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/group`);
  }
  

  deleteGroup(groupId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/group/${groupId}`, { withCredentials: true });
  }

  createChannel(groupId: string, channelName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/channel`, { groupId: groupId, name: channelName }, { withCredentials: true });
  }

  deleteChannel(channelId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/channel/${channelId}`, { withCredentials: true });
  }

  getChannelsByGroupId(groupId: string): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.apiUrl}/group/${groupId}/channels`);
  }


  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/channel/getAllUsers`);
  }


addUserToGroup(groupId: string, userId: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/group/${groupId}/addUser`, { userId },{ withCredentials: true });
}

removeUserFromGroup(groupId: string, userId: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/group/${groupId}/removeUser`, { userId }, {withCredentials: true });
}


addUserToChannel(channelId: string, groupId: string, userId: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/channel/${channelId}/addUser`, { groupId, userId }, {withCredentials: true });
}

removeUserFromChannel(channelId: string,  userId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/channel/${channelId}/removeUser`, { body: { userId }, withCredentials: true });
}

joinGroup(groupId: string, userId: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/group/${groupId}/join`, { userId }, { withCredentials: true });
}

approveUserForGroup(groupId: string, userId: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/group/${groupId}/approveUser`, { userId }, { withCredentials: true });
}

uploadFileToServer(fileData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/bucket/upload`, fileData, { withCredentials: true });
}


}
