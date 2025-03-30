export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string; // Optional, for login
  message?: string; // Optional, for signup
}
