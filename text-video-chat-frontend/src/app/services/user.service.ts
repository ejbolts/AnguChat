import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private http: HttpClient) {}

  getAllUsers(): User[] {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }
  
}
