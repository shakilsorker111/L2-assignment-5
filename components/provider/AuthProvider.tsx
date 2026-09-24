"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  clearAuthCookies,
  getAccessToken,
  getUserRole,
  setAuthCookies,
} from "@/lib/cookies";

import {
  getMe,
  loginUser,
} from "@/services/auth.service";

import type { LoginPayload } from "@/types/auth";
import type { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (
    payload: LoginPayload
  ) => Promise<User>;

  logout: () => void;

  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  /**
   * Load authenticated user
   */
  const refreshUser = async () => {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await getMe();

      const authenticatedUser =
        response?.data;

      if (!authenticatedUser) {
        clearAuthCookies();
        setUser(null);
        return;
      }

      setUser(authenticatedUser);

      /**
       * Keep role cookie synchronized
       * with the actual backend user.
       */
      if (authenticatedUser.role) {
        const existingRole =
          getUserRole();

        if (
          existingRole !==
          authenticatedUser.role
        ) {
          setAuthCookies(
            token,
            authenticatedUser.role
          );
        }
      }
    } catch (error) {
      console.error(
        "Authentication initialization failed:",
        error
      );

      clearAuthCookies();
      setUser(null);
    }
  };

  /**
   * Initialize authentication
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        await refreshUser();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Login
   */
  const login = async (
    payload: LoginPayload
  ): Promise<User> => {
    const response =
      await loginUser(payload);

    const authData = response?.data;

    if (
      !authData?.accessToken ||
      !authData?.user
    ) {
      throw new Error(
        "Invalid login response from server"
      );
    }

    /**
     * Save authentication first.
     */
    setAuthCookies(
      authData.accessToken,
      authData.user.role
    );

    /**
     * Update React state immediately.
     * Navbar and other components will
     * update without page refresh.
     */
    setUser(authData.user);

    return authData.user;
  };

  /**
   * Logout
   */
  const logout = () => {
    clearAuthCookies();

    setUser(null);

    /**
     * Remove any cached authentication data
     * if it exists.
     */
    if (
      typeof window !== "undefined"
    ) {
      sessionStorage.removeItem(
        "gearup_user"
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated:
          Boolean(user),
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}