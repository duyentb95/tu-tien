import { useState } from 'react';
import { Button } from '@shared/components/Button';
import { TextInput } from '@shared/components/FormField';

interface Props {
  actions: string[];
  disabled: boolean;
  onSelect: (action: string) => void;
}

export const ActionPanel = ({ actions, disabled, onSelect }: Props) => {
  const [customInput, setCustomInput] = useState('');

  const submitCustom = () => {
    const val = customInput.trim();
    if (!val) return;
    onSelect(val);
    setCustomInput('');
  };

  return (
    <div className="panel-gold mt-4 p-4">
      {/* 4 action choices */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(action)}
            disabled={disabled}
            className="group flex items-start gap-2 rounded-md border border-gold-700/30 bg-ink-700/60 px-4 py-3 text-left text-sm text-gold-200 transition hover:border-gold-500 hover:bg-ink-500/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="font-mono text-xs text-gold-500 group-hover:text-gold-300">
              {idx + 1}.
            </span>
            <span className="leading-snug">{action}</span>
          </button>
        ))}
        {actions.length === 0 && (
          <p className="col-span-2 py-3 text-center text-sm italic text-jade-600">
            Chờ thiên cơ khai mở lựa chọn…
          </p>
        )}
      </div>

      {/* Custom input */}
      <div className="flex gap-2 border-t border-gold-700/20 pt-3">
        <TextInput
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !disabled) submitCustom();
          }}
          placeholder="Hoặc nhập hành động tự do…"
          disabled={disabled}
          className="flex-1"
        />
        <Button
          variant="secondary"
          onClick={submitCustom}
          disabled={disabled || !customInput.trim()}
        >
          Hành ✦
        </Button>
      </div>
    </div>
  );
};
