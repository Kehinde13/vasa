"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "../types";
import { signOut } from "next-auth/react";
import { toast } from "react-toastify";

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (user: User, token: string) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    router.push("/dashboard");
    setUser(user);
  };

  

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  toast.error("Logged out");

  // Optional: Disconnect the Google session in browser
  const auth2 = window.gapi?.auth2?.getAuthInstance();
  if (auth2) {
    auth2.signOut().then(() => {
      console.log("Google session disconnected");
    });
  }

  // Remove user from app context
  setUser(null);

  // Sign out of NextAuth and redirect
  signOut({ callbackUrl: "/auth/login" });
};


  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
