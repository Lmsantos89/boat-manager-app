import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthRequest, AuthResponse } from '../../models/auth';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  signupRequest: AuthRequest = { username: '', password: '' };
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  signup() {
    this.authService.signup(this.signupRequest).subscribe({
      next: (response: AuthResponse) => {
        this.successMessage =
          response.message ||
          'Registration successful! Redirecting to login...';
        this.errorMessage = '';
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Registration failed. Please try again.';
        this.successMessage = '';
      },
    });
  }
}
