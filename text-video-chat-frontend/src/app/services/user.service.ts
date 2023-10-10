import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000'; // Your backend server URL

  constructor(private http: HttpClient) {}

  // Method to register a new user
  registerUser(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // Method to login a user
  loginUser(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
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
}
