import { create } from 'zustand';
import api from '../api/client';

const initialToken = localStorage.getItem('token');
let initialUser = null;
try {
  const savedUser = localStorage.getItem('user');
  if (savedUser) initialUser = JSON.parse(savedUser);
} catch (e) {
  initialUser = null;
}

export const useAuthStore = create((set) => ({
  token: initialToken || null,
  user: initialUser || null,
  isAuthenticated: !!initialToken && !!initialUser,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please verify credentials.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/signup', userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Registration failed.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  clearError: () => set({ error: null }),
}));
