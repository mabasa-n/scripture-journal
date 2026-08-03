import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/journal";
import { env } from "../config/env";
import { AuthContext } from "./useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthStatus() {
      try {
        const response = await fetch(`${env.apiUrl}/api/auth/me`, {
          credentials: "include",
        });

        if (response.ok) {
          const userData: User = await response.json();
          if (isMounted) {
            setUser(userData);
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkAuthStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      await fetch(`${env.apiUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
