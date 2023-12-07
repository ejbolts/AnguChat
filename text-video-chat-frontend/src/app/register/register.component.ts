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
  selectedFile: File | null = null; 
  errorMessage: string | null = null;  
  user: User = {
    username: '',
    email: '',
    password: '',
    role: 'user',
    profilePic: null,
    groups: [], 
  };
  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log(input.files);
    if (input && input.files && input.files.length > 0) {
      console.log(input.files[0]);
      this.selectedFile = input.files[0];}
   
  }

  
  uploadImage(username: string): any {
    if (this.selectedFile) {
      const fileSize = this.selectedFile.size / 1024 / 1024; // size in MB
      if (fileSize > 2) {
        alert('File is too large. Maximum size is 2MB.');
        return;
      }
  
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('username', username); // Append username to the FormData
  
      this.userService.uploadFileToServer(formData).subscribe(() => {
        console.log('File uploaded successfully to server');
        // Handle successful upload
      }, error => {
        console.error('Error uploading file:', error);
        // Handle upload error
      });
    } else {
      console.log('No file selected');
    }
  }
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  constructor(private userService: UserService, private router: Router) {}


  register(): void {
    this.userService.registerUser(this.user).subscribe(() => {
      this.uploadImage(this.user.username)
        
    
    }, error => {
      this.errorMessage = error.error.message || 'Registration failed.';
      console.log('Error during user registration:', error);
    });
  }
  
  ngOnInit(): void {}
}
