import api from './api';
import { User, TokenResponseData } from '../types/auth.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  confirm_password?: string;
  role: string;
}

/**
 * Authentication service handling networking operations with the FastAPI backend.
 */
export const authService = {
  /**
   * Validate session token and retrieve current authenticated user profile from FastAPI GET /auth/me
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.detail || 'Session invalid or expired.');
      }
      throw new Error(error.message || 'Unable to verify session with authentication server.');
    }
  },

  /**
   * Authenticate user credentials against FastAPI endpoint POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<TokenResponseData> {
    try {
      const response = await api.post<TokenResponseData>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail;

        if (status === 401 || status === 400) {
          throw new Error(typeof detail === 'string' ? detail : 'Invalid email or password. Please check your credentials.');
        } else if (status === 403) {
          throw new Error('Unauthorized access. Your account may be locked or pending verification.');
        } else if (status >= 500) {
          throw new Error('A server error occurred. Please try again later.');
        } else {
          throw new Error(typeof detail === 'string' ? detail : 'Authentication failed. Please try again.');
        }
      } else if (error.request || error.message) {
        throw new Error(error.message || 'Unable to connect to authentication server. Please check your network connection.');
      } else {
        throw new Error('An unexpected error occurred during login.');
      }
    }
  },

  /**
   * Register user account against FastAPI endpoint POST /auth/register
   */
  async register(userData: RegisterUserData): Promise<any> {
    try {
      const response = await api.post('/auth/register', {
        name: userData.name,
        full_name: userData.name,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirm_password || userData.password,
        role: userData.role.toUpperCase(),
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail;

        if (status === 400 || status === 409 || status === 422) {
          if (typeof detail === 'string') {
            throw new Error(detail);
          } else if (Array.isArray(detail)) {
            const firstErr = detail[0]?.msg || 'Invalid registration details provided.';
            throw new Error(firstErr);
          } else {
            throw new Error('Email address already registered or registration details invalid.');
          }
        } else if (status >= 500) {
          throw new Error('A server error occurred during registration. Please try again later.');
        } else {
          throw new Error(typeof detail === 'string' ? detail : 'Registration failed. Please try again.');
        }
      } else if (error.request || error.message) {
        throw new Error(error.message || 'Unable to connect to registration server. Please check your network connection.');
      } else {
        throw new Error('An unexpected error occurred during registration.');
      }
    }
  },

  /**
   * Logout user session against FastAPI endpoint POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Cleanup happens on client regardless of network status
    }
  },
};

export default authService;
