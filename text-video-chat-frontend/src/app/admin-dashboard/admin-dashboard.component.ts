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
    const rawData = sessionStorage.getItem('currentUser');
    const userData = rawData ? JSON.parse(rawData) : null;
    
    if (userData && userData.roles && (userData.roles.includes('SuperAdmin') || userData.roles.includes('GroupAdmin'))) {
      this.user = userData;
    } else {
      this.router.navigate(['/register']);
    }
  }
}
