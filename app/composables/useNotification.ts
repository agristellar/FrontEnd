interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

const notifications = ref<Notification[]>([]);
let nextId = 0;

export const useNotification = () => {
  const add = (notification: Omit<Notification, 'id'>) => {
    const id = nextId++;
    const n = { ...notification, id };
    notifications.value.push(n);
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  };

  const remove = (id: number) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  const success = (title: string, message?: string) => add({ type: 'success', title, message });
  const error = (title: string, message?: string) => add({ type: 'error', title, message });
  const warning = (title: string, message?: string) => add({ type: 'warning', title, message });
  const info = (title: string, message?: string) => add({ type: 'info', title, message });

  return { notifications: readonly(notifications), add, remove, success, error, warning, info };
};
