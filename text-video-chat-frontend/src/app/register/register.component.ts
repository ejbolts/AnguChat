import { Component } from '@angular/core';
import { User } from '../models/user.model';  // Replace with the correct path to your model
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  constructor(private router: Router, ) {}

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
    // Give the user an ID, roles, and a mock password
    this.user.id = Date.now().toString(); // Using timestamp as a mock ID
    this.user.role = 'user';

    // Get the current list of users from localStorage
    let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

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
