import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '@state/game-store';
import type { StoryEntry } from '@state/game-store';
import { DialogueBubble } from './DialogueBubble';
import { LottiePlayer } from '@shared/components/LottiePlayer';
import { EntityHighlighter } from './EntityHighlighter';
import { EntityInspectModal, type InspectableEntity } from './EntityInspectModal';
import loadingDots from '@/lottie/loading-dots.json';

interface Props {
  entries: StoryEntry[];
  isAiThinking: boolean;
  /** Phase 9.3: chi tiết phase AI để hiển thị state phù hợp */
  aiPhase?: 'idle' | 'logic' | 'narrative';
  playerName: string;
}

export const StoryView = ({ entries, isAiThinking, aiPhase, playerName }: Props) => {
  // Phase 9.5: Entity click-to-inspect — quét knowledge state lấy danh sách entities
  const knowledge = useGameStore((s) => s.knowledge);
  const [inspectEntity, setInspectEntity] = useState<InspectableEntity | null>(null);

  // Build inspectable entity list từ knowledge
  const allEntities = useMemo(() => {
    const list: Array<{
      name: string;
      type: 'character' | 'location' | 'lore_npc' | 'lore_location' | 'lore_item' | 'skill';
    }> = [];

    // World locations (đã materialize)
    for (const loc of Object.values(knowledge.locations ?? {})) {
      const name = (loc as { name?: string }).name;
      if (name) list.push({ name, type: 'location' });
    }
    // Lore NPCs (tin đồn)
    for (const lid of Object.values(knowledge.loreNpcs ?? {})) {
      const name = (lid as { name?: string }).name;
      if (name) list.push({ name, type: 'lore_npc' });
    }
    // Lore locations
    for (const lid of Object.values(knowledge.loreLocations ?? {})) {
      const name = (lid as { name?: string }).name;
      if (name) list.push({ name, type: 'lore_location' });
    }
    // Lore items
    for (const lid of Object.values(knowledge.loreItems ?? {})) {
      const name = (lid as { name?: string }).name;
      if (name) list.push({ name, type: 'lore_item' });
    }
    return list;
  }, [knowledge.locations, knowledge.loreNpcs, knowledge.loreLocations, knowledge.loreItems]);

  // Click handler — lookup entity detail từ knowledge và open modal
  const handleEntityClick = (name: string) => {
    const target = name.toLowerCase();

    // World location
    for (const loc of Object.values(knowledge.locations ?? {})) {
      const e = loc as { name?: string; description?: string; category?: string };
      if (e.name?.toLowerCase() === target) {
        setInspectEntity({
          type: 'location',
          name: e.name,
          ...(e.description ? { description: e.description } : {}),
          ...(e.category ? { category: e.category } : {}),
        });
        return;
      }
    }
    // Lore NPCs
    for (const lid of Object.values(knowledge.loreNpcs ?? {})) {
      const e = lid as { name?: string; description?: string; role?: string };
      if (e.name?.toLowerCase() === target) {
        setInspectEntity({
          type: 'lore_npc',
          name: e.name,
          ...(e.description ? { description: e.description } : {}),
          ...(e.role ? { role: e.role } : {}),
        });
        return;
      }
    }
    // Lore locations
    for (const lid of Object.values(knowledge.loreLocations ?? {})) {
      const e = lid as { name?: string; description?: string; region?: string };
      if (e.name?.toLowerCase() === target) {
        setInspectEntity({
          type: 'lore_location',
          name: e.name,
          ...(e.description ? { description: e.description } : {}),
          ...(e.region ? { category: e.region } : {}),
        });
        return;
      }
    }
    // Lore items
    for (const lid of Object.values(knowledge.loreItems ?? {})) {
      const e = lid as { name?: string; description?: string; rarity?: string; category?: string };
      if (e.name?.toLowerCase() === target) {
        setInspectEntity({
          type: 'lore_item',
          name: e.name,
          ...(e.description ? { description: e.description } : {}),
          ...(e.rarity ? { rarity: e.rarity } : {}),
          ...(e.category ? { category: e.category } : {}),
        });
        return;
      }
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll xuống dưới khi có entry mới
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries.length, isAiThinking]);

  return (
    <div
      ref={scrollRef}
      className="panel-gold custom-scroll flex-1 space-y-2 overflow-y-auto p-6"
      style={{ minHeight: '400px', maxHeight: 'calc(100vh - 360px)' }}
    >
      {entries.length === 0 && !isAiThinking && (
        <p className="text-center italic text-jade-600">
          Mở đầu câu chuyện đang được khai mở…
        </p>
      )}

      {entries.map((entry) => {
        if (entry.kind === 'player_action') {
          return (
            <DialogueBubble
              key={entry.id}
              speaker={playerName}
              content={`→ ${entry.content}`}
              isPlayer
            />
          );
        }
        if (entry.kind === 'system') {
          return (
            <div
              key={entry.id}
              className="my-3 rounded-md border border-spirit-500/30 bg-void-900/40 px-4 py-2 text-center text-sm italic text-spirit-300"
            >
              {entry.content}
            </div>
          );
        }
        // narrative
        return (
          <div key={entry.id} className="space-y-2">
            {entry.segments?.map((seg, i) =>
              seg.type === 'narrative' ? (
                <p
                  key={i}
                  className="story-text whitespace-pre-line py-2 text-[15px] leading-[1.85] text-gold-200"
                >
                  <EntityHighlighter
                    text={seg.content}
                    entities={allEntities}
                    onEntityClick={handleEntityClick}
                  />
                </p>
              ) : (
                <DialogueBubble key={i} speaker={seg.speaker} content={seg.content} />
              ),
            )}
          </div>
        );
      })}

      {/* Phase 9.5: Modal inspect khi click entity */}
      <EntityInspectModal entity={inspectEntity} onClose={() => setInspectEntity(null)} />

      {isAiThinking && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <LottiePlayer animationData={loadingDots} width={80} height={20} />
          <div className="space-y-1">
            <p className="font-serif text-base text-gold-300">
              {aiPhase === 'logic' && '🎲 Đang Gieo Xúc Xắc Vận Mệnh…'}
              {aiPhase === 'narrative' && '✦ Thiên Đạo đang diễn hóa…'}
              {(!aiPhase || aiPhase === 'idle') && 'Đang suy ngẫm thiên cơ…'}
            </p>
            <p className="text-xs italic text-jade-500">
              {aiPhase === 'logic' && 'Thiên Đạo đang suy tính các khả năng có thể xảy ra...'}
              {aiPhase === 'narrative' && 'Văn phong đang được thiêu chuyển thành thực tại...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
