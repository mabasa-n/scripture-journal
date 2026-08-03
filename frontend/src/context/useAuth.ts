// src/context/useAuth.ts
import { createContext, useContext } from "react";
import type { User } from "../types/journal";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

// 1. Create Context (kept internal or exported for default value)
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// 2. Export Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
