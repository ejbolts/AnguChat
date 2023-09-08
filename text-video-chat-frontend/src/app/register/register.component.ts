import { Component } from '@angular/core';
import { User } from '../models/user.model'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  errorMessage: string | null = null;  // For displaying an error message

  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  user: User = {
    username: '',
    email: '',
    role: '',
    groups: []
  };

  registerUser(): void {
    let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if the username is already taken
    if (users.some(user => user.username === this.user.username)) {
      this.errorMessage = 'Username already taken. Please choose another.';
      return;
    }

    // If the username is not taken, continue with the registration
    this.user.id = Date.now().toString(); // Using timestamp as a mock ID
    this.user.role = 'user';

    // Push the new user into the list
    users.push(this.user);

    // Save the updated list back to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Clear the form and give feedback
    this.user = {
      username: '',
      email: '',
      role: '',
      groups: []
    };
    alert('User registered successfully!');
  }
}
