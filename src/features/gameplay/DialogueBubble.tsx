interface Props {
  speaker: string;
  content: string;
  isPlayer?: boolean;
}

export const DialogueBubble = ({ speaker, content, isPlayer }: Props) => {
  const align = isPlayer ? 'items-end' : 'items-start';
  const bubble = isPlayer
    ? 'bg-gradient-to-br from-ink-500/90 to-ink-700/90 border-gold-700/40 self-end rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm'
    : 'bg-gradient-to-br from-ink-700/90 to-ink-600/90 border-jade-700/40 self-start rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-2xl';
  const nameColor = isPlayer ? 'text-gold-500' : 'text-jade-400';
  const ringColor = isPlayer ? 'border-gold-500/60' : 'border-jade-500/60';
  const initial = speaker.charAt(0).toUpperCase();

  return (
    <div className={`my-4 flex w-full flex-col ${align}`}>
      <div
        className="flex items-start gap-3"
        style={{ flexDirection: isPlayer ? 'row-reverse' : 'row' }}
      >
        {/* Avatar circle */}
        <div
          className={`h-11 w-11 flex-shrink-0 rounded-full border p-[2px] shadow-md ${ringColor}`}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-ink-900">
            <span className={`text-sm font-bold ${nameColor}`}>{initial}</span>
          </div>
        </div>

        <div className="max-w-[85%] flex-grow">
          <p
            className={`mb-1.5 text-xs font-bold uppercase tracking-widest opacity-90 ${nameColor} ${isPlayer ? 'text-right' : 'text-left'}`}
          >
            {speaker}
          </p>
          <div
            className={`border px-4 py-3 text-sm leading-relaxed text-gold-200 backdrop-blur-md ${bubble}`}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};
