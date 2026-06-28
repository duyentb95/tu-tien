/**
 * Phase 19: Notification Center — bell icon nav + dropdown panel.
 *
 * Hiển thị history rolling 50 notification, mỗi item có:
 *   - Icon kind (✓ ◆ ⚠ ✦) + title + message
 *   - Timestamp tương đối ("2 phút trước")
 *   - Button action (nếu có) → dispatch event mở modal/screen
 *
 * Badge unread count trên bell icon.
 * Click bell → toggle dropdown.
 * Click "Đánh dấu đã đọc" → reset unreadCount.
 */
import { useEffect, useRef, useState } from 'react';
import {
  useNotifStore,
  openTarget,
  type Notification,
  type NotificationActionTarget,
} from '@state/notifications';

const TARGET_LABEL: Record<NotificationActionTarget, string> = {
  'daily-missions': 'Mở Nhiệm Vụ Hàng Ngày',
  'extended-quests': 'Mở Chuỗi Nhiệm Vụ',
  'monetization': 'Mở Cửa Hàng',
  'inventory': 'Mở Hành Trang',
  'handbook': 'Mở Cẩm Nang',
  'character-sheet': 'Mở Đạo Cơ',
  'world-map': 'Mở Bản Đồ',
  'cave-abode': 'Mở Động Phủ',
  'sect-hall': 'Mở Tông Môn',
  'spirit-beasts': 'Mở Linh Thú',
  'skills': 'Mở Pháp Thuật',
  'tournament': 'Mở Đại Hội',
  'achievements': 'Mở Thành Tựu',
  'tribulation': 'Mở Độ Kiếp',
  'cultivation': 'Mở Đạo Tâm',
};

const KIND_COLOR: Record<Notification['kind'], string> = {
  success: 'border-jade-500/40 bg-jade-900/15',
  info: 'border-spirit-500/30 bg-spirit-900/15',
  warn: 'border-ember-500/40 bg-ember-900/15',
  epic: 'border-gold-500/50 bg-gold-900/20',
};

const formatRelTime = (ts: number): string => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10) return 'vừa xong';
  if (s < 60) return `${s}s trước`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

export const NotificationCenter = () => {
  const history = useNotifStore((s) => s.history);
  const unreadCount = useNotifStore((s) => s.unreadCount);
  const markRead = useNotifStore((s) => s.markRead);
  const markAllRead = useNotifStore((s) => s.markAllRead);
  const clearHistory = useNotifStore((s) => s.clearHistory);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Click ngoài → đóng
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Mở dropdown → mark all read sau 0.5s (cho user thấy badge trước khi reset)
  useEffect(() => {
    if (!open || unreadCount === 0) return;
    const t = setTimeout(() => markAllRead(), 500);
    return () => clearTimeout(t);
  }, [open, unreadCount, markAllRead]);

  return (
    <div ref={ref} className="relative">
      {/* Bell icon button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded border border-spirit-500/30 bg-ink-800/60 px-2.5 py-1.5 text-[12px] text-spirit-300 hover:bg-spirit-900/30"
        title="Trung tâm thông báo"
        aria-label="Trung tâm thông báo"
      >
        <span className="text-[14px]">🔔</span>
        {unreadCount > 0 && (
          <span
            className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-ember-500 px-1 py-0.5 text-center text-[9px] font-bold text-ink-900"
            aria-label={`${unreadCount} thông báo mới`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[360px] max-w-[90vw] rounded border border-gold-500/40 bg-ink-900/98 shadow-2xl backdrop-blur"
          role="dialog"
          aria-label="Lịch sử thông báo"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-spirit-500/20 px-3 py-2">
            <h3 className="font-serif text-sm text-gold-300">
              ✦ Trung Tâm Thông Báo
            </h3>
            <div className="flex gap-1">
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="rounded border border-ink-500 px-2 py-0.5 text-[9px] uppercase tracking-widest text-jade-500 hover:bg-ink-800"
                  title="Xoá tất cả lịch sử"
                >
                  Xoá
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="custom-scroll max-h-[60vh] overflow-y-auto">
            {history.length === 0 ? (
              <div className="px-3 py-8 text-center text-[11px] italic text-jade-500">
                Chưa có thông báo nào.
              </div>
            ) : (
              <ul className="divide-y divide-spirit-500/10">
                {history.map((n) => (
                  <li
                    key={n.id}
                    className={`relative px-3 py-2.5 transition-colors ${
                      n.read ? 'opacity-70' : 'bg-spirit-900/10'
                    } ${KIND_COLOR[n.kind]} border-l-2`}
                  >
                    {!n.read && (
                      <span
                        className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ember-400"
                        aria-label="Chưa đọc"
                      />
                    )}
                    <div className="flex items-start gap-1.5">
                      <span className="mt-0.5 text-[11px] opacity-70">
                        {n.icon}
                      </span>
                      <div className="flex-1">
                        <div className="font-serif text-[12px] text-gold-200">
                          {n.title}
                        </div>
                        {n.message && (
                          <div className="mt-0.5 text-[11px] text-jade-300">
                            {n.message}
                          </div>
                        )}
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[9px] italic text-jade-600">
                            {formatRelTime(n.createdAt)}
                          </span>
                          {n.action && (
                            <button
                              onClick={() => {
                                markRead(n.id);
                                openTarget(n.action!.target);
                                setOpen(false);
                              }}
                              className="rounded border border-gold-500/50 bg-gold-900/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gold-200 hover:bg-gold-700/40"
                            >
                              → {n.action.label || TARGET_LABEL[n.action.target]}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-spirit-500/20 px-3 py-1.5 text-center text-[9px] italic text-jade-600">
            Lưu tối đa 50 thông báo gần nhất
          </div>
        </div>
      )}
    </div>
  );
};
