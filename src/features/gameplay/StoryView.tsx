import { useEffect, useRef } from 'react';
import type { StoryEntry } from '@state/game-store';
import { DialogueBubble } from './DialogueBubble';
import { LottiePlayer } from '@shared/components/LottiePlayer';
import loadingDots from '@/lottie/loading-dots.json';

interface Props {
  entries: StoryEntry[];
  isAiThinking: boolean;
  /** Phase 9.3: chi tiết phase AI để hiển thị state phù hợp */
  aiPhase?: 'idle' | 'logic' | 'narrative';
  playerName: string;
}

export const StoryView = ({ entries, isAiThinking, aiPhase, playerName }: Props) => {
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
                  {seg.content}
                </p>
              ) : (
                <DialogueBubble key={i} speaker={seg.speaker} content={seg.content} />
              ),
            )}
          </div>
        );
      })}

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
              {aiPhase === 'logic' && 'Đấng đang suy tính các khả năng có thể xảy ra...'}
              {aiPhase === 'narrative' && 'Văn phong đang được thiêu chuyển thành thực tại...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
