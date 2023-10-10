// register.component.ts

import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  errorMessage: string | null = null;  // For displaying an error message
  user: User = {
    username: '',
    email: '',
    password: '',
    role: 'user',
    groups: [], // assuming groups is an array
    // ... initialize other fields as needed
  };
  
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {}

  register(): void {
    this.userService.registerUser(this.user)
      .subscribe(() => {

        this.router.navigate(['login']); // Redirect to login after successful registration
      }, error => {
        // Handle error
      });
  }
}
