import { createContext } from 'react'
import type { User } from '../types/models' // Đường dẫn tới file models chứa type User của bạn

export interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (req: any) => Promise<any>; // Bạn có thể thay 'any' bằng type LoginRequest nếu có
  register: (req: any) => Promise<any>;
  logout: () => void;
  updateUser: (user: User) => void;
  setBalance: (balance: number) => void;
}

// Gắn type AuthContextType vào createContext
export const AuthContext = createContext<AuthContextType | null>(null)