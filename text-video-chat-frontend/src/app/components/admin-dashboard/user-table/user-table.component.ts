import { Component, Input, Output, EventEmitter } from '@angular/core';
import {User, AdminUser } from '../../../models/user.model'
import { UserService } from '../../../services/user.service';
@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html'
})
export class UserTableComponent {
  @Input() users: User[] = [];
  @Output() promoteUser = new EventEmitter<User>();
  @Output() removeUser = new EventEmitter<User>();
constructor(private userService: UserService){}
fetchUsers():void{
      this.userService.getUsers().subscribe(
        (users: User[]) => {
          this.users = users;
        },
        (error) => {
          console.error('Error fetching users:', error);
        }
      );
  }

  handleRemoveUser(user: User): void {
    this.userService.deleteUser(user._id!).subscribe(
      (response) => {
        this.fetchUsers(); // Refresh the list of users after deletion
      },
      (error) => {
        console.error('Error removing user:', error);
      }
    );
  }

  handlePromoteUser(user: AdminUser): void {
    if (user.role) {
      this.userService.updateUserRole(user._id!, user.role).subscribe(
        () => {
          this.fetchUsers(); // Refresh the list of users after the update
        },
        (error) => {
          console.error('Error updating user role:', error);
        }
      );
    }
  }
}
