// register.component.ts

import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  selectedFile: File | null = null;
  errorMessage?: string | null = null;
  imageSrc: string | ArrayBuffer | null = null;
  fileName: string = 'No image selected';
  user: User = {
    username: '',
    password: '',
    role: 'user',
    profilePic: null,
    groups: ['655715aadb0c367c28840915'],
    isOnline: false,
  };

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) {
      return;
    }
    const file = input.files[0];

    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = (e) => (this.imageSrc = reader.result);
      reader.readAsDataURL(file);
    }
    if (input && input.files && input.files.length > 0) {
      // console.log(input.files[0]);

      this.selectedFile = input.files[0];
    }
  }
  clearImage(): void {
    this.imageSrc = null;
    this.fileName = 'No image selected';
    // Reset the file input
    const fileInput = document.getElementById('profilePic') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  uploadImage(username: string): void {
    if (this.selectedFile) {
      this.compressImage(this.selectedFile, (compressedFile) => {
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('username', username);

        this.userService.uploadFileToServer(formData).subscribe(
          (response) => {
            if (response.deletedIMG !== false) {
              console.log('File deleted successfully from server');
              const warningMessage =
                'Account created, but your image was removed due to inappropriate content.';

              this.router.navigate(['/login'], {
                queryParams: { warningMessage },
              });
            } else {
              //console.log('File uploaded successfully to server');
              this.router.navigate(['/login']);
            }
          },
          (error) => {
            console.error('Error uploading file:', error);
          }
        );
      });
    } else {
      this.goToLogin();

      // console.log('No file selected');
    }
  }

  /*compressImage function that takes the original file and a callback function.
  It compresses the image and then calls the callback with the compressed file.
  In uploadImage, call compressImage, and once the image is compressed,
  proceed with creating FormData and uploading it to s3 bucket.*/
  compressImage(file: File, callback: (compressedFile: File) => void): void {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new Image();
      if (!event.target) {
        return;
      }
      img.src = event.target.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert canvas to Blob, then to File
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob!], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            callback(compressedFile);
          },
          'image/jpeg',
          0.1
        );
      };
    };
    reader.readAsDataURL(file);
  }
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  constructor(private userService: UserService, private router: Router) {}

  register(): void {
    this.userService.registerUser(this.user).subscribe(
      () => {
        this.uploadImage(this.user.username);
      },
      (error) => {
        // This block runs only if there is an error in registerUser
        this.errorMessage = error.error.message || 'Registration failed.';
        // console.log('Error during user registration:', error.error.message);
      }
    );
  }

  ngOnInit(): void {}
}
