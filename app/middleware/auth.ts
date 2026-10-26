export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie('access_token');
  const authStore = useAuthStore();
  const rfq = /^\/workspace\/rfqs\/([a-f0-9]{24})$/.exec(to.path)?.[1];
  const loginPath = to.path === '/workspace/chat' ? '/login?chat=1' : rfq ? '/login?rfq=' + rfq : '/login';

  if (!token.value) {
    return navigateTo(loginPath);
  }

  if (!authStore.user) {
    try {
      const { $api } = useNuxtApp();
      const res = await $api<any>('/auth/me');
      if (res.success) {
        authStore.setUser(res.data);
      } else {
        return navigateTo(loginPath);
      }
    } catch {
      return navigateTo(loginPath);
    }
  }
});
