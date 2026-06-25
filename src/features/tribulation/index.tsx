import { useState } from 'react';
import { useGameStore } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { notify } from '@state/notifications';
import { LottiePlayer } from '@shared/components/LottiePlayer';
import lightningBolt from '@/lottie/lightning-bolt.json';
import breakthroughVortex from '@/lottie/breakthrough-vortex.json';

/**
 * TribulationScreen — Độ Kiếp · Lôi Cảnh
 * 9 đạo lôi, mỗi đạo có tỉ lệ thành công.
 * Action buttons: Vận Công Kháng Lôi (free) / Dùng Bùa (-30% chance fail) / Cầu Khẩn (-50% fail)
 */

interface BoltState {
  index: number;
  status: 'pending' | 'success' | 'failed' | 'active';
}

const INITIAL_BOLTS: BoltState[] = Array.from({ length: 9 }, (_, i) => ({
  index: i + 1,
  status: i === 0 ? 'active' : 'pending',
}));

export const TribulationScreen = () => {
  const setStage = useGameStore((s) => s.setStage);
  const player = useGameStore((s) => s.player);
  const tribCtx = useGameStore((s) => s.tribulationContext);
  const [bolts, setBolts] = useState<BoltState[]>(INITIAL_BOLTS);
  const [successRate, setSuccessRate] = useState(68);
  const [hp, setHp] = useState(player?.finalStats.hp ?? 8432);
  const [finished, setFinished] = useState<'win' | 'lose' | null>(null);
  const maxHp = player?.finalStats.maxhp ?? 12000;

  const successCount = bolts.filter((b) => b.status === 'success').length;
  const totalBolts = bolts.length;
  const activeIdx = bolts.findIndex((b) => b.status === 'active');

  const runBolt = (chanceBonus: number, hpCost = 0) => {
    if (finished || activeIdx === -1) return;
    const roll = Math.random() * 100;
    const success = roll < successRate + chanceBonus;
    const damage = success ? Math.round(maxHp * 0.05) : Math.round(maxHp * 0.18);

    const newBolts = [...bolts];
    newBolts[activeIdx] = { ...newBolts[activeIdx]!, status: success ? 'success' : 'failed' };
    if (activeIdx < totalBolts - 1) {
      newBolts[activeIdx + 1] = { ...newBolts[activeIdx + 1]!, status: 'active' };
    }
    setBolts(newBolts);

    const newHp = Math.max(0, hp - damage - hpCost);
    setHp(newHp);

    if (success) {
      notify.success(`Đạo ${activeIdx + 1} qua!`, `−${damage} HP`);
    } else {
      notify.warn(`Đạo ${activeIdx + 1} thất bại!`, `−${damage} HP`);
    }

    setSuccessRate((r) => Math.max(20, r - 4));

    if (newHp <= 0) {
      setFinished('lose');
      notify.warn('Độ kiếp thất bại', 'Ngươi bị thiên lôi đánh ngã. Trọng thương!');
    } else if (activeIdx === totalBolts - 1) {
      const allSuccess = newBolts.filter((b) => b.status === 'success').length;
      if (allSuccess >= 5) {
        setFinished('win');
        notify.epic('Độ kiếp thành công!', `Vượt ${allSuccess}/${totalBolts} đạo lôi. Tu vi tăng vọt!`);
      } else {
        setFinished('lose');
        notify.warn('Độ kiếp thất bại', `Chỉ qua ${allSuccess}/${totalBolts} đạo. Tâm cảnh tổn hại.`);
      }
    }
  };

  const exitTribulation = () => {
    if (finished === 'win' && player) {
      // Apply rewards
      useGameStore.setState((s) => {
        if (!s.player) return;
        s.player.baseStats.baseHp += 200;
        s.player.baseStats.baseAtk += 30;
        s.player.baseStats.baseDef += 20;
        s.player.ap += 10;
        s.player.finalStats.maxhp = s.player.baseStats.baseHp;
        s.player.finalStats.hp = s.player.finalStats.maxhp;
        s.player.finalStats.atk = s.player.baseStats.baseAtk;
        s.player.finalStats.def = s.player.baseStats.baseDef;
        s.tribulationContext = null;
      });
    } else if (finished === 'lose' && player) {
      useGameStore.setState((s) => {
        if (!s.player) return;
        s.player.finalStats.hp = Math.max(1, Math.floor(s.player.finalStats.maxhp * 0.15));
        s.player.longTermStatuses.push({
          id: 'TRONG_THUONG',
          name: 'Trọng Thương',
          type: 'injury',
          description: 'Tổn hại sau độ kiếp thất bại.',
          stats: 'atk_amp:-60,def_amp:-60,spd_amp:-60',
        });
        s.tribulationContext = null;
      });
    }
    setStage('playing');
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(167,139,250,.15) 0%, rgba(26,20,34,.4) 35%, transparent 70%), radial-gradient(ellipse at center bottom, rgba(224,101,78,.1) 0%, transparent 60%)',
        }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[10, 30, 55, 75, 90].map((left, i) => (
          <div
            key={i}
            className="absolute top-0"
            style={{
              left: `calc(${left}% - 50px)`,
              width: 100,
              height: '70vh',
              opacity: 0.85,
              animationDelay: `${i * 0.55}s`,
            }}
          >
            <LottiePlayer animationData={lightningBolt} loop speed={1 + (i % 3) * 0.15} />
          </div>
        ))}
      </div>

      {/* Breakthrough vortex overlay khi win */}
      {finished === 'win' && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        >
          <div style={{ width: 'min(80vw, 600px)', height: 'min(80vw, 600px)' }}>
            <LottiePlayer animationData={breakthroughVortex} loop={false} />
          </div>
        </div>
      )}

      <header className="relative z-10 mx-auto mb-6 max-w-6xl text-center">
        <div className="label-section anim-pulse mb-2">Độ Kiếp · Lôi Cảnh</div>
        <h1
          className="font-serif text-[38px] font-bold text-spirit-200"
          style={{ textShadow: '0 0 24px rgba(167,139,250,.6)' }}
        >
          Thiên địa vô tình
        </h1>
        <p className="mt-2 font-serif italic text-gold-300/80">
          {tribCtx?.reason ?? 'Cửu Tiêu Lôi Kiếp · Đại đột phá cảnh giới'}
        </p>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          <Bracketed
            tone="spirit"
            className="relative h-72 overflow-hidden rounded-md border bg-gradient-to-b from-void-900 to-ink-900"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div
                  className="absolute -inset-12 anim-ring rounded-full border"
                  style={{ borderColor: 'rgba(167,139,250,.6)' }}
                />
                <div
                  className="absolute -inset-8 anim-ring rounded-full border"
                  style={{ borderColor: 'rgba(167,139,250,.6)', animationDelay: '0.7s' }}
                />
                <div
                  className="anim-glow h-32 w-32 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, var(--spirit-300) 0%, var(--spirit-500) 40%, transparent 75%)',
                  }}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center font-serif text-[15px] text-spirit-200"
                  style={{ textShadow: '0 0 12px rgba(205,164,94,.7)' }}
                >
                  ⚝
                </div>
              </div>
            </div>
          </Bracketed>

          <Bracketed className="rounded-md border bg-ink-700 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="label-gold">Cửu Tiêu Lôi Kiếp · 9 Đạo</div>
              <div className="text-[12px] text-jade-300">
                Đã qua{' '}
                <span className="font-mono text-gold-200">
                  {successCount}/{totalBolts}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-9 gap-2">
              {bolts.map((b) => (
                <BoltIndicator key={b.index} bolt={b} />
              ))}
            </div>
          </Bracketed>

          <Bracketed className="rounded-md border bg-ink-700 p-4">
            <div className="label-section mb-3">Hành Động · Đạo lôi {activeIdx + 1 || '-'}</div>
            {finished ? (
              <button onClick={exitTribulation} className="btn-primary w-full text-[14px]">
                {finished === 'win' ? '✦ Nhận Phần Thưởng' : 'Trở về điều dưỡng'}
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button onClick={() => runBolt(0)} className="btn-primary text-[14px]">
                  Vận Công Kháng Lôi
                </button>
                <button onClick={() => runBolt(15)} className="btn-secondary text-[14px]">
                  Dùng Bùa Hộ Mệnh (+15%)
                </button>
                <button onClick={() => runBolt(30, 200)} className="btn-jade text-[14px]">
                  Cầu Khẩn Sư Tổ (+30%)
                </button>
              </div>
            )}
          </Bracketed>
        </div>

        <div className="flex flex-col gap-4">
          <Bracketed tone="ember" className="rounded-md border bg-ink-700 p-5">
            <div className="label-section mb-2">Tỉ Lệ Thành Công</div>
            <div
              className="font-serif text-[44px] font-bold leading-none anim-pulse"
              style={{
                color: successRate > 50 ? 'var(--gold-150)' : 'var(--ember-500)',
                textShadow: '0 0 20px rgba(240,189,114,.45)',
              }}
            >
              {successRate}%
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-800">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${successRate}%`,
                  background: 'linear-gradient(90deg, var(--ember-500), var(--gold-150))',
                }}
              />
            </div>
            <div className="mt-3 text-[12px] text-jade-300">
              Mỗi đạo qua đi · Tỉ lệ giảm 4%
            </div>
          </Bracketed>

          <Bracketed tone="ember" className="rounded-md border bg-ink-700 p-4">
            <div className="mb-2 flex justify-between text-[13px]">
              <span className="text-gold-300">Sinh Lực</span>
              <span className="font-mono text-ember-500">
                <span className="anim-pulse inline-block">{hp.toLocaleString()}</span> / {maxHp.toLocaleString()}
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-ink-800">
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${(hp / maxHp) * 100}%`,
                  background: 'linear-gradient(90deg, var(--blood-500), var(--ember-500))',
                }}
              />
              <div
                className="absolute inset-y-0 w-16 opacity-60 anim-sweep"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent)',
                }}
              />
            </div>
          </Bracketed>

          <Bracketed tone="jade" className="rounded-md border bg-ink-700 p-4">
            <div className="label-section mb-2">Đạo tâm của ngươi</div>
            <p className="font-serif text-[13.5px] italic leading-relaxed text-gold-300">
              "Trên đại đạo, ta đã đi quá xa để quay lại. Thiên kiếp giáng lâm, chỉ có thể nghênh đón."
            </p>
          </Bracketed>

          {!finished && (
            <button onClick={() => setStage('playing')} className="btn-jade text-[14px]">
              ← Tạm lùi một bước (hủy)
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

const BoltIndicator = ({ bolt }: { bolt: BoltState }) => {
  const colors = {
    success: { bg: 'rgba(143,201,140,.15)', border: 'rgba(143,201,140,.5)', dot: '#8fc98c' },
    failed: { bg: 'rgba(138,47,47,.18)', border: 'rgba(138,47,47,.6)', dot: '#8a2f2f' },
    active: { bg: 'rgba(167,139,250,.18)', border: 'rgba(167,139,250,.8)', dot: '#a78bfa' },
    pending: { bg: 'transparent', border: 'rgba(205,164,94,.18)', dot: 'transparent' },
  };
  const c = colors[bolt.status];

  return (
    <div
      className={`flex h-12 flex-col items-center justify-center rounded-sm border ${
        bolt.status === 'active' ? 'anim-pulse' : ''
      }`}
      style={{ background: c.bg, borderColor: c.border }}
    >
      <span className="text-[10px] text-jade-500">Đạo</span>
      <span
        className="font-mono text-[14px] font-bold"
        style={{ color: c.dot === 'transparent' ? 'var(--jade-700)' : c.dot }}
      >
        {bolt.index}
      </span>
    </div>
  );
};
