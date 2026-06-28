import { create } from 'zustand';
import { sfx } from '@services/audio';

export type NotificationKind = 'success' | 'info' | 'warn' | 'epic';

/** Phase 19: Target khi click action button trong NotificationCenter */
export type NotificationActionTarget =
  | 'daily-missions'
  | 'extended-quests'
  | 'monetization'
  | 'inventory'
  | 'handbook'
  | 'character-sheet'
  | 'world-map'
  | 'cave-abode'
  | 'sect-hall'
  | 'spirit-beasts'
  | 'skills'
  | 'tournament'
  | 'achievements'
  | 'tribulation';

export interface NotificationAction {
  target: NotificationActionTarget;
  label: string;
}

export interface Notification {
  id: string;
  kind: NotificationKind;
  /** Icon nhỏ trước message */
  icon?: string;
  title: string;
  message?: string;
  /** Mili-seconds tự dismiss toast. 0 = manual close. History KHÔNG bị TTL */
  ttl?: number;
  /** Phase 19: optional action → click button trong NotificationCenter mở modal/screen */
  action?: NotificationAction;
  /** Phase 19: timestamp tạo notif (cho history sort) */
  createdAt: number;
  /** Phase 19: read status (cho badge unread count) */
  read: boolean;
}

const HISTORY_CAP = 50;

interface NotifStore {
  /** Toasts đang active (auto-dismiss) */
  items: Notification[];
  /** History rolling 50, KHÔNG auto-dismiss */
  history: Notification[];
  unreadCount: number;

  push: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearHistory: () => void;
}

export const useNotifStore = create<NotifStore>((set, get) => ({
  items: [],
  history: [],
  unreadCount: 0,

  push: (n) => {
    const id = crypto.randomUUID();
    const item: Notification = {
      ttl: 4500,
      ...n,
      id,
      createdAt: Date.now(),
      read: false,
    };
    set((s) => ({
      items: [...s.items, item],
      history: [item, ...s.history].slice(0, HISTORY_CAP),
      unreadCount: s.unreadCount + 1,
    }));
    if (item.ttl && item.ttl > 0) {
      setTimeout(() => get().dismiss(id), item.ttl);
    }
  },

  dismiss: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  clear: () => set({ items: [] }),

  markRead: (id) =>
    set((s) => {
      const hit = s.history.find((n) => n.id === id);
      if (!hit || hit.read) return s;
      return {
        history: s.history.map((n) => (n.id === id ? { ...n, read: true } : n)),
        unreadCount: Math.max(0, s.unreadCount - 1),
      };
    }),

  markAllRead: () =>
    set((s) => ({
      history: s.history.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearHistory: () => set({ history: [], unreadCount: 0 }),
}));

type NotifyOpts = Pick<Notification, 'message' | 'action' | 'ttl'>;

const buildPayload = (
  base: Pick<Notification, 'kind' | 'icon' | 'title' | 'ttl'>,
  opts?: NotifyOpts | string,
) => {
  // Backward-compat: opts có thể là string (chỉ message), hoặc object đầy đủ
  if (typeof opts === 'string') return { ...base, message: opts };
  if (!opts) return base;
  return {
    ...base,
    ...(opts.message !== undefined ? { message: opts.message } : {}),
    ...(opts.action ? { action: opts.action } : {}),
    ...(opts.ttl !== undefined ? { ttl: opts.ttl } : {}),
  };
};

export const notify = {
  success: (title: string, opts?: NotifyOpts | string) => {
    sfx.notify();
    useNotifStore.getState().push(
      buildPayload({ kind: 'success', icon: '✓', title }, opts),
    );
  },
  info: (title: string, opts?: NotifyOpts | string) => {
    useNotifStore.getState().push(
      buildPayload({ kind: 'info', icon: '◆', title }, opts),
    );
  },
  warn: (title: string, opts?: NotifyOpts | string) => {
    sfx.hit();
    useNotifStore.getState().push(
      buildPayload({ kind: 'warn', icon: '⚠', title }, opts),
    );
  },
  epic: (title: string, opts?: NotifyOpts | string) => {
    sfx.bell();
    useNotifStore.getState().push(
      buildPayload({ kind: 'epic', icon: '✦', title, ttl: 6000 }, opts),
    );
  },
};

/** Phase 19: dispatch global event mở modal/screen tương ứng với notification action */
export const openTarget = (target: NotificationActionTarget) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<NotificationActionTarget>('tutien:open', { detail: target }),
  );
};
