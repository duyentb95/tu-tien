import { useEffect, useRef } from 'react';
import { useGameStore, type GameStage } from '@state/game-store';

/**
 * Phase 14.x: Global keyboard shortcuts hoạt động ở MỌI screen.
 *
 * Bao gồm:
 *   - Esc: back về screen trước (combat/tribulation → playing, sub-screen → playing,
 *     playing → confirm thoát, modal đóng auto handled bằng `enabled` flag).
 *   - Stage navigation chỉ active khi stage === 'playing' (sub-screen không bind):
 *     - M: map · I: inventory · C: character · Q: quests · K: skill mgmt
 *     - G: sect hall · B: cave abode · V: spirit beasts · T: tribulation
 *     - L: tra cứu · F1 hoặc Shift+/: handbook · Shift+?: shortcut help
 *
 * Cách dùng: gọi hook 1 lần ở App level. Modal handlers (skill mgmt, tra cứu...)
 * vẫn dispatch CustomEvent vì những state đó local trong GameplayScreen.
 */

const SUB_SCREENS: GameStage[] = [
  'character', 'inventory', 'world_map', 'quests', 'sect_hall',
  'secret_realm', 'spirit_beasts', 'cave_abode', 'tribulation', 'combat',
];

export const useGlobalShortcuts = (): void => {
  const stage = useGameStore((s) => s.stage);
  const setStage = useGameStore((s) => s.setStage);
  const combat = useGameStore((s) => s.combat);

  // Ref để handler trong useEffect không stale
  const stageRef = useRef(stage);
  const combatRef = useRef(combat);
  useEffect(() => { stageRef.current = stage; combatRef.current = combat; }, [stage, combat]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip nếu đang gõ input
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable
        ) {
          // Vẫn cho Escape qua (đóng modal)
          if (e.key !== 'Escape') return;
        }
      }

      const curStage = stageRef.current;
      const code = e.code;
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey;

      // ─── Esc: back ───
      if (e.key === 'Escape' && !hasModifier) {
        // Modal mở thì để modal tự handle (component lắng nghe Escape qua useKeyboard).
        // Hook này chỉ handle stage-level back.
        if (curStage === 'initial' || curStage === 'adventure_mode' || curStage === 'setup' || curStage === 'playing') {
          // Initial/setup/adventure không back. Playing thì để gameplay xử lý exit confirm.
          return;
        }
        // Combat đang ongoing → không cho Esc (tránh thoát giữa trận)
        if (curStage === 'combat' && combatRef.current?.status === 'ongoing') {
          return;
        }
        if (SUB_SCREENS.includes(curStage)) {
          e.preventDefault();
          setStage('playing');
        }
        return;
      }

      // ─── Stage navigation: chỉ active khi đang ở 'playing' (sub-screen không jump tiếp) ───
      if (curStage !== 'playing' || hasModifier) return;

      const navMap: Record<string, GameStage> = {
        KeyM: 'world_map',
        KeyI: 'inventory',
        KeyC: 'character',
        KeyQ: 'quests',
        KeyG: 'sect_hall',
        KeyB: 'cave_abode',
        KeyV: 'spirit_beasts',
      };
      const targetStage = navMap[code];
      if (targetStage) {
        e.preventDefault();
        setStage(targetStage);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setStage]);
};

/** Catalog shortcuts để help modal hiển thị */
export interface ShortcutEntry {
  keys: string[];
  label: string;
  category: 'navigation' | 'modals' | 'actions';
  whenStage?: GameStage[];
}

export const SHORTCUT_CATALOG: ShortcutEntry[] = [
  // Navigation
  { keys: ['Esc'], label: 'Quay về câu chuyện chính (từ sub-screen)', category: 'navigation' },
  { keys: ['M'], label: 'Bản Đồ Thế Giới', category: 'navigation', whenStage: ['playing'] },
  { keys: ['I'], label: 'Hành Trang', category: 'navigation', whenStage: ['playing'] },
  { keys: ['C'], label: 'Nhân Vật', category: 'navigation', whenStage: ['playing'] },
  { keys: ['Q'], label: 'Nhiệm Vụ', category: 'navigation', whenStage: ['playing'] },
  { keys: ['G'], label: 'Tông Môn', category: 'navigation', whenStage: ['playing'] },
  { keys: ['B'], label: 'Động Phủ', category: 'navigation', whenStage: ['playing'] },
  { keys: ['V'], label: 'Linh Thú', category: 'navigation', whenStage: ['playing'] },

  // Modals
  { keys: ['?'], label: 'Cẩm Nang', category: 'modals' },
  { keys: ['Shift', '?'], label: 'Bảng tắt (chính cái này)', category: 'modals' },
  { keys: ['Ctrl/Cmd', 'S'], label: 'Lưu Trữ Quản Lý', category: 'modals' },

  // Combat actions
  { keys: ['1-4'], label: 'Chọn nhanh action 1-4', category: 'actions', whenStage: ['playing', 'combat'] },
  { keys: ['Enter'], label: 'Gửi action tự do (khi focus input)', category: 'actions', whenStage: ['playing'] },
];
