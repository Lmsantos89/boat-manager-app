import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthRequest } from '../../models/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginRequest: AuthRequest = { username: '', password: '' };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.loginRequest).subscribe({
      next: () => this.router.navigate(['/boats']),
      error: () => (this.errorMessage = 'Invalid username or password'),
    });
  }
}
