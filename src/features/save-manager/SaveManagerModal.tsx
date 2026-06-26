import { useState, useRef, useEffect, useCallback } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import { useGameStore } from '@state/game-store';
import { useKeyboard } from '@shared/hooks/useKeyboard';
import {
  listSlots,
  exportSlot,
  importFromFile,
  deleteSlot,
  renameSlot,
  nextFreeSlotId,
  getStorageUsage,
  type SaveSlotInfo,
} from '@services/save-manager';
import { notify } from '@state/notifications';

interface SaveManagerModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Save Manager Modal — quản lý multi-slot save.
 * 2 section: Manual saves (user tạo) + Auto-backups (rolling 3 slot).
 * Actions: Load / Save (new slot) / Rename / Delete / Export / Import.
 */
export const SaveManagerModal = ({ open, onClose }: SaveManagerModalProps) => {
  const [slots, setSlots] = useState<SaveSlotInfo[]>([]);
  const [usage, setUsage] = useState({ usedKb: 0, totalKb: 5120, percent: 0 });
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const player = useGameStore((s) => s.player);
  const saveToSlot = useGameStore((s) => s.saveToSlot);
  const loadFromSlot = useGameStore((s) => s.loadFromSlot);

  const refresh = useCallback(() => {
    setSlots(listSlots());
    setUsage(getStorageUsage());
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const handleSaveNew = () => {
    if (!player) {
      notify.warn('Chưa có nhân vật', 'Tạo nhân vật trước khi save');
      return;
    }
    const slotId = nextFreeSlotId();
    if (!slotId) {
      notify.warn('Hết slot trống', 'Xóa bớt save cũ trước (max 10 slot)');
      return;
    }
    const ok = saveToSlot(slotId);
    if (ok) {
      notify.epic('Đã lưu', `${player.Name} · slot ${slotId.replace('slot-', '')}`);
      refresh();
    } else {
      notify.warn('Save thất bại', 'Có thể hết localStorage');
    }
  };

  const handleLoad = (slot: SaveSlotInfo) => {
    if (!confirm(`Tải save "${slot.name}"?\nDữ liệu hiện tại sẽ bị ghi đè (nhưng vẫn còn trong các slot khác).`)) return;
    const ok = loadFromSlot(slot.id);
    if (ok) {
      notify.epic('Đã tải save', `${slot.playerName ?? ''} · Lượt ${slot.turn ?? 0}`);
      onClose();
    } else {
      notify.warn('Tải thất bại', 'File save có thể bị hỏng');
    }
  };

  const handleDelete = (slot: SaveSlotInfo) => {
    if (!confirm(`Xóa save "${slot.name}"? Không thể hoàn tác.`)) return;
    deleteSlot(slot.id);
    notify.info('Đã xóa', slot.name);
    refresh();
  };

  const handleExport = (slot: SaveSlotInfo) => {
    const result = exportSlot(slot.id);
    if (result.ok) {
      notify.info('Đã tải file save', `Backup ${slot.name}`);
    } else {
      notify.warn('Export thất bại', result.error ?? '');
    }
  };

  const handleStartRename = (slot: SaveSlotInfo) => {
    setRenaming(slot.id);
    setRenameValue(slot.name);
  };

  const handleConfirmRename = () => {
    if (!renaming || !renameValue.trim()) return;
    renameSlot(renaming, renameValue.trim());
    setRenaming(null);
    refresh();
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importFromFile(file);
    if (result.ok) {
      notify.epic('Import thành công', `Đã thêm vào ${result.slotId}`);
      refresh();
    } else {
      notify.warn('Import thất bại', result.error ?? '');
    }
    e.target.value = ''; // reset input
  };

  // ESC để đóng
  useKeyboard({ Escape: onClose }, [onClose], open);

  if (!open) return null;

  const manualSlots = slots.filter((s) => s.kind === 'manual');
  const autoSlots = slots.filter((s) => s.kind === 'autobackup');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-manager-title"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        className="relative w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        <Bracketed className="rounded-md border bg-ink-700" tone="gold">
          <div className="flex flex-col" style={{ maxHeight: '85vh' }}>
            {/* Header */}
            <header className="flex items-center justify-between border-b border-gold-700/15 px-6 py-4">
              <div>
                <div className="label-section mb-1">Lưu Trữ · Đa Slot</div>
                <h2 id="save-manager-title" className="font-serif text-2xl font-bold uppercase tracking-wider text-gold-200">
                  Quản Lý Bản Lưu
                </h2>
                <p className="mt-1 text-[11.5px] text-jade-500">
                  Bộ nhớ: <span className="font-mono text-gold-300">{usage.usedKb} KB / {usage.totalKb} KB</span>
                  <span className="ml-2" style={{ color: usage.percent > 80 ? 'var(--ember-400)' : 'var(--jade-500)' }}>
                    ({usage.percent}%)
                  </span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-sm p-2 text-2xl text-gold-300 transition-colors hover:text-gold-100"
                aria-label="Đóng quản lý lưu trữ (Esc)"
                title="Đóng (Esc)"
              >
                ⊗
              </button>
            </header>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 border-b border-gold-700/10 px-6 py-3">
              <button onClick={handleSaveNew} className="btn-primary text-[12px]" disabled={!player}>
                + Save Slot Mới
              </button>
              <button onClick={handleImportClick} className="btn-jade text-[12px]">
                ↓ Import từ File
              </button>
              <div className="ml-auto self-center text-[11px] italic text-jade-500">
                {manualSlots.length} / 10 slot manual · {autoSlots.length} auto-backup
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Manual saves */}
              <div className="mb-6">
                <div className="label-gold mb-3">Bản Lưu Thủ Công</div>
                {manualSlots.length === 0 ? (
                  <p className="rounded-sm border border-jade-700/30 bg-jade-700/5 p-4 text-center text-[12.5px] italic text-jade-500">
                    Chưa có save nào. Nhấn "+ Save Slot Mới" để tạo bản lưu đầu tiên.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {manualSlots.map((slot) => (
                      <SlotCard
                        key={slot.id}
                        slot={slot}
                        renaming={renaming === slot.id}
                        renameValue={renameValue}
                        onRenameChange={setRenameValue}
                        onStartRename={() => handleStartRename(slot)}
                        onConfirmRename={handleConfirmRename}
                        onCancelRename={() => setRenaming(null)}
                        onLoad={() => handleLoad(slot)}
                        onDelete={() => handleDelete(slot)}
                        onExport={() => handleExport(slot)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-backups */}
              {autoSlots.length > 0 && (
                <div>
                  <div className="label-gold mb-3">
                    Auto-Backup <span className="text-[10px] font-normal italic text-jade-500">(rolling 3 slot gần nhất)</span>
                  </div>
                  <div className="space-y-2">
                    {autoSlots.map((slot) => (
                      <SlotCard
                        key={slot.id}
                        slot={slot}
                        renaming={false}
                        renameValue=""
                        onRenameChange={() => {}}
                        onStartRename={() => {}}
                        onConfirmRename={() => {}}
                        onCancelRename={() => {}}
                        onLoad={() => handleLoad(slot)}
                        onDelete={() => handleDelete(slot)}
                        onExport={() => handleExport(slot)}
                        readonly
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="border-t border-gold-700/15 px-6 py-3 text-center text-[11px] italic text-jade-500">
              💡 Mẹo: Export save quan trọng ra file .json để backup. Xóa cache trình duyệt = mất save trong localStorage.
            </footer>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Slot card
// ─────────────────────────────────────────────────────────────────────

interface SlotCardProps {
  slot: SaveSlotInfo;
  renaming: boolean;
  renameValue: string;
  onRenameChange: (v: string) => void;
  onStartRename: () => void;
  onConfirmRename: () => void;
  onCancelRename: () => void;
  onLoad: () => void;
  onDelete: () => void;
  onExport: () => void;
  readonly?: boolean;
}

const SlotCard = ({
  slot, renaming, renameValue, onRenameChange, onStartRename,
  onConfirmRename, onCancelRename, onLoad, onDelete, onExport, readonly,
}: SlotCardProps) => {
  const date = new Date(slot.savedAt);
  const dateStr = date.toLocaleString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div
      className="rounded-sm border bg-ink-800/40 p-3 transition-colors hover:bg-ink-800/70"
      style={{ borderColor: 'rgba(205,164,94,.15)' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {renaming ? (
            <div className="flex items-center gap-2">
              <input
                value={renameValue}
                onChange={(e) => onRenameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onConfirmRename();
                  if (e.key === 'Escape') onCancelRename();
                }}
                autoFocus
                className="flex-1 rounded-sm border border-gold-500/40 bg-ink-900 px-2 py-1 text-[13px] text-gold-100"
                placeholder="Tên save..."
              />
              <button onClick={onConfirmRename} className="text-[11px] text-leaf-500 hover:text-leaf-300">
                ✓ OK
              </button>
              <button onClick={onCancelRename} className="text-[11px] text-jade-500 hover:text-gold-300">
                ⊗
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h4 className="truncate font-serif text-[14px] font-medium text-gold-200">{slot.name}</h4>
              {!readonly && (
                <button
                  onClick={onStartRename}
                  className="text-[10px] text-jade-500 transition-colors hover:text-gold-300"
                  aria-label="Đổi tên"
                >
                  ✎
                </button>
              )}
            </div>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-jade-400">
            {slot.playerName && (
              <span className="font-mono">
                <span className="text-gold-300">{slot.playerName}</span>
                {slot.level && <span className="ml-1 text-gold-500">Lv {slot.level}</span>}
              </span>
            )}
            {slot.turn !== undefined && <span>Lượt <span className="font-mono">{slot.turn}</span></span>}
            <span className="text-jade-500">·</span>
            <span>{dateStr}</span>
            <span className="text-jade-500">·</span>
            <span className="font-mono text-jade-500">{slot.sizeKb} KB</span>
          </div>
        </div>

        <div className="flex flex-shrink-0 gap-1">
          <button
            onClick={onLoad}
            className="rounded-sm border border-leaf-500/40 bg-leaf-500/5 px-3 py-1.5 text-[11.5px] text-leaf-500 transition-colors hover:bg-leaf-500/15"
          >
            ↑ Tải
          </button>
          <button
            onClick={onExport}
            className="rounded-sm border border-gold-500/40 bg-gold-500/5 px-3 py-1.5 text-[11.5px] text-gold-300 transition-colors hover:bg-gold-500/15"
            title="Tải file .json"
          >
            ↓ Export
          </button>
          <button
            onClick={onDelete}
            className="rounded-sm border border-blood-500/40 bg-blood-500/5 px-3 py-1.5 text-[11.5px] text-ember-300 transition-colors hover:bg-blood-500/15"
          >
            ⊗ Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
