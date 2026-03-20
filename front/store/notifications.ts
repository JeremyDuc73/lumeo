import { defineStore } from 'pinia';

export type AppNotification = {
    id: string;
    type: string; // e.g. message.created, reservation.created, reservation.completed
    title: string;
    detail: string;
    createdAt: string;
    link?: string;
    unread?: boolean;
    raw?: any;
};

export const useNotificationsStore = defineStore('notifications', {
    state: () => ({
        items: [] as AppNotification[],
        unread: 0
    }),
    actions: {
        add(n: AppNotification) {
            this.items.unshift({ ...n, unread: true });
            if (this.items.length > 50) this.items = this.items.slice(0, 50);
            this.unread++;
        },
        markAllRead() {
            this.items = this.items.map((n) => ({ ...n, unread: false }));
            this.unread = 0;
        },
        remove(id: string) {
            this.items = this.items.filter((n) => n.id !== id);
        },
        clear() {
            this.items = [];
            this.unread = 0;
        }
    },
    persist: true
});
