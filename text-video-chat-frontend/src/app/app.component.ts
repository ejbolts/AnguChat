import { Component } from '@angular/core';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'text-video-chat-frontend';
  constructor(private userService: UserService) {}

ngOnInit() {
  this.userService.fetchCsrfToken();
}
}