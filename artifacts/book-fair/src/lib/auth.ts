import { create } from "zustand";
import { User } from "@workspace/api-client-react";

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const getUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem("bookFairUser");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuth = create<AuthState>((set) => ({
  user: getUserFromStorage(),
  login: (user) => {
    localStorage.setItem("bookFairUser", JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("bookFairUser");
    set({ user: null });
  },
}));
