export const useApi = () => {
  const { $api } = useNuxtApp();

  const get = <T = any>(url: string, params?: Record<string, any>) =>
    $api<T>(url, { method: 'GET', params });

  const post = <T = any>(url: string, body?: any) =>
    $api<T>(url, { method: 'POST', body });

  const put = <T = any>(url: string, body?: any) =>
    $api<T>(url, { method: 'PUT', body });

  const patch = <T = any>(url: string, body?: any) =>
    $api<T>(url, { method: 'PATCH', body });

  const del = <T = any>(url: string) =>
    $api<T>(url, { method: 'DELETE' });

  const upload = <T = any>(url: string, formData: FormData) =>
    $api<T>(url, { method: 'POST', body: formData });

  return { get, post, put, patch, del, upload };
};
