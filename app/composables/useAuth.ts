import { useAuthStore } from '~/stores/auth.store';
import { rfqWorkspaceTarget } from '~/lib/auth-continuation';

export const useAuth = () => {
  const api = useApi();
  const authStore = useAuthStore();
  const router = useRouter();
  const route = useRoute();
  const accessToken = useCookie('access_token', { maxAge: 60 * 15 });
  const refreshToken = useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7 });

  const login = async (email: string, password: string) => {
    const res = await api.post<any>('/auth/login', { email, password });
    if (res.success) {
      accessToken.value = res.data.accessToken;
      refreshToken.value = res.data.refreshToken;
      authStore.setUser(res.data.user);
      redirectByRole(res.data.user.role);
    }
    return res;
  };

  const register = async (payload: { email: string; password: string; fullName: string; role: string }) => {
    const res = await api.post<any>('/auth/register', payload);
    if (res.success) {
      accessToken.value = res.data.accessToken;
      refreshToken.value = res.data.refreshToken;
      authStore.setUser(res.data.user);
      redirectByRole(res.data.user.role);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    accessToken.value = null;
    refreshToken.value = null;
    authStore.clearUser();
    router.push('/login');
  };

  const fetchUser = async () => {
    if (!accessToken.value) return null;
    try {
      const res = await api.get<any>('/auth/me');
      if (res.success) {
        authStore.setUser(res.data);
        return res.data;
      }
    } catch {
      accessToken.value = null;
      refreshToken.value = null;
      authStore.clearUser();
    }
    return null;
  };

  const redirectByRole = (role: string) => {
    if (route.query.chat === '1' && ['Buyer', 'Supplier', 'Admin'].includes(role)) {
      router.push('/workspace/chat');
      return;
    }
    const rfqTarget = rfqWorkspaceTarget(route.query, role);
    if (rfqTarget) {
      router.push(rfqTarget);
      return;
    }
    const routes: Record<string, string> = {
      Supplier: '/workspace',
      Investor: '/investor/dashboard',
      Admin: '/admin/dashboard',
      Buyer: '/workspace',
    };
    router.push(routes[role] || '/');
  };

  return {
    login,
    register,
    logout,
    fetchUser,
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isRole: (role: string) => computed(() => authStore.user?.role === role),
  };
};
