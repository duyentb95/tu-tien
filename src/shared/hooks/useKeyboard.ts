import { useEffect, useRef } from 'react';

/**
 * useKeyboard — register keyboard shortcuts.
 *
 * @param shortcuts - map keyCode → handler
 *   Keys: 'Escape', 'Enter', 'Digit1'-'Digit9', 'KeyA'-'KeyZ', 'Slash', etc.
 *   Use 'cmd+s' / 'ctrl+s' format cho modifier (chỉ support 1 modifier)
 * @param deps - dependency array (handler refs invalidate on deps change)
 * @param enabled - false = pause listener (vd: modal đóng, không listen)
 *
 * Auto-skip when user đang gõ trong <input>, <textarea>, contenteditable.
 *
 * Usage:
 *   useKeyboard({
 *     'Escape': () => setOpen(false),
 *     'Digit1': () => selectAction(0),
 *     'cmd+s': () => save(),
 *   }, [open], open);
 */

type Handler = (e: KeyboardEvent) => void;

export const useKeyboard = (
  shortcuts: Record<string, Handler>,
  deps: unknown[] = [],
  enabled: boolean = true,
): void => {
  // Keep latest handlers in ref để effect không re-bind mỗi render
  const handlersRef = useRef(shortcuts);
  useEffect(() => {
    handlersRef.current = shortcuts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Skip if user đang gõ input
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable
        ) {
          // Vẫn cho Escape qua để đóng modal
          if (e.key !== 'Escape') return;
        }
      }

      // Build key string: 'cmd+s', 'shift+Enter', hoặc just 'Escape'
      const parts: string[] = [];
      if (e.metaKey) parts.push('cmd');
      else if (e.ctrlKey) parts.push('ctrl');
      if (e.shiftKey && e.key.length === 1) parts.push('shift');
      if (e.altKey) parts.push('alt');

      // Map e.code → friendly name. Prefer e.code (layout-independent) cho Digit/Key.
      const codeKey = e.code; // ex: 'Digit1', 'KeyA', 'Escape', 'Enter', 'Slash'

      // Try in order: modifier+code, modifier+key, code, key
      const candidates = [
        parts.length > 0 ? `${parts.join('+')}+${codeKey}` : null,
        parts.length > 0 ? `${parts.join('+')}+${e.key}` : null,
        codeKey,
        e.key,
      ].filter((k): k is string => k !== null);

      for (const key of candidates) {
        const fn = handlersRef.current[key];
        if (fn) {
          fn(e);
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled]);
};
