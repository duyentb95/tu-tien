import { useMemo, Fragment } from 'react';

interface EntityRef {
  name: string;
  type: 'character' | 'location' | 'lore_npc' | 'lore_location' | 'lore_item' | 'skill';
}

interface Props {
  text: string;
  entities: EntityRef[];
  onEntityClick: (name: string) => void;
}

/**
 * Phase 9.5: Quét narrative text, wrap tên entity quen biết bằng span clickable gold underline.
 *
 * Approach: longest-first matching (tránh "Hắc Phong" match trong "Hắc Phong Trại"),
 * case-insensitive, không cần word boundary (Vietnamese không hỗ trợ \b cleanly với dấu).
 *
 * Để tránh false-positives quá nhiều, chỉ match khi tên ≥ 3 ký tự.
 */
export const EntityHighlighter = ({ text, entities, onEntityClick }: Props) => {
  // Sort entities theo độ dài DESC để tránh nested matching
  const sortedEntities = useMemo(() => {
    return [...entities]
      .filter((e) => e.name && e.name.length >= 3)
      .sort((a, b) => b.name.length - a.name.length);
  }, [entities]);

  // Build regex pattern alternation từ tất cả entity names (escaped)
  const segments = useMemo(() => {
    if (sortedEntities.length === 0) {
      return [{ type: 'text' as const, content: text }];
    }

    // Escape regex special chars
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = sortedEntities.map((e) => escapeRegex(e.name)).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    const result: Array<
      | { type: 'text'; content: string }
      | { type: 'entity'; content: string; entityType: EntityRef['type'] }
    > = [];

    let lastIdx = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      // Text before match
      if (match.index > lastIdx) {
        result.push({ type: 'text', content: text.slice(lastIdx, match.index) });
      }
      // Find entity (case-insensitive)
      const matchedName = match[0];
      const entity = sortedEntities.find(
        (e) => e.name.toLowerCase() === matchedName.toLowerCase(),
      );
      if (entity) {
        result.push({ type: 'entity', content: matchedName, entityType: entity.type });
      } else {
        result.push({ type: 'text', content: matchedName });
      }
      lastIdx = regex.lastIndex;
    }
    // Tail
    if (lastIdx < text.length) {
      result.push({ type: 'text', content: text.slice(lastIdx) });
    }

    return result;
  }, [text, sortedEntities]);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <Fragment key={i}>{seg.content}</Fragment>;
        }
        // Entity - style theo type
        const isLore = seg.entityType.includes('lore');
        const colorClass = isLore
          ? 'text-spirit-300 decoration-spirit-500/50 hover:text-spirit-100 hover:decoration-spirit-300'
          : 'text-gold-300 decoration-gold-500/50 hover:text-gold-100 hover:decoration-gold-300';

        return (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEntityClick(seg.content);
            }}
            className={`inline cursor-pointer font-semibold underline decoration-dotted underline-offset-2 transition-colors ${colorClass}`}
            title={`Xem chi tiết: ${seg.content}`}
          >
            {seg.content}
          </button>
        );
      })}
    </>
  );
};
