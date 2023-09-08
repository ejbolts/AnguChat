import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  login(credentials: {username: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

}
