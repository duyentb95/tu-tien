/**
 * Phase 18.3: MoMo Payment Modal — hiện QR + deeplink + countdown 15min.
 *
 * Flow:
 *   1. Pack click → store.startMomoPayment(packId) → economy.paymentIntent populate
 *   2. Modal này tự mount khi paymentIntent !== null
 *   3. Hiện QR (qrserver.com render từ momoDeeplink) + memo + countdown
 *   4. Mobile: button "Mở MoMo" deeplink; Desktop: scan QR
 *   5. Poll status mỗi 3s — khi approved/expired/rejected, action tự handle + clear intent
 *   6. User có thể "Hủy" để clear intent
 */
import { useEffect, useState } from 'react';
import { useGameStore } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { formatVnd } from '@data/store-packs';

export const MomoPaymentModal = () => {
  const intent = useGameStore((s) => s.economy.paymentIntent);
  const pollMomoPayment = useGameStore((s) => s.pollMomoPayment);
  const cancelMomoPayment = useGameStore((s) => s.cancelMomoPayment);
  const [now, setNow] = useState(Date.now());
  const [polling, setPolling] = useState(false);

  // Tick countdown + auto-poll mỗi 3s
  useEffect(() => {
    if (!intent) return;
    const tickInterval = setInterval(() => setNow(Date.now()), 1000);
    const pollInterval = setInterval(async () => {
      setPolling(true);
      await pollMomoPayment();
      setPolling(false);
    }, 3000);
    return () => {
      clearInterval(tickInterval);
      clearInterval(pollInterval);
    };
  }, [intent, pollMomoPayment]);

  if (!intent) return null;

  const remainingMs = Math.max(0, intent.expiresAt - now);
  const min = Math.floor(remainingMs / 60000);
  const sec = Math.floor((remainingMs % 60000) / 1000);
  const countdownStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  const expired = remainingMs <= 0 || intent.status === 'expired';

  // Render QR qua qrserver.com (free, public, không cần API key)
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    intent.momoDeeplink,
  )}`;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <Bracketed tone="gold" className="relative w-full max-w-md bg-ink-900/95 p-5">
        {/* Header */}
        <div className="mb-3 text-center">
          <h2 className="font-serif text-2xl text-gold-300">
            ✦ Thanh toán MoMo ✦
          </h2>
          <p className="mt-1 text-[11px] tracking-widest text-jade-400 uppercase">
            Cảnh giới chuyển khoản
          </p>
        </div>

        {/* Pack info */}
        <div className="mb-3 rounded border border-gold-500/40 bg-gold-900/15 p-3 text-center">
          <div className="font-mono text-2xl font-bold text-gold-200">
            {formatVnd(intent.amount)}
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-widest text-jade-400">
            Gói: {intent.packId}
          </div>
        </div>

        {/* QR */}
        <div className="mb-3 flex flex-col items-center">
          <div className="rounded border border-gold-500/40 bg-white p-2">
            <img
              src={qrSrc}
              alt="MoMo QR"
              width={240}
              height={240}
              className="block"
            />
          </div>
          <p className="mt-2 text-center text-[10px] text-jade-300">
            Mở MoMo → Quét QR → tự động điền số tiền + nội dung
          </p>
        </div>

        {/* Memo — quan trọng nhất, user phải nhập đúng */}
        <div className="mb-3 rounded border-2 border-ember-500/60 bg-ember-900/25 p-3">
          <div className="text-center text-[10px] uppercase tracking-widest text-ember-300">
            ⚠ Nội dung chuyển khoản (BẮT BUỘC)
          </div>
          <div className="mt-1 text-center font-mono text-xl font-bold text-ember-100 select-all">
            {intent.memo}
          </div>
          <div className="mt-1 text-center text-[10px] italic text-ember-400">
            Sai nội dung = không tự nhận, phải liên hệ hỗ trợ
          </div>
        </div>

        {/* Mobile deeplink button */}
        <a
          href={intent.momoDeeplink}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2 block w-full rounded border border-gold-500/60 bg-gradient-to-b from-gold-700 to-gold-900 px-4 py-2 text-center text-sm font-bold uppercase tracking-widest text-ink-900 hover:from-gold-600"
        >
          📱 Mở app MoMo
        </a>

        {/* Status + countdown */}
        <div className="mb-3 flex items-center justify-between rounded border border-spirit-500/30 bg-spirit-900/15 px-3 py-2">
          <div className="text-[11px] text-spirit-200">
            <span className="opacity-70">Trạng thái:</span>{' '}
            {intent.status === 'pending' && (
              <span className="text-spirit-300">
                {polling ? '⏳ Đang kiểm tra…' : 'Chờ admin xác nhận'}
              </span>
            )}
            {intent.status === 'approved' && (
              <span className="text-jade-300">✓ Đã duyệt</span>
            )}
            {expired && intent.status !== 'approved' && (
              <span className="text-ember-300">⏰ Hết hạn</span>
            )}
          </div>
          <div className="font-mono text-[14px] font-bold text-gold-300">
            {expired ? '00:00' : countdownStr}
          </div>
        </div>

        {/* Tip */}
        <div className="mb-3 rounded border border-jade-500/20 bg-jade-900/10 p-2 text-[10px] text-jade-300">
          <strong className="text-jade-200">Lưu ý:</strong> Sau khi chuyển khoản,
          ngươi vui lòng chờ ~1-5 phút để admin kiểm tra sao kê và phê duyệt.
          Reward sẽ tự cộng khi xác nhận xong. Không cần làm gì thêm.
        </div>

        {/* Cancel */}
        <button
          onClick={cancelMomoPayment}
          className="w-full rounded border border-ink-500 bg-ink-800 px-4 py-1.5 text-[11px] uppercase tracking-widest text-jade-400 hover:bg-ink-700"
        >
          Đóng / huỷ
        </button>

        <div className="mt-2 text-center text-[9px] italic text-jade-600">
          Intent ID: {intent.intentId.slice(0, 10)}…
        </div>
      </Bracketed>
    </div>
  );
};
