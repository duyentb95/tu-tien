import { useState } from 'react';
import { useGameStore } from '@state/game-store';
import { Button } from '@shared/components/Button';
import { FormField, TextInput, TextArea, Select } from '@shared/components/FormField';
import {
  PLAYER_PERSONALITIES,
  WRITING_STYLES,
  NARRATOR_PRONOUNS,
  GENDERS,
} from '@data/personalities';
import type { Difficulty } from '@data/difficulty';
import { shouldUseMockAi } from '@ai/mock';

const DIFFICULTIES: Difficulty[] = ['Dễ', 'Thường', 'Khó', 'Ác Mộng'];

export const GameSetupScreen = () => {
  const startNewGame = useGameStore((s) => s.startNewGame);
  const setStage = useGameStore((s) => s.setStage);
  const settings = useGameStore((s) => s.settings);

  // Khi user qua wizard fan-fic, _pendingChar được hydrate bởi analyzeFanFic
  const pendingChar = (settings as unknown as { _pendingChar?: {
    name: string; gender: string; personality: string; description: string;
  } })._pendingChar;

  const [characterName, setCharacterName] = useState(pendingChar?.name ?? '');
  const [gender, setGender] = useState<string>(
    pendingChar?.gender && (GENDERS as readonly string[]).includes(pendingChar.gender)
      ? pendingChar.gender
      : GENDERS[0],
  );
  const [personality, setPersonality] = useState<string>(
    pendingChar?.personality && (PLAYER_PERSONALITIES as readonly string[]).includes(pendingChar.personality)
      ? pendingChar.personality
      : PLAYER_PERSONALITIES[0],
  );
  const [description, setDescription] = useState(pendingChar?.description ?? '');
  const [storyTitle, setStoryTitle] = useState(settings.storyTitle ?? '');
  const [writingStyle, setWritingStyle] = useState<string>(WRITING_STYLES[0]);
  const [narratorPronoun, setNarratorPronoun] = useState<string>(NARRATOR_PRONOUNS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>('Thường');
  const [submitting, setSubmitting] = useState(false);

  const usingMock = shouldUseMockAi();

  const canStart = characterName.trim().length >= 2 && !submitting;

  const onStart = async () => {
    if (!canStart) return;
    setSubmitting(true);
    await startNewGame({
      characterName: characterName.trim(),
      gender,
      personality,
      description: description.trim(),
      settings: {
        storyTitle: storyTitle.trim() || 'Mặc Hội Tiên Đồ',
        writingStyle,
        narratorPronoun,
        difficulty,
      },
    });
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-celestial mb-2 text-3xl font-semibold">Khởi Tạo Đạo Hữu</h1>
          <p className="text-jade-400 italic">
            Mỗi linh hồn vào Mặc Đồ đều mang một số mệnh riêng.
          </p>
        </header>

        {usingMock && (
          <div className="mb-6 rounded-md border border-spirit-500/40 bg-void-900/50 px-4 py-3 text-sm text-spirit-200">
            <strong>Chế độ Mock:</strong> chưa cấu hình AI provider (cần ít nhất 1 trong:
            <code className="mx-1">VITE_AI_PROXY_URL</code>,
            <code className="mx-1">VITE_GEMINI_API_KEY</code>, hoặc
            <code className="mx-1">VITE_DEEPSEEK_API_KEY</code>). Game sẽ dùng kịch bản dựng sẵn (6 chunk).
          </div>
        )}

        <div className="panel-gold p-6 sm:p-8">
          {/* PHẦN 1: NHÂN VẬT */}
          <section className="mb-8">
            <h2 className="mb-4 border-b border-gold-700/30 pb-2 text-xl text-gold-200">
              ✦ Thân thế đạo hữu
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Tên nhân vật" required>
                <TextInput
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Vd: Lạc Vô Thường"
                  maxLength={40}
                />
              </FormField>
              <FormField label="Giới tính">
                <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Tính cách">
                <Select
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                >
                  {PLAYER_PERSONALITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Mô tả thêm" hint="Tùy chọn — ngoại hình, xuất thân, biệt danh...">
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Vd: Thân hình mảnh khảnh, mắt đào hoa, tay phải có vết sẹo hình rồng..."
                  rows={3}
                  maxLength={400}
                />
              </FormField>
            </div>
          </section>

          {/* PHẦN 2: THẾ GIỚI */}
          <section className="mb-8">
            <h2 className="mb-4 border-b border-gold-700/30 pb-2 text-xl text-gold-200">
              ✦ Bối cảnh thế giới
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Tựa truyện">
                <TextInput
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Mặc Hội Tiên Đồ"
                  maxLength={60}
                />
              </FormField>
              <FormField label="Độ khó">
                <Select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Phong cách văn">
                <Select
                  value={writingStyle}
                  onChange={(e) => setWritingStyle(e.target.value)}
                >
                  {WRITING_STYLES.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Cách xưng hô">
                <Select
                  value={narratorPronoun}
                  onChange={(e) => setNarratorPronoun(e.target.value)}
                >
                  {NARRATOR_PRONOUNS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          </section>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => setStage('initial')}>
              ← Quay lại
            </Button>
            <Button
              variant="primary"
              onClick={onStart}
              disabled={!canStart}
              className="min-w-[200px]"
            >
              {submitting ? 'Đang khai mở thiên cơ…' : 'Khởi Hành ✦'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};
