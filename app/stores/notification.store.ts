import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    unreadCount: 0,
    notifications: [] as any[],
  }),
  actions: {
    setNotifications(notifications: any[]) {
      this.notifications = notifications;
    },
    setUnreadCount(count: number) {
      this.unreadCount = count;
    },
    markAsRead(id: string) {
      const n = this.notifications.find((item) => item._id === id);
      if (n) {
        n.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    },
  },
});
