# ADR-002: Mock AI fallback mode khi không có Gemini key

**Status:** Accepted
**Date:** 2026-06-25
**Deciders:** DuyenTB + Claude

## Context

Game core dựa hoàn toàn vào Gemini để sinh narrative, item, quest, NPC. Vấn đề:

1. **Onboarding friction:** dev/tester muốn thử game phải đăng ký Gemini API key trước → barrier to entry cao.
2. **Demo:** muốn share URL demo cho stakeholder không kỹ thuật xem visual + flow — không thể yêu cầu họ setup API.
3. **CI/E2E test:** chạy test cần stable response — gọi LLM thật mỗi lần test sẽ flakey + tốn quota.
4. **Cost:** mỗi prompt ~$0.001-0.005, dev chạy 50 lần/ngày = $5-25/dev/ngày — không bền vững.
5. **Offline dev:** khi không có internet, không demo được gì.

## Options considered

### 1. Yêu cầu Gemini key bắt buộc
- ✅ Simple — chỉ 1 code path, không có dev mode logic
- ❌ Friction cao, demo khó, test flakey
- ❌ Cost cao

### 2. Mock chỉ trong test environment (process.env.NODE_ENV === 'test')
- ✅ Production luôn dùng real AI
- ❌ Vẫn không giải quyết được demo/onboarding
- ❌ Manual test tay vẫn tốn quota

### 3. Mock fallback dựa vào sự hiện diện của env key ✅
- ✅ User config 1 lần (`.env.local`) — có key thì real, không có thì mock
- ✅ Demo URL chạy được không cần setup
- ✅ Test có thể bypass dễ
- ✅ Dev tiết kiệm quota khi không cần test AI thật
- ⚠️ Phải maintain 2 code path (mock + real) — nhưng cùng interface `generateNarrative(ctx)`
- ⚠️ Mock chunks phải sync với prompt changes

### 4. Local LLM (Ollama/llama.cpp) làm fallback
- ✅ Sinh động không scripted
- ❌ Setup cực kỳ phức tạp cho user
- ❌ Quality thấp hơn Gemini nhiều cho Tiếng Việt
- ❌ Bundle size khổng lồ

### 5. Pre-record real Gemini response thành fixtures
- ✅ Realistic chunks
- ❌ Mất tính ngẫu nhiên — replay y hệt mỗi lần
- ❌ Phải re-record khi đổi prompt

## Decision

Chọn **Option 3**: mock fallback dựa vào env key, với 6 chunks scripted có đầy đủ game tags.

Implementation:
- `ai/mock.ts` export `getMockNarrative(isOpening)` + `shouldUseMockAi()`
- `ai/narrative-service.ts` wrap: kiểm tra `shouldUseMockAi()` → mock; else → real Gemini
- 6 mock chunks bao quát toàn bộ feature: opening + cultivation + NPC + combat + post-combat + breakthrough
- Mock có simulated latency 600-1300ms để UX cảm giác "thật"
- Toast banner trong GameSetup screen báo rõ: "Đang dùng Mock AI"

## Consequences

### ✅ Positive
- Mở `demo.html` standalone hoặc `npm run dev` (không config env) → chạy luôn end-to-end.
- Test playwright e2e không gọi LLM thật → stable + fast.
- Save quota Gemini khi dev UI/UX.
- Onboarding contributor mới: clone → npm install → npm run dev. Đủ chơi.

### ⚠️ Trade-off
- Phải đảm bảo mock chunks sync với prompt tag protocol — mỗi lần add tag mới, vd `[QUEST_GIVEN]`, phải update mock chunks.
- Mock chunks cố định → demo không có "wow factor" của AI thật.
- Risk: dev quên test với real AI, deploy code chỉ work với mock pattern.

### ❌ Negative
- 2 code path → 2× maintain.
- Mock chunks chiếm ~6KB bundle (chấp nhận được).

## Mitigation
- CI có 1 e2e test với real Gemini (skip nếu không có CI secret) — đảm bảo prompt template còn work.
- Mỗi PR thêm tag mới: checklist phải update mock + prompt.

## References
- `src/ai/mock.ts` — implementation
- `src/ai/narrative-service.ts` — fallback logic
- Mock chunks v3: hỗ trợ ITEM/EXP/CURRENCY/QUEST_GIVEN/COMBAT/REALM_BREAK/SKILL tags
