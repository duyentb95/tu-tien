import { useState } from 'react';
import { useGameStore, selectEconomy } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { CURRENCY_PACKS, EXCHANGE_OPTIONS, formatVnd } from '@data/store-packs';
import { notify } from '@state/notifications';
import { MomoPaymentModal } from './MomoPaymentModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

type TabKey = 'store' | 'exchange' | 'referral' | 'coupon' | 'history';

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'store', label: 'Cửa Hàng', icon: '◭' },
  { key: 'exchange', label: 'Tiêu Tiền Ngọc', icon: '⚒' },
  { key: 'referral', label: 'Giới Thiệu Bạn', icon: '✦' },
  { key: 'coupon', label: 'Mã Khuyến Mãi', icon: '◍' },
  { key: 'history', label: 'Lịch Sử', icon: '☰' },
];

const KIND_LABEL: Record<string, { label: string; color: string }> = {
  topup:    { label: 'Nạp MoMo',     color: 'text-jade-300' },
  mock:     { label: 'Nạp (mock)',   color: 'text-jade-500' },
  coupon:   { label: 'Mã khuyến mãi', color: 'text-spirit-300' },
  referral: { label: 'Giới thiệu',   color: 'text-gold-300' },
  exchange: { label: 'Tiêu',         color: 'text-ember-300' },
};

const formatTime = (ms: number): string => {
  const d = new Date(ms);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Phase 15.3: Monetization Hub — 4-tab modal.
 *
 *  - Cửa Hàng: 5 currency packs, mock payment "Sắp triển khai"
 *  - Tiêu Tiền Ngọc: 8 exchange options (tokens / perks / boosts)
 *  - Giới Thiệu Bạn: hiện code + share, đầu game nhập code
 *  - Mã Khuyến Mãi: input redeem code (admin/marketing distribute)
 */
export const MonetizationModal = ({ open, onClose }: Props) => {
  const economy = useGameStore(selectEconomy);
  const turn = useGameStore((s) => s.turn);
  const purchaseExchange = useGameStore((s) => s.purchaseExchange);
  const redeemCoupon = useGameStore((s) => s.redeemCoupon);
  const applyReferral = useGameStore((s) => s.applyReferral);
  const mockBuyPack = useGameStore((s) => s.mockBuyPack);
  const startMomoPayment = useGameStore((s) => s.startMomoPayment);
  const env = import.meta.env as Record<string, string | undefined>;
  const hasMomoBackend = !!(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);

  const [tab, setTab] = useState<TabKey>('store');
  const [couponInput, setCouponInput] = useState('');
  const [referralInput, setReferralInput] = useState('');
  // Phase 22.UX: loading + inline feedback state cho coupon/referral
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ kind: 'ok' | 'err' | 'warn'; text: string } | null>(null);
  const [referralBusy, setReferralBusy] = useState(false);
  const [referralMsg, setReferralMsg] = useState<{ kind: 'ok' | 'err' | 'warn'; text: string } | null>(null);

  if (!open) return null;

  const handleCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      setCouponMsg({ kind: 'warn', text: 'Vui lòng nhập mã trước khi đổi.' });
      return;
    }
    setCouponBusy(true);
    setCouponMsg(null);
    try {
      const r = await redeemCoupon(code);
      if (r.ok) {
        setCouponInput('');
        setCouponMsg({ kind: 'ok', text: r.message ?? `✓ Đổi thành công mã ${code.toUpperCase()}!` });
      } else {
        // Detect "đã sử dụng" → warn vàng, else err đỏ
        const isUsed = /đã sử dụng|đã đổi|đã được/i.test(r.message);
        setCouponMsg({ kind: isUsed ? 'warn' : 'err', text: r.message ?? 'Mã không hợp lệ hoặc đã hết hạn.' });
      }
    } catch (err) {
      setCouponMsg({ kind: 'err', text: `Lỗi mạng — ${(err as Error).message || 'thử lại sau'}` });
    } finally {
      setCouponBusy(false);
    }
  };
  const handleReferral = async () => {
    const code = referralInput.trim();
    if (!code) {
      setReferralMsg({ kind: 'warn', text: 'Vui lòng nhập mã giới thiệu.' });
      return;
    }
    setReferralBusy(true);
    setReferralMsg(null);
    try {
      const r = await applyReferral(code);
      if (r.ok) {
        setReferralInput('');
        setReferralMsg({ kind: 'ok', text: r.message ?? '✓ Đã áp dụng mã giới thiệu!' });
      } else {
        const isUsed = /đã sử dụng|đã áp dụng/i.test(r.message);
        setReferralMsg({ kind: isUsed ? 'warn' : 'err', text: r.message ?? 'Mã không hợp lệ.' });
      }
    } catch (err) {
      setReferralMsg({ kind: 'err', text: `Lỗi mạng — ${(err as Error).message || 'thử lại sau'}` });
    } finally {
      setReferralBusy(false);
    }
  };
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(economy.referralCode);
    notify.success('Đã sao chép', `Mã: ${economy.referralCode}`);
  };
  const handleShareReferral = () => {
    const url = window.location.origin;
    const text = `Cùng tu tiên trong Mặc Hội Tiên Đồ! Dùng mã ${economy.referralCode} khi tạo nhân vật để cả 2 nhận quà.\n${url}`;
    if (navigator.share) {
      navigator.share({ title: 'Mặc Hội Tiên Đồ', text, url }).catch(() => { /* user cancel */ });
    } else {
      navigator.clipboard.writeText(text);
      notify.success('Đã sao chép tin nhắn', 'Dán đâu đó để chia sẻ với bạn bè!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Cửa hàng Tiền Ngọc"
    >
      <div className="w-full max-w-3xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <Bracketed className="flex max-h-[88vh] flex-col rounded-md border bg-ink-700 p-5 sm:p-6" tone="gold">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between border-b border-gold-700/30 pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold tracking-wide text-gold-200">
                <span aria-hidden>💎</span> Tàng Bảo Các
              </h2>
              <p className="mt-1 text-[12px] italic text-jade-400">
                Cửa hàng Tiền Ngọc · Đổi quà · Mời bạn · Mã khuyến mãi
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-widest text-jade-500 hover:text-gold-300"
            >
              × Đóng
            </button>
          </div>

          {/* Currency balance bar */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded border border-gold-500/40 bg-gold-900/20 px-3 py-2">
              <div className="text-[10px] uppercase tracking-widest text-jade-500">Tiền Ngọc</div>
              <div className="font-mono text-lg font-bold text-gold-200">
                💎 {economy.tienNgoc.toLocaleString()}
              </div>
            </div>
            <div className="rounded border border-spirit-500/40 bg-spirit-900/20 px-3 py-2">
              <div className="text-[10px] uppercase tracking-widest text-jade-500">Lượt Hành Động</div>
              <div className="font-mono text-lg font-bold text-spirit-200">
                ⚡ {economy.actionTokens}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-3 flex flex-shrink-0 border-b border-gold-700/30">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 px-2 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  tab === t.key
                    ? 'border-b-2 border-gold-500 bg-gold-900/10 text-gold-200'
                    : 'border-b border-transparent text-jade-500 hover:text-gold-300'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="custom-scroll flex-grow overflow-y-auto pr-1">
            {/* TAB: Store */}
            {tab === 'store' && (
              <div>
                {hasMomoBackend ? (
                  <div className="mb-3 rounded border border-jade-500/40 bg-jade-900/20 p-2.5 text-[12px] text-jade-200">
                    ✓ <strong>Thanh toán MoMo đang hoạt động.</strong> Sau khi chuyển khoản, đợi admin xác nhận ~1-5 phút,
                    Tiền Ngọc tự cộng. Sai memo = phải liên hệ hỗ trợ.
                  </div>
                ) : (
                  <div className="mb-3 rounded border border-ember-500/40 bg-ember-900/20 p-2.5 text-[12px] text-ember-200">
                    ⚠ <strong>Backend chưa config — chỉ mock cộng currency cho test.</strong> Production wire VITE_FIREBASE_* env.
                  </div>
                )}
                <div className="grid gap-2 sm:grid-cols-2">
                  {CURRENCY_PACKS.map((pack) => {
                    const total = pack.amount + pack.bonus;
                    const tierColor = pack.tier === 'whale' ? 'border-ember-500/50 bg-ember-900/20'
                      : pack.tier === 'premium' ? 'border-gold-500/50 bg-gold-900/20'
                      : pack.tier === 'standard' ? 'border-spirit-500/40 bg-spirit-900/15'
                      : 'border-jade-500/40 bg-jade-900/10';
                    return (
                      <div key={pack.id} className={`rounded border ${tierColor} p-3`}>
                        {pack.badge && (
                          <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-gold-400">
                            ★ {pack.badge}
                          </div>
                        )}
                        <div className="font-serif text-lg text-gold-200">
                          💎 {pack.amount.toLocaleString()}
                          {pack.bonus > 0 && (
                            <span className="ml-1 text-[12px] text-jade-400">+ {pack.bonus} bonus</span>
                          )}
                        </div>
                        <div className="text-[11px] text-jade-400 mb-2">{pack.description}</div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[14px] font-bold text-gold-300">
                            {formatVnd(pack.priceVnd)}
                          </span>
                          <button
                            onClick={() => {
                              if (hasMomoBackend) startMomoPayment(pack.id);
                              else mockBuyPack(pack.id);
                            }}
                            className="rounded border border-gold-500/50 bg-gold-900/30 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold-200 hover:bg-gold-700/30"
                          >
                            {hasMomoBackend ? '◭ Mua bằng MoMo' : 'Mua (mock)'}
                          </button>
                        </div>
                        <div className="mt-1 text-right text-[9px] italic text-jade-600">
                          = {total.toLocaleString()} TN
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: Exchange */}
            {tab === 'exchange' && (
              <div className="space-y-2">
                {EXCHANGE_OPTIONS.map((opt) => {
                  const perkKey = opt.effect === 'speed_boost_unlock' ? 'speedBoost'
                    : opt.effect === 'unlimited_custom_rules' ? 'unlimitedCustomRules'
                    : opt.effect === 'extra_save_slots' ? 'extraSaveSlots' : null;
                  const owned = opt.kind === 'oneTime' && perkKey ? !!economy.unlockedPerks[perkKey] : false;
                  const canAfford = economy.tienNgoc >= opt.cost;
                  return (
                    <div
                      key={opt.id}
                      className={`rounded border px-3 py-2 ${
                        owned ? 'border-jade-500/40 bg-jade-900/20'
                          : canAfford ? 'border-gold-700/30 bg-ink-900/40 hover:bg-ink-500/30'
                          : 'border-gold-700/20 bg-ink-900/30 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{opt.icon}</span>
                            <span className="font-serif text-[13px] font-medium text-gold-200">{opt.label}</span>
                            {owned && <span className="rounded-sm border border-jade-500/40 px-1 py-0.5 text-[9px] font-bold uppercase tracking-widest text-jade-300">Đã mở</span>}
                            {opt.kind === 'oneTime' && !owned && (
                              <span className="rounded-sm border border-spirit-500/40 px-1 py-0.5 text-[9px] font-bold uppercase tracking-widest text-spirit-400">Vĩnh viễn</span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] italic text-jade-400">{opt.description}</p>
                        </div>
                        <button
                          onClick={() => purchaseExchange(opt.effect)}
                          disabled={owned || !canAfford}
                          className="flex-shrink-0 rounded border border-gold-500/40 bg-gold-900/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-gold-300 hover:bg-gold-900/40 disabled:cursor-not-allowed disabled:opacity-40"
                          title={!canAfford ? `Cần ${opt.cost} TN (có ${economy.tienNgoc})` : ''}
                        >
                          💎 {opt.cost}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB: Referral */}
            {tab === 'referral' && (
              <div className="space-y-4">
                <div className="rounded border border-spirit-500/40 bg-spirit-900/20 p-4 text-center">
                  <div className="text-[11px] uppercase tracking-widest text-jade-500 mb-2">Mã giới thiệu của ngươi</div>
                  <div className="font-mono text-3xl font-bold text-spirit-200 tracking-widest mb-3">
                    {economy.referralCode}
                  </div>
                  <div className="flex justify-center gap-2">
                    <button onClick={handleCopyReferral} className="rounded border border-spirit-500/40 bg-spirit-900/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-spirit-200 hover:bg-spirit-900/50">
                      📋 Sao chép
                    </button>
                    <button onClick={handleShareReferral} className="rounded border border-gold-500/40 bg-gold-900/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-gold-200 hover:bg-gold-900/50">
                      ✦ Chia sẻ
                    </button>
                  </div>
                  <p className="mt-3 text-[11px] text-jade-400">
                    Bạn mới dùng mã: <strong className="text-gold-300">+200 Tiền Ngọc + 50 Lượt</strong> cho ngươi,
                    <strong className="text-spirit-300"> +100 Tiền Ngọc + 30 Lượt</strong> cho họ.
                  </p>
                  <p className="mt-1 text-[10px] italic text-jade-600">
                    Đã mời thành công: <strong className="text-gold-400">{economy.referredCount}</strong> bạn bè
                  </p>
                </div>

                {/* Input mã bạn được giới thiệu (chỉ user mới) */}
                <div className="rounded border border-gold-700/30 bg-ink-900/40 p-4">
                  <div className="label-gold mb-2">Nhập mã giới thiệu (chỉ tân thủ &lt; 5 lượt)</div>
                  {economy.referredBy ? (
                    <div className="text-[12px] text-jade-400">
                      ✓ Đã áp dụng mã: <strong className="font-mono text-gold-300">{economy.referredBy}</strong>
                    </div>
                  ) : turn > 5 ? (
                    <div className="text-[12px] italic text-jade-500">
                      Đã qua giai đoạn tân thủ. Mã giới thiệu chỉ áp dụng được lúc mới bắt đầu.
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          value={referralInput}
                          onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && !referralBusy && handleReferral()}
                          placeholder="VD: ABC12XYZ"
                          disabled={referralBusy}
                          className="flex-1 rounded-sm border border-gold-700/40 bg-ink-800 px-3 py-2 font-mono text-sm text-gold-100 uppercase tracking-widest placeholder:text-jade-700 focus:border-gold-500 focus:outline-none disabled:opacity-50"
                          maxLength={12}
                        />
                        <button
                          onClick={handleReferral}
                          disabled={referralBusy || !referralInput.trim()}
                          className="min-w-[110px] rounded border border-gold-500/40 bg-gold-900/30 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-gold-200 hover:bg-gold-900/50 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {referralBusy ? (
                            <>
                              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gold-300 border-t-transparent" />
                              Đang gửi…
                            </>
                          ) : 'Áp dụng'}
                        </button>
                      </div>
                      {referralMsg && (
                        <div
                          className={`mt-2 rounded border px-2.5 py-1.5 text-[11px] ${
                            referralMsg.kind === 'ok'
                              ? 'border-jade-500/50 bg-jade-900/20 text-jade-200'
                              : referralMsg.kind === 'warn'
                              ? 'border-ember-500/40 bg-ember-900/15 text-ember-200'
                              : 'border-ember-500/60 bg-ember-900/25 text-ember-100'
                          }`}
                        >
                          {referralMsg.kind === 'ok' ? '✓ ' : referralMsg.kind === 'warn' ? '⚠ ' : '✗ '}
                          {referralMsg.text}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Coupon */}
            {tab === 'coupon' && (
              <div className="space-y-4">
                <div className="rounded border border-spirit-500/40 bg-spirit-900/15 p-4">
                  <div className="label-gold mb-2">Nhập mã khuyến mãi</div>
                  <p className="mb-3 text-[11px] italic text-jade-400">
                    Mã được phát qua sự kiện cộng đồng, fanpage, livestream... Nhập 1 lần / thiết bị.
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && !couponBusy && handleCoupon()}
                      placeholder="VD: TANTHU"
                      disabled={couponBusy}
                      className="flex-1 rounded-sm border border-gold-700/40 bg-ink-800 px-3 py-2 font-mono text-sm text-gold-100 uppercase tracking-widest placeholder:text-jade-700 focus:border-gold-500 focus:outline-none disabled:opacity-50"
                      maxLength={20}
                    />
                    <button
                      onClick={handleCoupon}
                      disabled={couponBusy || !couponInput.trim()}
                      className="min-w-[120px] rounded border border-spirit-500/40 bg-spirit-900/30 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-spirit-200 hover:bg-spirit-900/50 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {couponBusy ? (
                        <>
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-spirit-300 border-t-transparent" />
                          Đang đổi…
                        </>
                      ) : 'Đổi thưởng'}
                    </button>
                  </div>
                  {couponMsg && (
                    <div
                      className={`mt-2 rounded border px-2.5 py-1.5 text-[12px] ${
                        couponMsg.kind === 'ok'
                          ? 'border-jade-500/50 bg-jade-900/20 text-jade-100'
                          : couponMsg.kind === 'warn'
                          ? 'border-ember-500/40 bg-ember-900/15 text-ember-100'
                          : 'border-ember-500/60 bg-ember-900/25 text-ember-100'
                      }`}
                    >
                      {couponMsg.kind === 'ok' ? '✓ ' : couponMsg.kind === 'warn' ? '⚠ ' : '✗ '}
                      {couponMsg.text}
                    </div>
                  )}
                </div>

                {economy.redeemedCoupons.length > 0 && (
                  <div className="rounded border border-gold-700/30 bg-ink-900/40 p-3">
                    <div className="label-section mb-2">Mã đã đổi ({economy.redeemedCoupons.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {economy.redeemedCoupons.map((c) => (
                        <span key={c} className="rounded border border-gold-700/30 bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-jade-400">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded border border-jade-700/30 bg-jade-900/10 p-2.5 text-[11px] text-jade-300">
                  💡 Theo dõi <strong className="text-gold-300">fanpage Mặc Hội Tiên Đồ</strong> để nhận mã mới qua các sự kiện.
                </div>
              </div>
            )}

            {/* TAB: Lịch Sử — Phase 23.UX */}
            {tab === 'history' && (() => {
              const history = economy.purchaseHistory ?? [];
              const totalIn = history.filter((h) => h.delta > 0).reduce((s, h) => s + h.delta, 0);
              const totalOut = -history.filter((h) => h.delta < 0).reduce((s, h) => s + h.delta, 0);
              const totalVnd = history
                .filter((h) => h.kind === 'topup' && h.amountVnd)
                .reduce((s, h) => s + (h.amountVnd ?? 0), 0);
              return (
                <div className="space-y-3">
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded border border-jade-700/30 bg-jade-900/15 p-2.5 text-center">
                      <div className="text-[10px] uppercase text-jade-500 tracking-widest">Tổng nạp</div>
                      <div className="font-mono text-sm text-jade-200">{formatVnd(totalVnd)}</div>
                    </div>
                    <div className="rounded border border-gold-700/30 bg-gold-900/15 p-2.5 text-center">
                      <div className="text-[10px] uppercase text-gold-500 tracking-widest">Đã nhận TN</div>
                      <div className="font-mono text-sm text-gold-200">+{totalIn.toLocaleString()} 💎</div>
                    </div>
                    <div className="rounded border border-ember-700/30 bg-ember-900/15 p-2.5 text-center">
                      <div className="text-[10px] uppercase text-ember-500 tracking-widest">Đã tiêu TN</div>
                      <div className="font-mono text-sm text-ember-200">-{totalOut.toLocaleString()} 💎</div>
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="rounded border border-spirit-700/20 bg-spirit-900/10 px-2.5 py-1.5 text-[11px] italic text-jade-400">
                    Lịch sử lưu tại thiết bị (100 giao dịch gần nhất). Xóa save → mất lịch sử. Nếu có khiếu nại nạp MoMo không thành công, gửi <strong className="text-spirit-300">memo + ảnh chuyển khoản</strong> cho admin.
                  </div>

                  {/* List */}
                  {history.length === 0 ? (
                    <div className="rounded border border-gold-700/20 bg-ink-900/40 p-6 text-center">
                      <div className="text-3xl mb-2 text-jade-700">📜</div>
                      <p className="text-[12px] text-jade-400">
                        Chưa có giao dịch nào. Nạp MoMo / đổi mã / mua perks để xem ghi nhận ở đây.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[480px] overflow-y-auto rounded border border-gold-700/20 bg-ink-900/30">
                      <table className="w-full text-[12px]">
                        <thead className="sticky top-0 bg-ink-800 text-[10px] uppercase tracking-widest text-jade-500">
                          <tr>
                            <th className="px-2 py-1.5 text-left">Thời gian</th>
                            <th className="px-2 py-1.5 text-left">Loại</th>
                            <th className="px-2 py-1.5 text-left">Nội dung</th>
                            <th className="px-2 py-1.5 text-right">Tiền Ngọc</th>
                            <th className="px-2 py-1.5 text-right">VND</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((h) => {
                            const meta = KIND_LABEL[h.kind] ?? { label: h.kind, color: 'text-jade-400' };
                            return (
                              <tr key={h.id} className="border-t border-gold-700/10 hover:bg-ink-800/40">
                                <td className="px-2 py-1.5 font-mono text-jade-400 whitespace-nowrap">{formatTime(h.at)}</td>
                                <td className={`px-2 py-1.5 whitespace-nowrap ${meta.color}`}>{meta.label}</td>
                                <td className="px-2 py-1.5 text-gold-300" title={h.refId ?? ''}>{h.title}</td>
                                <td className={`px-2 py-1.5 text-right font-mono whitespace-nowrap ${h.delta > 0 ? 'text-leaf-400' : h.delta < 0 ? 'text-ember-400' : 'text-jade-500'}`}>
                                  {h.delta > 0 ? '+' : ''}{h.delta.toLocaleString()}
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono text-jade-300 whitespace-nowrap">
                                  {h.amountVnd ? formatVnd(h.amountVnd) : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </Bracketed>
      </div>

      {/* Phase 18: MoMo payment sub-modal (tự render khi paymentIntent != null) */}
      <MomoPaymentModal />
    </div>
  );
};
