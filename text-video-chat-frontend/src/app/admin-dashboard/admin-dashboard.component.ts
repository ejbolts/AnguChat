import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  user: any = {};

  constructor(private router: Router) {}
  ngOnInit(): void {
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
      this.user = JSON.parse(sessionUser);
    } else {
      this.router.navigate(['/login']); // Redirect to login if no user data
    }
  }
}
