import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  serviceNumber: string;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string, role: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", {
      email,
      password,
      role,
    });
    
    const data = await response.json();
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    
    return data;
  },

  async register(userData: {
    serviceNumber: string;
    fullName: string;
    email: string;
    password: string;
    role: string;
  }): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    
    const data = await response.json();
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to get current user");
    }

    return response.json();
  },

  logout() {
    localStorage.removeItem("auth_token");
  },

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
