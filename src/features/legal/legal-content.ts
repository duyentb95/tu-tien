/**
 * Legal content — Privacy Policy, Terms of Service, About.
 * Markdown-lite format (same renderer như HandbookModal).
 *
 * Update lần cuối: 2026-06-26 (xem APP_VERSION).
 * Khi có thay đổi material → bump APP_VERSION và update lastUpdated.
 */

export const APP_VERSION = '0.6.0';
export const APP_BUILD_DATE = '2026-06-26';

export interface LegalPage {
  id: 'privacy' | 'tos' | 'about';
  title: string;
  icon: string;
  lastUpdated: string;
  content: string;
}

export const PRIVACY_POLICY: LegalPage = {
  id: 'privacy',
  title: 'Chính Sách Bảo Mật',
  icon: '◐',
  lastUpdated: '2026-06-26',
  content: `Chúng tôi tôn trọng quyền riêng tư của người chơi. Trang này giải thích dữ liệu nào được lưu, ở đâu, và bạn có thể kiểm soát ra sao.

**1. Dữ liệu lưu trên thiết bị của bạn**

Toàn bộ tiến trình game (nhân vật, inventory, lịch sử câu chuyện, cài đặt) được lưu trong **localStorage trình duyệt**. Không upload lên server nếu bạn không bật tính năng Sync Cloud.

> Xóa cache trình duyệt = mất save. Hãy export save ra file .json để backup.

**2. Dữ liệu gửi tới Google Gemini API**

Khi bạn nhập hành động, prompt bao gồm: tên nhân vật, background, hành động, lịch sử gần đây (5-10 turn) — được gửi tới **Google Gemini API** để sinh narrative.

- Google có thể log prompt để cải thiện model (xem [Gemini API ToS](https://ai.google.dev/terms))
- KHÔNG nhập thông tin cá nhân thật (số CMND, mật khẩu, địa chỉ) vào background nhân vật

**3. Dữ liệu Firebase (chỉ khi bật Sync Cloud)**

Nếu bạn bật cloud sync (Phase 7+), game lưu save lên **Firebase Firestore**:
- Auth qua anonymous account (không cần email/password)
- User ID là UUID ngẫu nhiên, không liên kết với danh tính thật
- Save chỉ truy cập được bằng UID của bạn

**4. Cookies & tracking**

App KHÔNG dùng cookies tracking, KHÔNG analytics, KHÔNG quảng cáo. Chỉ localStorage để lưu save + tutorial state.

**5. Quyền của bạn**

- **Truy cập**: Mở DevTools → Application → LocalStorage để xem toàn bộ data
- **Xóa**: Settings → Clear site data (xóa tất cả)
- **Export**: Lưu Trữ → Export → tải file .json
- **Liên hệ**: Gửi feedback qua GitHub Issues của repo

**6. Trẻ vị thành niên**

Game khuyến cáo người chơi **≥ 13 tuổi**. Chế độ NSFW chỉ bật khi xác nhận ≥ 18 tuổi (xem TOS).

**7. Thay đổi chính sách**

Khi có thay đổi material, version app sẽ tăng lên (vd 0.7.0) và thông báo hiển thị ở Initial Screen.`,
};

export const TERMS_OF_SERVICE: LegalPage = {
  id: 'tos',
  title: 'Điều Khoản Sử Dụng',
  icon: '☷',
  lastUpdated: '2026-06-26',
  content: `Bằng việc sử dụng game này, bạn đồng ý với các điều khoản dưới đây.

**1. Bản chất sản phẩm**

Game là **dự án mã nguồn mở phi thương mại**, phục vụ giải trí. Không bảo hành về uptime, độ chính xác nội dung, hoặc khả dụng API bên thứ ba (Gemini/Firebase).

**2. Nội dung do AI sinh**

Toàn bộ narrative, dialogue, item description được **sinh bởi AI Gemini** dựa trên prompt + background bạn nhập. Chúng tôi KHÔNG kiểm duyệt từng output. Có thể xuất hiện:
- Nội dung không chính xác về lịch sử/văn hóa tu tiên
- Văn phong lặp lại hoặc thiếu sáng tạo
- Hiếm khi: nội dung không phù hợp dù đã có safety filter của Google

Nếu gặp output gây hại, vui lòng báo cáo qua Issues.

**3. Chế độ NSFW (18+)**

Có toggle 18+ Mode trong Cài Đặt. Khi bật:
- Bạn xác nhận **đã đủ 18 tuổi** và nội dung này hợp pháp ở vùng cư trú của bạn
- Anthropic / Google / nhà phát triển KHÔNG chịu trách nhiệm nếu bạn vi phạm luật địa phương
- Default OFF, phải explicit opt-in

**4. Fan-fiction & bản quyền**

Game hỗ trợ chế độ fan-fiction (nhập universe có sẵn vào background). **Bạn tự chịu trách nhiệm** nếu vi phạm IP của tác giả gốc. Không lưu IP bên thứ ba lên cloud server của chúng tôi.

**5. Hành vi cấm**

KHÔNG sử dụng game để:
- Sinh nội dung hate speech, kích động bạo lực thật
- Mô phỏng nhân vật có thật (chính trị gia, KOL...) với mục đích bôi nhọ
- Lạm dụng API (quota miễn phí của Google) — rate limit 60 calls/giờ enforced client-side

**6. Trách nhiệm**

App được cung cấp "AS IS" — không bảo hành. Tác giả không chịu trách nhiệm:
- Mất save do clear cache / hỏng localStorage
- Thiệt hại từ việc sử dụng nội dung AI sinh
- Downtime của Gemini/Firebase

**7. Giấy phép**

Source code MIT License (xem repo GitHub). Nội dung default (data prototype) MIT. Người chơi giữ bản quyền nội dung tự nhập (background, custom story title).

**8. Thẩm quyền**

Tranh chấp (nếu có) giải quyết theo luật Việt Nam, tòa án có thẩm quyền tại TP.HCM.`,
};

export const ABOUT_PAGE: LegalPage = {
  id: 'about',
  title: 'Về Mặc Hội Tiên Đồ',
  icon: '✦',
  lastUpdated: '2026-06-26',
  content: `**Mặc Hội Tiên Đồ** — game RPG tu tiên thế giới mở dẫn dắt bởi AI.

**Phiên bản**: ${APP_VERSION} (build ${APP_BUILD_DATE})

**Lý tưởng**

Game tu tiên thường giới hạn ở câu chuyện được viết sẵn. Mặc Hội Tiên Đồ dùng LLM (Gemini) để mỗi lượt chơi là một câu chuyện riêng — nhân vật bạn nhập "đệ tử Vạn Cổ Tối Cường Tông" thì AI sẽ dệt thế giới đó, không phải Thanh Vân Phong cố định.

**Kiến trúc**

- **Frontend**: React 18 + TypeScript + Tailwind + Vite
- **State**: Zustand + Immer + Zod runtime validation
- **AI**: Google Gemini 2.5 Flash (fallback chain qua 4 model)
- **Cloud**: Firebase Auth + Firestore (optional sync)
- **Animation**: Lottie (Bodymovin spec)
- **PWA**: offline-capable, installable

Source code: [github.com/duyentb95/tu-tien](https://github.com/duyentb95/tu-tien) (MIT)

**Hệ thống hiện có**

- 6 cảnh giới tu tiên (Luyện Khí → Phi Thăng)
- 5 hệ linh căn (Kim/Mộc/Thủy/Hỏa/Thổ) + dị linh căn
- Combat turn-based với pháp bảo, linh thú, trận pháp
- 5 tông môn default, hệ thống cống hiến + Tàng Kinh Các
- 8 linh thú khế ước được, có evolution
- Động phủ 4 phòng (Tu Luyện / Luyện Đan / Dược Viên / Tàng Thư)
- Bí cảnh procedural dungeon
- 10 location world map với fog of war
- Save export/import JSON + auto-backup
- Cẩm Nang wiki in-game

**Roadmap tiếp**

- Phase 7: AI proxy qua Firebase Functions (ẩn API key)
- Tournament nội môn
- Hệ thống đạo lữ + song tu hoàn chỉnh
- Cảnh giới Đại Thừa (late game)
- Audio (BGM + SFX expanded)

**Cảm ơn**

- **Anthropic** — Claude làm cụ vũ — refactor + design hệ thống
- **Google** — Gemini API miễn phí tier dùng được
- **Cộng đồng tu tiên fic** — nguồn cảm hứng văn phong

**Liên hệ & feedback**

Issues / Pull Requests trên GitHub. Mọi đóng góp đều được hoan nghênh.`,
};

export const LEGAL_PAGES: LegalPage[] = [PRIVACY_POLICY, TERMS_OF_SERVICE, ABOUT_PAGE];
