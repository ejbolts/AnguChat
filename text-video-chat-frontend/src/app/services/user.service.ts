import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable, catchError, retry } from 'rxjs';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  apiUrl = environment.apiUrl;
  private csrfToken: string = '';
  constructor(private http: HttpClient) {}
  public fetchCsrfToken(): void {
    this.http
      .get<{ csrfToken: string }>(`${this.apiUrl}/api/get-csrf-token`, {
        withCredentials: true,
      })
      .subscribe((response) => {
        this.csrfToken = response.csrfToken;
      });
  }

  public getCsrfToken(): string {
    return this.csrfToken;
  }

  registerUser(user: User): Observable<{ message: string; _id: string }> {
    // console.log('user: ', user);
    return this.http.post<{ message: string; _id: string }>(
      `${this.apiUrl}/api/authentication`,
      user,
      {
        withCredentials: true,
      }
    );
  }

  loginUser(credentials: {
    username: string;
    password: string;
  }): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(
      `${this.apiUrl}/api/authentication/login`,
      credentials,
      { withCredentials: true }
    );
  }

  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/api/remove/${userId}`,
      {
        withCredentials: true,
      }
    );
  }

  updateUserRole(
    userId: string,
    role: string
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/api/update/${userId}/role`,
      { role: role },
      { withCredentials: true }
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/api/authentication`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/authentication/${id}`);
  }

  getUsersConnectionInfo(userId: string): Observable<{
    socketId: string | null;
    peerId: string | null;
    message: string;
  }> {
    return this.http.get<{ socketId: string; peerId: string; message: string }>(
      `${this.apiUrl}/api/sockets/getConnectionInfo/${userId}`
    );
  }

  createGroup(
    name: string,
    userId: string
  ): Observable<{ message: string; groupId: string }> {
    return this.http
      .post<{ message: string; groupId: string }>(
        `${this.apiUrl}/api/group/create`,
        { name: name, userId: userId },
        { withCredentials: true }
      )
      .pipe(
        retry(3),
        catchError((error) => {
          throw new Error('Error creating group');
        })
      );
  }

  fetchAllGroups(): Observable<Group[]> {
    //console.log('fetching groups');
    return this.http.get<Group[]>(`${this.apiUrl}/api/group`);
  }

  deleteGroup(groupId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/api/group/${groupId}`,
      {
        withCredentials: true,
      }
    );
  }

  createChannel(
    groupId: string,
    channelName: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/api/channel`,
      { groupId: groupId, name: channelName },
      { withCredentials: true }
    );
  }

  deleteChannel(channelId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/api/channel/${channelId}`,
      {
        withCredentials: true,
      }
    );
  }

  getChannelsByGroupId(groupId: string): Observable<Channel[]> {
    return this.http.get<Channel[]>(
      `${this.apiUrl}/api/group/${groupId}/channels`
    );
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/api/channel/getAllUsers`);
  }

  getGroupUsers(groupId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/api/group/${groupId}/Users`);
  }

  addUserToGroup(
    groupId: string,
    userId: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/api/group/${groupId}/addUser`,
      { userId },
      { withCredentials: true }
    );
  }

  removeUserFromGroup(
    groupId: string,
    userId: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/api/group/${groupId}/removeUser`,
      { userId },
      { withCredentials: true }
    );
  }

  addUserToChannel(
    channelId: string,
    groupId: string,
    userId: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/api/channel/${channelId}/addUser`,
      { groupId, userId },
      { withCredentials: true }
    );
  }

  removeUserFromChannel(
    channelId: string,
    userId: string
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/api/channel/${channelId}/removeUser`,
      { body: { userId }, withCredentials: true }
    );
  }

  joinGroup(groupId: string, userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/api/group/${groupId}/join`,
      { userId },
      { withCredentials: true }
    );
  }

  approveUserForGroup(
    groupId: string,
    userId: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/api/group/${groupId}/approveUser`,
      { userId },
      { withCredentials: true }
    );
  }

  updateProfileImage(userId: string, updatedImage: File): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/api/update/${userId}/profileImage`,
      { profileImage: updatedImage },
      { withCredentials: true }
    );
  }

  updateUsername(userId: string, username: string): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/api/update/${userId}/username`,
      { username: username },
      { withCredentials: true }
    );
  }
  updatePassword(userId: string, password: string): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/api/update/${userId}/password`,
      { password: password },
      { withCredentials: true }
    );
  }
  // FormData is for uploading images when user is registering
  // File type is when user is their profile image
  uploadFileToServer(
    fileData: FormData | File,
    userId?: String
  ): Observable<{ deletedIMG: boolean; imageUrl: string }> {
    const formData = new FormData();
    // if the file data is a File object its being updated from chat component
    if (fileData instanceof File) {
      formData.append('file', fileData);
      formData.append('userId', userId as string);

      return this.http.post<{ deletedIMG: boolean; imageUrl: string }>(
        `${this.apiUrl}/api/uploadProfileImage/upload`,
        formData,
        {
          withCredentials: true,
        }
      );
      // else the file data is a FormData object from registration form
    } else {
      return this.http.post<{ deletedIMG: boolean; imageUrl: string }>(
        `${this.apiUrl}/api/uploadProfileImage/upload`,
        fileData,
        {
          withCredentials: true,
        }
      );
    }
  }
}
