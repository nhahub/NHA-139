/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AUTH_API_URL = "http://127.0.0.1:5000/api/auth";
const USERS_API_URL = "http://127.0.0.1:5000/api/users";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  favorites?: { _id: string; name: string }[];
  history?: { _id: string; name: string }[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isOwner: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserProfile = async (token: string): Promise<User> => {
  const response = await fetch(`${USERS_API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }
  const data = await response.json();
  return data.data.user;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });
  const queryClient = useQueryClient();

  const { data: user = null, isLoading: isUserLoading } = useQuery<User | null>(
    {
      queryKey: ["me"],
      queryFn: async () => {
        try {
          const storedToken = localStorage.getItem("token");
          if (!storedToken) return null;
          setToken(storedToken);
          return await fetchUserProfile(storedToken);
        } catch (error) {
          localStorage.removeItem("token");
          setToken(null);
          return null;
        }
      },
      staleTime: 1000 * 60 * 5,
      retry: 1,
    }
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: new Error(data.message || "Login failed") };
      }

      setToken(data.token);
      await queryClient.invalidateQueries({ queryKey: ["me"] });

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Sign in failed"),
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string
  ) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: new Error(data.message || "Signup failed") };
      }
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Sign up failed"),
      };
    }
  };

  const signOut = async () => {
    setToken(null);
    queryClient.setQueryData(["me"], null); //
  };

  const isAdmin = user?.role === "admin";
  const isOwner = user?.role === "owner" || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        isOwner,
        isLoading: isUserLoading,
        signIn,
        signUp,
        signOut,
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
