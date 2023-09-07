import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { User } from '../models/user.model';

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
  goToRegister(): void {
    this.router.navigate(['/register']);
}
login(): void {
  // Fetch users from localStorage
  let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

  // Find the user with the given credentials
  console.log(users);

  let loggedInUser = users.find(u => u.username === this.username && u.password === this.password);

  if (loggedInUser) {
    // Store the logged-in user in the session for further use
    sessionStorage.setItem('currentUser', JSON.stringify(loggedInUser));

    // Check user roles and navigate accordingly
    if (loggedInUser.role === 'SuperAdmin' || loggedInUser.role === 'GroupAdmin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/chat']);
    }
  } else {
    alert('Invalid credentials!');
  }
}

  
  
  
}
