export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie('access_token');
  const authStore = useAuthStore();

  if (!token.value) {
    return navigateTo('/login');
  }

  if (!authStore.user) {
    try {
      const { $api } = useNuxtApp();
      const res = await $api<any>('/auth/me');
      if (res.success) {
        authStore.setUser(res.data);
      } else {
        return navigateTo('/login');
      }
    } catch {
      return navigateTo('/login');
    }
  }
});
