/**
 * Nội dung Cẩm Nang Tu Tiên — wiki in-game.
 * Mỗi entry là 1 chương ngắn (2-4 đoạn) giải thích 1 hệ thống.
 * Pure data — không import React để dễ test/maintain.
 */

export interface HandbookEntry {
  id: string;
  title: string;
  icon: string;
  category: 'basics' | 'cultivation' | 'combat' | 'society' | 'advanced';
  /** Markdown-lite: hỗ trợ \n đoạn, ** bold, > blockquote */
  content: string;
}

export const HANDBOOK_ENTRIES: HandbookEntry[] = [
  // ─── BASICS ───
  {
    id: 'getting-started',
    title: 'Bắt Đầu Tu Tiên',
    icon: '◆',
    category: 'basics',
    content: `Chào mừng tiểu hữu đến với thế giới tu tiên.

Mỗi lượt, ngươi đọc **đoạn truyện** mà thiên cơ vẽ ra, sau đó chọn **1 trong 4 hành động** ở thanh dưới cùng — hoặc gõ hành động tự do của riêng mình.

Mọi sự kiện đều ảnh hưởng đến chỉ số nhân vật (sinh mệnh, tu vi, linh thạch) hiển thị ở **thanh bên phải**. Khi tu vi đầy, ngươi sẽ tự động đột phá lên cấp tiếp theo.

> Mẹo: Đừng vội tu luyện đầu game. Đi khám phá, lấy item, gặp NPC trước — sẽ unlock nhiều cơ duyên ẩn.`,
  },
  {
    id: 'navigation',
    title: 'Di Chuyển & Giao Diện',
    icon: '◉',
    category: 'basics',
    content: `Thanh navigation trên cùng có **11 màn hình**, mỗi cái phục vụ 1 mục đích:

- **Câu Chuyện** — màn chính, nơi AI kể chuyện và ngươi đưa lựa chọn
- **Bản Đồ** — di chuyển giữa các vùng đất (chỉ qua được vùng kề)
- **Nhân Vật** — xem chỉ số, phân bổ điểm tiềm năng (AP) sau đột phá
- **Hành Trang** — trang bị item, dùng đan dược, xem pháp bảo
- **Nhiệm Vụ** — track main + side quests đang nhận
- **Tông Môn** — đóng góp + đổi pháp khí ở môn phái đã gia nhập
- **Linh Thú** — bộ sưu tập thú khế ước, tiến hóa, đem theo combat
- **Động Phủ** — đất riêng, trồng linh thảo + tu luyện kín thất
- **Bí Cảnh / Combat / Độ Kiếp** — trigger các sự kiện đặc biệt`,
  },
  {
    id: 'save-system',
    title: 'Lưu Trữ Tiến Trình',
    icon: '☷',
    category: 'basics',
    content: `Game **tự lưu mỗi lượt** vào localStorage trình duyệt. Không cần nhấn nút save.

Nếu đăng nhập Firebase (sẽ có ở phiên bản sau), tiến trình sync lên cloud — chơi xuyên thiết bị.

> ⚠ Xóa cache trình duyệt = mất save. Sau này sẽ có nút Export Save → tải file JSON về máy backup.`,
  },

  // ─── CULTIVATION ───
  {
    id: 'realms',
    title: 'Cảnh Giới Tu Tiên',
    icon: '✦',
    category: 'cultivation',
    content: `Tu tiên chia thành các **cảnh giới lớn**, mỗi cảnh giới có 10 tầng nhỏ.

Cảnh giới mặc định: **Luyện Khí → Trúc Cơ → Kim Đan → Nguyên Anh → Hóa Thần → Luyện Hư → Đại Thừa → Phi Thăng**.

Mỗi 10 cấp = 1 đại đột phá, kích hoạt **Độ Kiếp** (lôi kiếp). Vượt thành công = tu vi đại tăng. Vượt thất bại = trọng thương hoặc tử vong.

> Đột phá trong cảnh giới (mỗi 1 tầng) không cần độ kiếp — tự động khi đủ exp.`,
  },
  {
    id: 'spiritual-roots',
    title: 'Linh Căn (Spiritual Roots)',
    icon: '☘',
    category: 'cultivation',
    content: `Linh căn quyết định **tốc độ tu luyện** và **công pháp ngươi học được**.

- **Đơn Linh Căn** (1 hệ): ×3.0 speed — siêu hiếm, thiên tài
- **Song Linh Căn** (2 hệ): ×2.0 speed — hiếm
- **Tam Linh Căn**: ×1.5 — bình thường
- **Tứ/Ngũ Linh Căn**: ×1.0 / ×0.5 — phế thể, khó tu
- **Dị Linh Căn** (Lôi/Phong/Băng/Quang/Ám): ×4.0+ — biến dị, cực hiếm

Linh căn roll khi tạo nhân vật. Một số dược liệu hiếm có thể "tẩy linh căn" sau này.`,
  },
  {
    id: 'meditation',
    title: 'Tu Luyện & Đột Phá',
    icon: '◐',
    category: 'cultivation',
    content: `Có 4 cách tăng tu vi (EXP):

1. **Hành động tu luyện** trong câu chuyện — chậm nhưng an toàn
2. **Tu Luyện Thất** trong Động Phủ — bonus theo level phòng
3. **Đan dược** (Tu Khí Tán, Trúc Cơ Đan) — instant boost
4. **Đột phá tổ kiếp** — hoàn thành sự kiện kỳ ngộ

Khi tu vi đầy → tự lên cấp + nhận **AP (điểm tiềm năng)** để phân bổ vào ATK/DEF/SPD/HP ở màn Nhân Vật.`,
  },
  {
    id: 'tribulation',
    title: 'Độ Kiếp (Heavenly Tribulation)',
    icon: '⚡',
    category: 'cultivation',
    content: `Khi đạt level 10, 20, 30,... ngươi phải đối mặt **Độ Kiếp** — 9 đạo lôi từ thiên đạo.

Sát thương lôi = f(level, tâm cảnh, pháp bảo phòng kiếp). Mỗi đạo HP bị trừ.

**Vượt thành công** → đột phá đại cảnh giới, stats tăng vọt.
**Vượt thất bại** → 3 mức tùy độ HP còn:
- Nhẹ: Trọng thương 7 ngày
- Vừa: Tẩu hỏa nhập ma (debuff vĩnh viễn -20% ATK)
- Nặng: Tử vong (game over hoặc respawn 1 lần nếu có Bùa Hộ Mệnh)

> Mẹo: Trước độ kiếp lớn, tích đủ đan dược hồi máu + mặc pháp bảo phòng kiếp cấp cao.`,
  },

  // ─── COMBAT ───
  {
    id: 'combat-basics',
    title: 'Combat Turn-Based',
    icon: '⚔',
    category: 'combat',
    content: `Combat tu tiên là **turn-based theo tốc độ (SPD)** — ai SPD cao hơn đi trước.

Mỗi lượt ngươi chọn:
- **Tấn công thường** — không tốn linh lực
- **Kỹ năng combat** — tốn linh lực, sát thương cao
- **Dùng đan dược** — hồi HP / buff temporary
- **Bỏ chạy** — % thành công phụ thuộc SPD chênh

Sát thương cuối = atk × dmgAmp × (1 - dmgRes) × random(0.85-1.15), crit ×1.5-2.0.`,
  },
  {
    id: 'realm-gap',
    title: 'Cảnh Giới Gap Penalty',
    icon: '⚠',
    category: 'combat',
    content: `Khi đánh nhau với địch chênh **≥ 1 đại cảnh giới**:
- Damage ngươi gây ra **×0.1** (10%)
- Damage ngươi nhận **×5**

→ Đừng cố cứng đánh boss vượt cấp. Hãy tu luyện đúng lộ trình, dùng pháp bảo và linh thú để chia damage.

> Ngoại lệ: Khi crit hoặc có buff "Phá Cảnh", penalty giảm.`,
  },
  {
    id: 'spirit-beasts',
    title: 'Linh Thú Đồng Hành',
    icon: '◈',
    category: 'combat',
    content: `Trong combat, khi địch HP < 20% có **% khế ước** (tùy phẩm chất linh thú).

Linh thú đã khế ước:
- Có level + EXP riêng, ăn linh thạch để lên cấp
- Tham gia combat như **đồng minh thứ 2** (active 1 con tại mỗi thời điểm)
- Tiến hóa khi đạt level milestone + dùng vật phẩm hiếm
- Phẩm chất từ Thường → Huyền Thoại (8 con default)

Quản lý ở **Linh Thú Các** (nav).`,
  },

  // ─── SOCIETY ───
  {
    id: 'sects',
    title: 'Gia Nhập Tông Môn',
    icon: '◈',
    category: 'society',
    content: `Mỗi tông môn có **5 cấp bậc**: Ngoại Môn → Nội Môn → Chân Truyền → Trưởng Lão → Tông Chủ.

**Quyền lợi khi gia nhập**:
- Nhiệm vụ tông môn riêng (cho linh thạch + cống hiến điểm)
- Tàng Kinh Các: đổi cống hiến lấy công pháp + đan phương + pháp khí
- Bonus tu luyện trong địa giới tông môn
- Bảo vệ khỏi truy sát của tu sĩ phái địch

5 tông môn default: Thanh Vân, Vạn Pháp, Huyết Sát, Đan Đỉnh, Kiếm Tông.`,
  },
  {
    id: 'dao-companions',
    title: 'Đạo Lữ (Dao Companions)',
    icon: '♥',
    category: 'society',
    content: `NPC có **affinity 0-100**. Tăng qua: tương tác, tặng quà, hoàn quest cùng, song tu.

Khi affinity ≥ 80 + đủ điều kiện (giới tính, tâm cảnh) → unlock option **kết đạo lữ**.

**Song tu** (cùng tu luyện): tốc độ ×1.3, chia sẻ tâm cảnh.

> ⚠ Nếu đạo lữ chết, player vĩnh viễn debuff "Tâm Ma" cho đến khi báo thù xong.`,
  },

  // ─── ADVANCED ───
  {
    id: 'artifacts',
    title: 'Pháp Bảo (Magical Artifacts)',
    icon: '☆',
    category: 'advanced',
    content: `Pháp bảo khác vũ khí thường: có **artifactLevel** từ 1-5 (Phàm khí → Linh khí → Pháp khí → Bảo khí → Tiên khí).

**Dưỡng pháp bảo**: dùng linh thạch hoặc tinh hồn để nuôi → level lên → stats × multiplier.

**Ngự kiếm phi hành**: pháp bảo kiếm cấp cao cho phép bay trên bản đồ (di chuyển nhanh hơn).

Manage ở **Hành Trang** → tab Pháp Bảo.`,
  },
  {
    id: 'cave-abode',
    title: 'Động Phủ (Cave Abode)',
    icon: '◐',
    category: 'advanced',
    content: `Mua đất, xây 4 loại phòng:

- **Tu Luyện Thất** — thiền định, bonus EXP theo level phòng
- **Luyện Đan Thất** — kết hợp linh thảo thành đan dược (có recipe trong Cẩm Nang)
- **Dược Viên** — trồng linh thảo (timer 7-365 ngày), số plot theo level player
- **Tàng Thư Các** — chứa sách công pháp, bonus học nhanh

Pháp khí cao + đạo lữ ở chung → bonus tu luyện stacking.`,
  },
  {
    id: 'secret-realm',
    title: 'Bí Cảnh (Secret Realms)',
    icon: '✧',
    category: 'advanced',
    content: `Bí cảnh là **instance dungeon procedural** — mỗi lần vào AI sinh sơ đồ phòng khác nhau.

- 5-15 phòng theo độ khó
- Boss cuối với loot pool theo level
- Timed: hết thời gian bị đẩy ra
- **Risk/reward**: phẩm chất loot tăng theo độ sâu, nhưng KHÔNG resurrect trong bí cảnh

> Mẹo: Đem theo đan dược hồi máu + linh thú tank trước khi vào.`,
  },
];

export const HANDBOOK_CATEGORIES: { id: HandbookEntry['category']; label: string; icon: string }[] = [
  { id: 'basics', label: 'Cơ Bản', icon: '◆' },
  { id: 'cultivation', label: 'Tu Luyện', icon: '✦' },
  { id: 'combat', label: 'Combat', icon: '⚔' },
  { id: 'society', label: 'Xã Hội', icon: '◈' },
  { id: 'advanced', label: 'Nâng Cao', icon: '☆' },
];
