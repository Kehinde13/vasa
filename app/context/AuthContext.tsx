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

  // ✅ Load user safely on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored || stored === "undefined" || stored === "null") {
      localStorage.removeItem("user"); // clear corrupted value
      return;
    }

    try {
      const parsed: User = JSON.parse(stored);
      setUser(parsed);
    } catch (err) {
      console.error("Failed to parse stored user", err);
      localStorage.removeItem("user");
    }
  }, []);

  // ✅ Safe login
  const login = (user: User, token: string) => {
    if (!user) return; // extra guard
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setUser(user);
    router.push("/dashboard");
  };

  // ✅ Safe logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);

    toast.error("Logged out");

    // Optional: Disconnect Google session
    /* const auth2 = (window as any).gapi?.auth2?.getAuthInstance();
    if (auth2) {
      auth2.signOut().then(() => console.log("Google session disconnected"));
    } */

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
