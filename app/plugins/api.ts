export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;
  // Keep cookie refs inside this Nuxt app/request; async hooks must not create composables.
  const accessToken = useCookie<string | null>("access_token", {
    sameSite: "lax",
    maxAge: 60 * 15,
  });
  const refreshToken = useCookie<string | null>("refresh_token", {
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  let refreshing: Promise<boolean> | null = null;
  const subject = (token: string | null | undefined) => {
    try {
      return String(
        JSON.parse(
          atob(
            String(token).split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
          ),
        ).userId || "",
      );
    } catch {
      return "";
    }
  };
  const transport = $fetch.create({
    baseURL: apiBase,
    onRequest({ options }) {
      options.headers = new Headers(options.headers);
      if (accessToken.value)
        options.headers.set("Authorization", `Bearer ${accessToken.value}`);
    },
  });
  async function refresh(): Promise<boolean> {
    if (refreshing) return refreshing;
    const original = refreshToken.value;
    if (!original) return false;
    const operation = (async () => {
      try {
        const result = await $fetch<any>(`${apiBase}/auth/refresh-token`, {
          method: "POST",
          body: { refreshToken: original },
          retry: 0,
        });
        if (refreshToken.value !== original) return false;
        if (!result?.data?.accessToken || !result?.data?.refreshToken)
          return false;
        accessToken.value = result.data.accessToken;
        refreshToken.value = result.data.refreshToken;
        return true;
      } catch (error: any) {
        if (
          [401, 403].includes(error.status || error.statusCode) &&
          refreshToken.value === original
        ) {
          accessToken.value = null;
          refreshToken.value = null;
        }
        return false;
      }
    })();
    refreshing = operation;
    try {
      return await operation;
    } finally {
      if (refreshing === operation) refreshing = null;
    }
  }
  const api = async <T = any>(url: string, options: any = {}): Promise<T> => {
    const sentAccess = accessToken.value;
    const expectedSubject = subject(sentAccess);
    try {
      return await transport<T>(url, options);
    } catch (error: any) {
      const unauthorized = (error.status || error.statusCode) === 401;
      const publicAuth =
        /^\/?auth\/(login|register|refresh-token|forgot-password|reset-password|verify-otp|resend-otp|privy\/(?:login|config)(?:$|\?))/.test(
          url,
        );
      if (!unauthorized || publicAuth) throw error;
      // A late response from another signed-in account must never replay its action as this account.
      if (expectedSubject && subject(accessToken.value) !== expectedSubject)
        throw error;
      const changed = accessToken.value && accessToken.value !== sentAccess;
      if (changed || (await refresh())) {
        if (expectedSubject && subject(accessToken.value) !== expectedSubject)
          throw error;
        return await transport<T>(url, options);
      }
      if (import.meta.client && !refreshToken.value) {
        await nuxtApp.runWithContext(() => navigateTo("/login"));
      }
      throw error;
    }
  };
  return { provide: { api } };
});
