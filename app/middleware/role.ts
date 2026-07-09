export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const role = authStore.user?.role;

  if (!role) return navigateTo('/login');

  const path = to.path;

  if (path.startsWith('/supplier') && role !== 'Supplier') {
    return navigateTo('/unauthorized');
  }
  if (path.startsWith('/investor') && role !== 'Investor') {
    return navigateTo('/unauthorized');
  }
  if (path.startsWith('/admin') && role !== 'Admin') {
    return navigateTo('/unauthorized');
  }
  if (path.startsWith('/buyer') && role !== 'Buyer') {
    return navigateTo('/unauthorized');
  }
});
