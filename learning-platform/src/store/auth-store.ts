"use client";

import { create } from "zustand";

type SessionUser = {
  userId: string;
  fullName: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  email: string;
};

type AuthState = {
  user: SessionUser | null;
  loading: boolean;
  setUser: (user: SessionUser | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));
