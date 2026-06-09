import { create } from "zustand";
import { authApi } from "../api/auth";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("hd_token") || null,
  loading: true,

  login: async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem("hd_token", data.access_token);
    set({ user: data.user, token: data.access_token });
    return data.user;
  },

  register: async (payload) => {
    const data = await authApi.register(payload);
    localStorage.setItem("hd_token", data.access_token);
    set({ user: data.user, token: data.access_token });
    return data.user;
  },

  logout: () => {
    localStorage.removeItem("hd_token");
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    const token = localStorage.getItem("hd_token");
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, loading: false });
    } catch {
      localStorage.removeItem("hd_token");
      set({ user: null, token: null, loading: false });
    }
  },
}));

export default useAuthStore;
