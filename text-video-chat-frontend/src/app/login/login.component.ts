import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username!: string;
  password!: string;
  error!: string;

  constructor(private authService: AuthenticationService, private router: Router) { }
  login(): void {
    this.authService.login({ username: this.username, password: this.password })
      .subscribe(response => {
        if (response.valid) {
          sessionStorage.setItem('currentUser', JSON.stringify(response.user));
          // Check roles for navigation
          if (response.user.roles.includes('SuperAdmin') || response.user.roles.includes('GroupAdmin')) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/register']);
          }
        } else {
          this.error = "Invalid login credentials";
        }
      });
  }
  
  
}
