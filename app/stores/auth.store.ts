import { defineStore } from 'pinia';

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  phone?: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    userRole: (state) => state.user?.role || '',
    userName: (state) => state.user?.fullName || '',
  },
  actions: {
    setUser(user: User) {
      this.user = user;
    },
    clearUser() {
      this.user = null;
    },
  },
});
