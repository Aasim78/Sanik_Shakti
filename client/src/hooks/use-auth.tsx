import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, User } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (userData: {
    serviceNumber: string;
    fullName: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = authService.getToken();
      if (!token) return null;
      
      try {
        return await authService.getCurrentUser();
      } catch (error) {
        authService.logout();
        return null;
      }
    },
    enabled: authService.isAuthenticated(),
    retry: false,
  });

  useEffect(() => {
    setUser(currentUser || null);
  }, [currentUser]);

  const login = async (email: string, password: string, role: string) => {
    const response = await authService.login(email, password, role);
    setUser(response.user);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  const register = async (userData: {
    serviceNumber: string;
    fullName: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await authService.register(userData);
    setUser(response.user);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
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
