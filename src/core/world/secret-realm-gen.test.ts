import { describe, it, expect } from 'vitest';
import { generateSecretRealm } from './secret-realm-gen';

const seedRng = (seed = 0.5) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

describe('generateSecretRealm', () => {
  it('có entry + boss + corridor 4-7 rooms', () => {
    const sr = generateSecretRealm({ level: 10, rng: seedRng() });
    expect(sr.entryRoomId).toBe('r_entry');
    expect(sr.bossRoomId).toBe('r_boss');
    expect(sr.rooms[sr.entryRoomId]).toBeDefined();
    expect(sr.rooms[sr.bossRoomId]).toBeDefined();
    // Tổng rooms ≥ 6 (entry + 4 corridor + boss = 6 minimum, + branch optional)
    expect(Object.keys(sr.rooms).length).toBeGreaterThanOrEqual(6);
    expect(Object.keys(sr.rooms).length).toBeLessThanOrEqual(15);
  });

  it('current room = entry, entry visited & cleared', () => {
    const sr = generateSecretRealm({ level: 5 });
    expect(sr.currentRoomId).toBe(sr.entryRoomId);
    expect(sr.rooms[sr.entryRoomId]!.visited).toBe(true);
    expect(sr.rooms[sr.entryRoomId]!.cleared).toBe(true);
  });

  it('boss room có payload enemy level cao hơn level + 3', () => {
    const sr = generateSecretRealm({ level: 10, rng: seedRng() });
    const boss = sr.rooms[sr.bossRoomId]!;
    expect(boss.kind).toBe('boss');
    expect(boss.payload?.enemyLevel).toBe(13);
  });

  it('clearReward scale theo level', () => {
    const sr1 = generateSecretRealm({ level: 1 });
    const sr10 = generateSecretRealm({ level: 10 });
    expect(sr10.clearReward.exp).toBeGreaterThan(sr1.clearReward.exp);
    expect(sr10.clearReward.currency).toBeGreaterThan(sr1.clearReward.currency);
  });

  it('mọi room kết nối được entry → boss (path tồn tại)', () => {
    const sr = generateSecretRealm({ level: 5, rng: seedRng() });
    // BFS
    const visited = new Set<string>([sr.entryRoomId]);
    const queue = [sr.entryRoomId];
    while (queue.length > 0) {
      const id = queue.shift()!;
      const r = sr.rooms[id]!;
      for (const n of r.neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    expect(visited.has(sr.bossRoomId)).toBe(true);
  });

  it('ttlTurns mặc định = 720 (~30 ngày)', () => {
    const sr = generateSecretRealm({ level: 5 });
    expect(sr.ttlTurns).toBe(720);
  });

  it('deterministic với cùng seed', () => {
    const a = generateSecretRealm({ level: 10, rng: seedRng(0.3) });
    const b = generateSecretRealm({ level: 10, rng: seedRng(0.3) });
    expect(Object.keys(a.rooms).length).toBe(Object.keys(b.rooms).length);
  });
});
