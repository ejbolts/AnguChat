import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  
  user: User = {
    username: '',
    password: '',
    email: '',
    role: '',
    groups: []
  };

  errorMessage?: string;

  constructor(private userService: UserService, private router: Router) {}
  login(): void {
    if (this.user.password) {
      this.userService.loginUser({ username: this.user.username, password: this.user.password }).subscribe(
        response => {
          if (response.user) {  // checking the user property of the response
            sessionStorage.setItem('currentUser', JSON.stringify(response.user));
            this.router.navigate(['admin']);
          } else {
            this.errorMessage = "Unexpected error occurred!";
          }
        },
        error => {
          this.errorMessage = "Invalid credentials!";
        }
      );
    }
  }
  
  
  


  // If you have a method to navigate to the register page:
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
