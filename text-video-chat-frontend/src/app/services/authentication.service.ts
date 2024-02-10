import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { CanActivate, Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: {
    username: string;
    password: string;
  }): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(
      `${this.apiUrl}/api/login`,
      credentials
    );
  }

  canActivate(): boolean {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === 'superAdmin') {
        return true;
      } else if (user._id) {
        this.router.navigate(['/chat']);
        return false;
      }
    }
    this.router.navigate(['/login']);
    return false;
  }
}
