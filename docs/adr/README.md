# Architecture Decision Records (ADR)

Mỗi ADR ghi lại 1 quyết định kiến trúc lớn — context, options đã cân nhắc, decision, consequences (cả tốt lẫn xấu).

## Quy tắc

- **Bất biến** — không sửa ADR đã accepted. Nếu quyết định mới đảo ngược → tạo ADR mới với `Status: Supersedes ADR-XXX`, ADR cũ thì update `Status: Superseded by ADR-YYY`.
- **Đánh số tuần tự** — `ADR-001`, `ADR-002`, ... không nhảy số.
- **Status:** `Proposed` → `Accepted` → (optional) `Deprecated` / `Superseded`.
- **Date** ghi ngày accept, không phải ngày draft.

## Template

```markdown
# ADR-XXX: Title

**Status:** Accepted
**Date:** YYYY-MM-DD
**Deciders:** Names

## Context
What's the problem? What constraints exist?

## Options considered
1. Option A — pros/cons
2. Option B — pros/cons
3. Option C — pros/cons

## Decision
We chose X because...

## Consequences
- ✅ Positive: ...
- ⚠️ Trade-off: ...
- ❌ Negative: ...

## References
- Link related ADRs, GDD sections, external resources
```

## Index

| # | Title | Status | Date |
|---|---|---|---|
| [001](./001-typescript-vite-stack.md) | TypeScript + Vite stack thay vì Google Canvas single-file | Accepted | 2026-06-25 |
| [002](./002-mock-ai-fallback.md) | Mock AI fallback mode khi không có Gemini key | Accepted | 2026-06-25 |
| [003](./003-lottie-react-vs-skottie.md) | lottie-react thay vì Skottie/canvaskit-wasm | Accepted | 2026-06-25 |
