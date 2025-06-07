import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  name: string;
  email: string;
  serviceNumber: string;
  role: string;
  aadhaarVerified: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  serviceNumber: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      const data = await response.json();
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    const response = await apiRequest("POST", "/api/auth/register", data);
    const userData = await response.json();
    setUser(userData);
  };

  const login = async (data: LoginData) => {
    const response = await apiRequest("POST", "/api/auth/login", data);
    const userData = await response.json();
    setUser(userData);
  };

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
