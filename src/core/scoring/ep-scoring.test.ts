import { describe, it, expect } from 'vitest';
import {
  getFarmMultiplier,
  countReasonRepetitions,
  convertEpToExp,
  calculateEpReward,
  MIN_EP_FOR_EXP_GAIN,
} from './ep-scoring';

describe('ep-scoring', () => {
  describe('getFarmMultiplier', () => {
    it('returns 1.0 cho 0 lần lặp', () => {
      expect(getFarmMultiplier(0)).toBe(1.0);
    });
    it('giảm theo bảng 0.7 / 0.4 / 0.1', () => {
      expect(getFarmMultiplier(1)).toBe(0.7);
      expect(getFarmMultiplier(2)).toBe(0.4);
      expect(getFarmMultiplier(3)).toBe(0.1);
      expect(getFarmMultiplier(5)).toBe(0.1);
    });
  });

  describe('countReasonRepetitions', () => {
    it('đếm case-insensitive + trim', () => {
      const reasons = ['Bế quan tu luyện', '  bế quan tu luyện ', 'Chạy bộ'];
      expect(countReasonRepetitions(reasons, 'BẾ QUAN TU LUYỆN')).toBe(2);
      expect(countReasonRepetitions(reasons, 'Chạy bộ')).toBe(1);
      expect(countReasonRepetitions(reasons, 'không có')).toBe(0);
    });
  });

  describe('convertEpToExp', () => {
    it('return 0 khi ep < threshold', () => {
      expect(convertEpToExp(MIN_EP_FOR_EXP_GAIN - 1, 5, 1000)).toBe(0);
    });
    it('basic + growth + breakthrough đúng công thức', () => {
      // ep=60, lvl=5, maxExp=1000
      // basic    = 60*2 = 120
      // growth   = (60/3)*5 = 100
      // ratio    = (0.6)^2 * 0.5 = 0.18
      // break    = 1000 * 0.18 = 180
      // total = floor(120+100+180) = 400
      expect(convertEpToExp(60, 5, 1000)).toBe(400);
    });
    it('ep cao → breakthrough tăng nhanh (square root)', () => {
      const low = convertEpToExp(30, 10, 1000);
      const mid = convertEpToExp(60, 10, 1000);
      const high = convertEpToExp(100, 10, 1000);
      // Breakthrough delta = max * (ep/100)² * 0.5
      // ep30 → 0.045, ep60 → 0.18, ep100 → 0.5 → tăng phi tuyến
      expect(mid - low).toBeGreaterThan(0);
      expect(high - mid).toBeGreaterThan(mid - low); // accel
    });
  });

  describe('calculateEpReward (full pipeline)', () => {
    it('lần đầu reason: multiplier=1, full EXP', () => {
      const r = calculateEpReward(60, 'Bế quan', [], 5, 1000);
      expect(r.multiplier).toBe(1.0);
      expect(r.finalEp).toBe(60);
      expect(r.expGain).toBe(400);
      expect(r.isFarmed).toBe(false);
    });

    it('lần thứ 2 cùng reason: multiplier=0.7', () => {
      const r = calculateEpReward(60, 'Bế quan', ['bế quan'], 5, 1000);
      expect(r.multiplier).toBe(0.7);
      expect(r.finalEp).toBe(42);
      expect(r.isFarmed).toBe(true);
    });

    it('lần 4+ cùng reason: multiplier=0.1, expGain=0 vì dưới threshold', () => {
      const r = calculateEpReward(50, 'Bế quan', ['bế quan', 'bế quan', 'bế quan'], 5, 1000);
      expect(r.multiplier).toBe(0.1);
      expect(r.finalEp).toBe(5);
      expect(r.expGain).toBe(0); // 5 < MIN_EP_FOR_EXP_GAIN
    });

    it('reason khác nhau không bị farm penalty', () => {
      const r = calculateEpReward(60, 'Đột phá', ['bế quan', 'chạy bộ'], 5, 1000);
      expect(r.multiplier).toBe(1.0);
    });
  });
});
