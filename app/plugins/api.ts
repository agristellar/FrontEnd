export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const api = $fetch.create({
    baseURL: apiBase,
    onRequest({ options }) {
      const token = useCookie('access_token').value;
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        const refreshToken = useCookie('refresh_token').value;
        if (refreshToken) {
          try {
            const data = await $fetch<any>(`${apiBase}/auth/refresh-token`, {
              method: 'POST',
              body: { refreshToken },
            });
            if (data?.data?.accessToken) {
              useCookie('access_token').value = data.data.accessToken;
              useCookie('refresh_token').value = data.data.refreshToken;
            }
          } catch {
            useCookie('access_token').value = null;
            useCookie('refresh_token').value = null;
            navigateTo('/login');
          }
        } else {
          navigateTo('/login');
        }
      }
    },
  });

  return {
    provide: { api },
  };
});
