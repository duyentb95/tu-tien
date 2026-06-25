import { create } from 'zustand';
import { sfx } from '@services/audio';

export type NotificationKind = 'success' | 'info' | 'warn' | 'epic';

export interface Notification {
  id: string;
  kind: NotificationKind;
  /** Icon nhỏ trước message */
  icon?: string;
  title: string;
  message?: string;
  /** Mili-seconds tự dismiss. 0 = manual close */
  ttl?: number;
}

interface NotifStore {
  items: Notification[];
  push: (n: Omit<Notification, 'id'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useNotifStore = create<NotifStore>((set, get) => ({
  items: [],
  push: (n) => {
    const id = crypto.randomUUID();
    const item: Notification = { ttl: 4500, ...n, id };
    set((s) => ({ items: [...s.items, item] }));
    if (item.ttl && item.ttl > 0) {
      setTimeout(() => get().dismiss(id), item.ttl);
    }
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}));

export const notify = {
  success: (title: string, message?: string) => {
    sfx.notify();
    useNotifStore.getState().push({ kind: 'success', icon: '✓', title, ...(message !== undefined ? { message } : {}) });
  },
  info: (title: string, message?: string) => {
    useNotifStore.getState().push({ kind: 'info', icon: '◆', title, ...(message !== undefined ? { message } : {}) });
  },
  warn: (title: string, message?: string) => {
    sfx.hit();
    useNotifStore.getState().push({ kind: 'warn', icon: '⚠', title, ...(message !== undefined ? { message } : {}) });
  },
  epic: (title: string, message?: string) => {
    sfx.bell();
    useNotifStore.getState().push({ kind: 'epic', icon: '✦', title, ttl: 6000, ...(message !== undefined ? { message } : {}) });
  },
};
