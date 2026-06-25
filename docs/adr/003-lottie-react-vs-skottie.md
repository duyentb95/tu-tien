# ADR-003: lottie-react thay vì Skottie/canvaskit-wasm

**Status:** Accepted
**Date:** 2026-06-25
**Deciders:** DuyenTB + Claude

## Context

Game cần animation chất lượng cao cho 3 use case visual-defining:
1. **Tribulation cutscene** — lightning bolts + breakthrough vortex
2. **Combat skill effects** — qi circle flash khi cast
3. **UI loading state** — 3 chấm tu vi pulse

Đã có 20 CSS keyframes (tt-*, m-*) trong tokens.css — đủ cho UI cơ bản nhưng:
- Lightning với bezier zigzag path khó author bằng CSS
- Vortex multi-layer (2 ring quay ngược + diamond + burst ring) requires complex SVG + JS
- Tốn 200+ LOC CSS cho 1 animation phức tạp

User reference skill `text-to-lottie` từ diffusionstudio. Cần đánh giá có nên dùng.

## Options considered

### 1. Stick với CSS keyframes
- ✅ Zero deps, zero bundle cost
- ✅ Đã có sẵn 20 keyframes
- ❌ Author phức tạp tốn 200+ LOC mỗi animation
- ❌ Không reusable cross-element
- ❌ Bezier path / multi-layer composite cực khó

### 2. Author Lottie + Skottie runtime (theo skill text-to-lottie)
- ✅ Skottie chất lượng render cao nhất, GPU-accelerated
- ✅ Hỗ trợ slots — runtime swap color/value qua properties panel
- ✅ Skill có ground-truth documentation đầy đủ
- ❌ **canvaskit-wasm ~3MB** — gấp 12× bundle hiện tại
- ❌ Yêu cầu scaffold project riêng (`degit diffusionstudio/lottie`) — không tích hợp được vào Vite hiện tại
- ❌ Slots feature game không cần (đã có Tailwind theme)
- ❌ Skia rendering overkill cho 4 animation đơn giản

### 3. lottie-react (lottie-web runtime) ✅
- ✅ Bundle ~50KB gzip (vs 3MB Skottie) — 60× nhỏ hơn
- ✅ Tích hợp 1 dòng `import Lottie from 'lottie-react'`
- ✅ Compatible với Bodymovin JSON spec (vẫn theo guideline skill)
- ✅ React component idiom: `<Lottie animationData={...} />`
- ✅ Loop, autoplay, speed, onComplete props
- ⚠️ Không support Skottie-specific (slots, URL frame control) — không cần cho game
- ❌ Quality render thấp hơn Skottie (rasterize trên canvas/SVG) — chấp nhận được cho UI animation

### 4. Framer Motion
- ✅ Native React, type-safe
- ✅ Spring physics built-in
- ❌ Không thay được Lottie cho complex multi-layer scenes (bezier paths, multi-element composite)
- ❌ Cần author thủ công mỗi animation, không có authoring tool như After Effects

### 5. Rive
- ✅ State machine, interactive animations
- ✅ Bundle ~150KB
- ❌ Cần Rive editor (proprietary)
- ❌ Format riêng — không compatible Lottie ecosystem
- ❌ Hơi overkill cho 4 animation hiện tại

## Decision

Chọn **Option 3: lottie-react**.

Strategy:
- Author 4 Lottie JSON theo Bodymovin spec — vẫn tuân guideline của skill `text-to-lottie` (shape layers ty:4, group wrapper, RGBA 0-1)
- Skip Skottie-specific features (slots, URL frame control)
- Components: `<LottiePlayer animationData={...} />` wrap lottie-react
- Có thể dùng Framer Motion cho transitions giữa stages (Phase 6 polish)

Author manually 4 animations:
- `loading-dots.json` (4.6KB) — UI thinking state
- `qi-circle.json` (4.4KB) — combat cast effect
- `lightning-bolt.json` (5.6KB) — tribulation lightning với bezier zigzag
- `breakthrough-vortex.json` (6.1KB) — tribulation success cutscene

## Consequences

### ✅ Positive
- Bundle cost ~75KB total (50KB lib + 25KB JSON) — chấp nhận được.
- Visual quality cao hơn CSS rõ rệt (đặc biệt lightning bezier + vortex multi-ring).
- Có thể nhận file Lottie từ designer After Effects sau này → drop vào `src/lottie/` xong.
- Reusable cross-screen (loading-dots dùng StoryView + có thể dùng Combat sau).
- Skill text-to-lottie vẫn có ích để **author** JSON đúng spec, dù không dùng Skottie runtime.

### ⚠️ Trade-off
- 2 animation system trong codebase: CSS keyframes (cho hover, anim-pulse simple) + Lottie (cho complex). Cần convention: simple state animation = CSS; multi-layer scene = Lottie.
- Author Lottie JSON tay (cho 4 animation hiện tại) tốn thời gian — nên sau này dùng After Effects + Bodymovin export.

### ❌ Negative
- Không có authoring tool free official cho Lottie ngoài After Effects ($$). 
- Lottie JSON khó debug khi sai (canvas blank, không error message hữu ích).

## References
- Skill gốc: https://github.com/diffusionstudio/lottie/tree/main/skills/text-to-lottie
- lottie-react: https://github.com/Gamote/lottie-react
- Bodymovin spec: https://lottiefiles.github.io/lottie-docs/
- Files: `src/lottie/*.json`, `src/shared/components/LottiePlayer.tsx`
