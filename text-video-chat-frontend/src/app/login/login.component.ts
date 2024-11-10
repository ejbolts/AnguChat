import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  user: User = {
    username: '',
    password: '',
    role: '',
    groups: [],
    isOnline: true,
  };
  errorMessage?: string;
  warningMessage: string | null = null;
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    // Retrieve the warning message from the query parameter
    console.log(this.warningMessage)
    this.route.queryParams.subscribe((params) => {
      console.log(this.warningMessage)
      if (params['warningMessage']){
        this.warningMessage = 'Account created, but your image was removed due to inappropriate content.' 
      }
    });
  }
  login(): void {
    if (this.user.password) {
      this.userService
        .loginUser({
          username: this.user.username,
          password: this.user.password,
        })
        .subscribe(
          (response) => {
            if (response.user) {
              // checking the user property of the response
              sessionStorage.setItem(
                'currentUser',
                JSON.stringify(response.user)
              );
              this.router.navigate(['chat']);
            } else {
              this.errorMessage = 'Unexpected error occurred!';
            }
          },
          (error) => {
            this.errorMessage = 'Invalid credentials!';
          }
        );
    }
  }

  loginGuest(): void {
    this.userService
      .loginUser({ username: 'Guest', password: 'Guest' })
      .subscribe(
        (response) => {
          if (response.user) {
            sessionStorage.setItem(
              'currentUser',
              JSON.stringify(response.user)
            );
            this.router.navigate(['chat']);
          } else {
            this.errorMessage = 'Unexpected error occurred!';
          }
        },
        (error) => {
          this.errorMessage = 'Invalid credentials!';
        }
      );
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
