# ADR-001: TypeScript + Vite stack thay vì Google Canvas single-file

**Status:** Accepted
**Date:** 2026-06-25
**Deciders:** DuyenTB + Claude

## Context

Prototype gốc (`PREVIEW.md`, 1.3MB, ~33K tokens) viết trên Google Canvas — 1 file React JavaScript đơn lẻ chứa:
- 169+ `useState` calls
- ~25 modal/screen components inline
- 10+ chỗ duplicate URL gọi Gemini API
- 1.7K dòng JSX trộn với business logic
- Không có type safety, không có test, không có module boundary

Cần migrate sang stack production-ready để: (1) nhiều người làm song song, (2) test được, (3) maintain dài hạn, (4) deploy bình thường.

## Options considered

### 1. Stick với Google Canvas — không refactor
- ✅ Không tốn công migration
- ❌ Không scale — sửa 1 chỗ vỡ 10 chỗ
- ❌ Không debug được state lan rộng
- ❌ Bundle khổng lồ load chậm

### 2. CRA (Create React App) + JavaScript
- ✅ Familiar, ít learning curve
- ❌ CRA đã deprecate, không maintain
- ❌ Vẫn không có type safety
- ❌ Slow HMR

### 3. Next.js + TypeScript
- ✅ Type safety, SSR ready
- ✅ Routing built-in
- ❌ Game không cần SSR (single-page interactive)
- ❌ Overhead của framework không cần thiết
- ❌ Convention nặng nề cho game UI custom

### 4. Vite + React + TypeScript + Tailwind ✅
- ✅ HMR cực nhanh, build production tốt
- ✅ TypeScript strict mode bắt sai sớm
- ✅ Tailwind đã có sẵn class trong prototype — port dễ
- ✅ Esm-first, tree-shaking tốt → bundle nhỏ
- ❌ Phải config từ đầu (vite.config + tsconfig + tailwind config)
- ❌ Team phải biết TypeScript

### 5. Unity/Godot/Unreal
- ❌ Hoàn toàn không match — đây là AI-driven text RPG, không 3D
- ❌ Throw away toàn bộ React UI đã có
- ❌ Authoring story content khó hơn trong engine

## Decision

Chọn **Option 4: Vite + React 18 + TypeScript + Tailwind**.

Thêm vào stack:
- **Zustand + Immer** thay 169 useState
- **Zod** validate AI response runtime
- **Firebase** giữ (đã có data trong prototype)
- **Vitest** unit test cho core/
- **lottie-react** cho animation (xem ADR-003)

## Consequences

### ✅ Positive
- Type safety catch bug sớm. Refactor `recomputeStats(player, inventory)` an toàn (TS compiler bắt mọi call site).
- HMR Vite < 100ms feedback loop khi develop.
- Path alias `@core/`, `@ai/`, `@features/` keep import sạch.
- Test coverage core/ ≥ 70% — formula damage, realm, parser, spiritual-roots đều có test.
- Module boundary rõ — `core/` không biết React, `features/` không biết Firebase.
- Code review được vì file < 500 LOC mỗi file.

### ⚠️ Trade-off
- Setup time cao hơn vanilla — phải config tsconfig + vite + tailwind + eslint + prettier + vitest.
- Team mới phải biết TypeScript + Zustand + Immer patterns.
- Build time chậm hơn so với serve trực tiếp HTML (nhưng dev mode HMR fast).

### ❌ Negative
- `npm install` lần đầu chậm (~2 phút, ~200 packages).
- `@types/*` path alias đụng namespace với DefinitelyTyped — chấp nhận vì không import @types/* runtime, nhưng nếu sau này cần thì phải rename.

## References
- Migration nguồn: `PREVIEW.md` (prototype gốc)
- Folder structure đề xuất: `ARCHITECTURE.md`
- Tasks migration: BUILD_PLAN.md Phase 1 (Tuần 2-5)
