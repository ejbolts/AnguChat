import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  selectedUserId!: string; 
  user: any = {};



  fetchUsers() {
    this.users = this.userService.getAllUsers();
  }
  
  isSuperAdmin(): boolean {
    return this.user.roles && this.user.roles.includes('SuperAdmin');
  }
  constructor(private router: Router, private userService: UserService) {}
  ngOnInit(): void {
    this.fetchUsers();
   
  }

  // promoteToGroupAdmin() {
  //   this.userService.getUserById(this.selectedUserId).subscribe(user => {
  //     if (!user.roles.includes('GroupAdmin')) {
  //       user.roles.push('GroupAdmin');
  //       this.userService.updateUser(user).subscribe();
  //     }
  //   });
  // }

  // removeUser() {
  //   this.userService.deleteUser(this.selectedUserId).subscribe();
  // }

  // promoteToSuperAdmin() {
  //   this.userService.getUserById(this.selectedUserId).subscribe(user => {
  //     if (!user.roles.includes('SuperAdmin')) {
  //       user.roles.push('SuperAdmin');
  //       this.userService.updateUser(user).subscribe();
  //     }
  //   });
  // }
}