import{j as n}from"./framer-B3ouEdmE.js";import{r}from"./react-DnQQq7lD.js";import{F as x,B as y}from"./index-BKo9Moy-.js";import{W as P,G as L,I as H,J as M}from"./index-BKo9Moy-.js";const g=[{id:"getting-started",title:"Bắt Đầu Tu Tiên",icon:"◆",category:"basics",content:`Chào mừng tiểu hữu đến với thế giới tu tiên.

Mỗi lượt, ngươi đọc **đoạn truyện** mà thiên cơ vẽ ra, sau đó chọn **1 trong 4 hành động** ở thanh dưới cùng — hoặc gõ hành động tự do của riêng mình.

Mọi sự kiện đều ảnh hưởng đến chỉ số nhân vật (sinh mệnh, tu vi, linh thạch) hiển thị ở **thanh bên phải**. Khi tu vi đầy, ngươi sẽ tự động đột phá lên cấp tiếp theo.

> Mẹo: Đừng vội tu luyện đầu game. Đi khám phá, lấy item, gặp NPC trước — sẽ unlock nhiều cơ duyên ẩn.`},{id:"navigation",title:"Di Chuyển & Giao Diện",icon:"◉",category:"basics",content:`Thanh navigation trên cùng có **11 màn hình**, mỗi cái phục vụ 1 mục đích:

- **Câu Chuyện** — màn chính, nơi AI kể chuyện và ngươi đưa lựa chọn
- **Bản Đồ** — di chuyển giữa các vùng đất (chỉ qua được vùng kề)
- **Nhân Vật** — xem chỉ số, phân bổ điểm tiềm năng (AP) sau đột phá
- **Hành Trang** — trang bị item, dùng đan dược, xem pháp bảo
- **Nhiệm Vụ** — track main + side quests đang nhận
- **Tông Môn** — đóng góp + đổi pháp khí ở môn phái đã gia nhập
- **Linh Thú** — bộ sưu tập thú khế ước, tiến hóa, đem theo combat
- **Động Phủ** — đất riêng, trồng linh thảo + tu luyện kín thất
- **Bí Cảnh / Combat / Độ Kiếp** — trigger các sự kiện đặc biệt`},{id:"save-system",title:"Lưu Trữ Tiến Trình",icon:"☷",category:"basics",content:`Game **tự lưu mỗi lượt** vào localStorage trình duyệt. Không cần nhấn nút save.

Nếu đăng nhập Firebase (sẽ có ở phiên bản sau), tiến trình sync lên cloud — chơi xuyên thiết bị.

> ⚠ Xóa cache trình duyệt = mất save. Sau này sẽ có nút Export Save → tải file JSON về máy backup.`},{id:"realms",title:"Cảnh Giới Tu Tiên",icon:"✦",category:"cultivation",content:`Tu tiên chia thành các **cảnh giới lớn**, mỗi cảnh giới có 10 tầng nhỏ.

Cảnh giới mặc định: **Luyện Khí → Trúc Cơ → Kim Đan → Nguyên Anh → Hóa Thần → Luyện Hư → Đại Thừa → Phi Thăng**.

Mỗi 10 cấp = 1 đại đột phá, kích hoạt **Độ Kiếp** (lôi kiếp). Vượt thành công = tu vi đại tăng. Vượt thất bại = trọng thương hoặc tử vong.

> Đột phá trong cảnh giới (mỗi 1 tầng) không cần độ kiếp — tự động khi đủ exp.`},{id:"spiritual-roots",title:"Linh Căn (Spiritual Roots)",icon:"☘",category:"cultivation",content:`Linh căn quyết định **tốc độ tu luyện** và **công pháp ngươi học được**.

- **Đơn Linh Căn** (1 hệ): ×3.0 speed — siêu hiếm, thiên tài
- **Song Linh Căn** (2 hệ): ×2.0 speed — hiếm
- **Tam Linh Căn**: ×1.5 — bình thường
- **Tứ/Ngũ Linh Căn**: ×1.0 / ×0.5 — phế thể, khó tu
- **Dị Linh Căn** (Lôi/Phong/Băng/Quang/Ám): ×4.0+ — biến dị, cực hiếm

Linh căn roll khi tạo nhân vật. Một số dược liệu hiếm có thể "tẩy linh căn" sau này.`},{id:"meditation",title:"Tu Luyện & Đột Phá",icon:"◐",category:"cultivation",content:`Có 4 cách tăng tu vi (EXP):

1. **Hành động tu luyện** trong câu chuyện — chậm nhưng an toàn
2. **Tu Luyện Thất** trong Động Phủ — bonus theo level phòng
3. **Đan dược** (Tu Khí Tán, Trúc Cơ Đan) — instant boost
4. **Đột phá tổ kiếp** — hoàn thành sự kiện kỳ ngộ

Khi tu vi đầy → tự lên cấp + nhận **AP (điểm tiềm năng)** để phân bổ vào ATK/DEF/SPD/HP ở màn Nhân Vật.`},{id:"tribulation",title:"Độ Kiếp (Heavenly Tribulation)",icon:"⚡",category:"cultivation",content:`Khi đạt level 10, 20, 30,... ngươi phải đối mặt **Độ Kiếp** — 9 đạo lôi từ thiên đạo.

Sát thương lôi = f(level, tâm cảnh, pháp bảo phòng kiếp). Mỗi đạo HP bị trừ.

**Vượt thành công** → đột phá đại cảnh giới, stats tăng vọt.
**Vượt thất bại** → 3 mức tùy độ HP còn:
- Nhẹ: Trọng thương 7 ngày
- Vừa: Tẩu hỏa nhập ma (debuff vĩnh viễn -20% ATK)
- Nặng: Tử vong (game over hoặc respawn 1 lần nếu có Bùa Hộ Mệnh)

> Mẹo: Trước độ kiếp lớn, tích đủ đan dược hồi máu + mặc pháp bảo phòng kiếp cấp cao.`},{id:"combat-basics",title:"Combat Turn-Based",icon:"⚔",category:"combat",content:`Combat tu tiên là **turn-based theo tốc độ (SPD)** — ai SPD cao hơn đi trước.

Mỗi lượt ngươi chọn:
- **Tấn công thường** — không tốn linh lực
- **Kỹ năng combat** — tốn linh lực, sát thương cao
- **Dùng đan dược** — hồi HP / buff temporary
- **Bỏ chạy** — % thành công phụ thuộc SPD chênh

Sát thương cuối = atk × dmgAmp × (1 - dmgRes) × random(0.85-1.15), crit ×1.5-2.0.`},{id:"realm-gap",title:"Cảnh Giới Gap Penalty",icon:"⚠",category:"combat",content:`Khi đánh nhau với địch chênh **≥ 1 đại cảnh giới**:
- Damage ngươi gây ra **×0.1** (10%)
- Damage ngươi nhận **×5**

→ Đừng cố cứng đánh boss vượt cấp. Hãy tu luyện đúng lộ trình, dùng pháp bảo và linh thú để chia damage.

> Ngoại lệ: Khi crit hoặc có buff "Phá Cảnh", penalty giảm.`},{id:"spirit-beasts",title:"Linh Thú Đồng Hành",icon:"◈",category:"combat",content:`Trong combat, khi địch HP < 20% có **% khế ước** (tùy phẩm chất linh thú).

Linh thú đã khế ước:
- Có level + EXP riêng, ăn linh thạch để lên cấp
- Tham gia combat như **đồng minh thứ 2** (active 1 con tại mỗi thời điểm)
- Tiến hóa khi đạt level milestone + dùng vật phẩm hiếm
- Phẩm chất từ Thường → Huyền Thoại (8 con default)

Quản lý ở **Linh Thú Các** (nav).`},{id:"sects",title:"Gia Nhập Tông Môn",icon:"◈",category:"society",content:`Mỗi tông môn có **5 cấp bậc**: Ngoại Môn → Nội Môn → Chân Truyền → Trưởng Lão → Tông Chủ.

**Quyền lợi khi gia nhập**:
- Nhiệm vụ tông môn riêng (cho linh thạch + cống hiến điểm)
- Tàng Kinh Các: đổi cống hiến lấy công pháp + đan phương + pháp khí
- Bonus tu luyện trong địa giới tông môn
- Bảo vệ khỏi truy sát của tu sĩ phái địch

5 tông môn default: Thanh Vân, Vạn Pháp, Huyết Sát, Đan Đỉnh, Kiếm Tông.`},{id:"dao-companions",title:"Đạo Lữ (Dao Companions)",icon:"♥",category:"society",content:`NPC có **affinity 0-100**. Tăng qua: tương tác, tặng quà, hoàn quest cùng, song tu.

Khi affinity ≥ 80 + đủ điều kiện (giới tính, tâm cảnh) → unlock option **kết đạo lữ**.

**Song tu** (cùng tu luyện): tốc độ ×1.3, chia sẻ tâm cảnh.

> ⚠ Nếu đạo lữ chết, player vĩnh viễn debuff "Tâm Ma" cho đến khi báo thù xong.`},{id:"artifacts",title:"Pháp Bảo (Magical Artifacts)",icon:"☆",category:"advanced",content:`Pháp bảo khác vũ khí thường: có **artifactLevel** từ 1-5 (Phàm khí → Linh khí → Pháp khí → Bảo khí → Tiên khí).

**Dưỡng pháp bảo**: dùng linh thạch hoặc tinh hồn để nuôi → level lên → stats × multiplier.

**Ngự kiếm phi hành**: pháp bảo kiếm cấp cao cho phép bay trên bản đồ (di chuyển nhanh hơn).

Manage ở **Hành Trang** → tab Pháp Bảo.`},{id:"cave-abode",title:"Động Phủ (Cave Abode)",icon:"◐",category:"advanced",content:`Mua đất, xây 4 loại phòng:

- **Tu Luyện Thất** — thiền định, bonus EXP theo level phòng
- **Luyện Đan Thất** — kết hợp linh thảo thành đan dược (có recipe trong Cẩm Nang)
- **Dược Viên** — trồng linh thảo (timer 7-365 ngày), số plot theo level player
- **Tàng Thư Các** — chứa sách công pháp, bonus học nhanh

Pháp khí cao + đạo lữ ở chung → bonus tu luyện stacking.`},{id:"secret-realm",title:"Bí Cảnh (Secret Realms)",icon:"✧",category:"advanced",content:`Bí cảnh là **instance dungeon procedural** — mỗi lần vào AI sinh sơ đồ phòng khác nhau.

- 5-15 phòng theo độ khó
- Boss cuối với loot pool theo level
- Timed: hết thời gian bị đẩy ra
- **Risk/reward**: phẩm chất loot tăng theo độ sâu, nhưng KHÔNG resurrect trong bí cảnh

> Mẹo: Đem theo đan dược hồi máu + linh thú tank trước khi vào.`}],u=[{id:"basics",label:"Cơ Bản",icon:"◆"},{id:"cultivation",label:"Tu Luyện",icon:"✦"},{id:"combat",label:"Combat",icon:"⚔"},{id:"society",label:"Xã Hội",icon:"◈"},{id:"advanced",label:"Nâng Cao",icon:"☆"}],N=({open:a,onClose:o,initialEntryId:e})=>{const[i,h]=r.useState("basics"),[c,l]=r.useState(e??"getting-started"),d=r.useMemo(()=>g.filter(t=>t.category===i),[i]),s=r.useMemo(()=>g.find(t=>t.id===c)??g[0],[c]);return x({Escape:o},[o],a),a?n.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4",style:{background:"rgba(8,11,15,.85)",backdropFilter:"blur(4px)"},onClick:o,role:"dialog","aria-modal":"true","aria-labelledby":"handbook-title",children:n.jsx("div",{className:"relative w-full max-w-5xl",onClick:t=>t.stopPropagation(),style:{maxHeight:"90vh"},children:n.jsx(y,{className:"rounded-md border bg-ink-700",tone:"gold",children:n.jsxs("div",{className:"flex flex-col",style:{maxHeight:"85vh"},children:[n.jsxs("header",{className:"flex items-center justify-between border-b border-gold-700/15 px-6 py-4",children:[n.jsxs("div",{children:[n.jsx("div",{className:"label-section mb-1",children:"Wiki · Tu Tiên Toàn Thư"}),n.jsx("h2",{id:"handbook-title",className:"font-serif text-2xl font-bold uppercase tracking-wider text-gold-200",children:"Cẩm Nang Tu Tiên"})]}),n.jsx("button",{onClick:o,className:"rounded-sm p-2 text-2xl text-gold-300 transition-colors hover:text-gold-100","aria-label":"Đóng cẩm nang (Esc)",title:"Đóng (Esc)",children:"⊗"})]}),n.jsx("nav",{className:"flex gap-1 overflow-x-auto border-b border-gold-700/10 px-4 py-2",children:u.map(t=>n.jsxs("button",{onClick:()=>{h(t.id);const p=g.find(b=>b.category===t.id);p&&l(p.id)},className:"flex-shrink-0 rounded-sm px-3 py-2 text-[12.5px] transition-colors whitespace-nowrap",style:{color:i===t.id?"var(--gold-100)":"var(--gold-300)",background:i===t.id?"rgba(205,164,94,.1)":"transparent",borderBottom:i===t.id?"2px solid var(--gold-500)":"2px solid transparent"},children:[n.jsx("span",{className:"mr-1.5 text-[11px]",style:{color:"var(--gold-500)"},children:t.icon}),t.label]},t.id))}),n.jsxs("div",{className:"grid flex-1 overflow-hidden md:grid-cols-[220px_1fr]",children:[n.jsx("aside",{className:"overflow-y-auto border-r border-gold-700/10 p-3",style:{maxHeight:"60vh"},children:n.jsx("div",{className:"space-y-1",children:d.map(t=>n.jsxs("button",{onClick:()=>l(t.id),className:"flex w-full items-start gap-2 rounded-sm px-3 py-2 text-left text-[12.5px] transition-colors",style:{background:c===t.id?"rgba(205,164,94,.08)":"transparent",color:c===t.id?"var(--gold-100)":"var(--gold-300)",borderLeft:c===t.id?"2px solid var(--gold-500)":"2px solid transparent"},children:[n.jsx("span",{style:{color:"var(--gold-500)",fontSize:13},children:t.icon}),n.jsx("span",{className:"leading-tight",children:t.title})]},t.id))})}),n.jsxs("article",{className:"overflow-y-auto p-6",style:{maxHeight:"60vh"},children:[n.jsxs("div",{className:"mb-4 flex items-center gap-3",children:[n.jsx("span",{className:"text-3xl",style:{color:"var(--gold-500)"},children:s.icon}),n.jsxs("div",{children:[n.jsx("div",{className:"label-section",children:u.find(t=>t.id===s.category)?.label}),n.jsx("h3",{className:"font-serif text-xl font-semibold text-gold-200",children:s.title})]})]}),n.jsx("div",{className:"prose-handbook text-[14px] leading-relaxed text-gold-300",children:v(s.content)})]})]}),n.jsxs("footer",{className:"border-t border-gold-700/15 px-6 py-3 text-center text-[11px] italic text-jade-500",children:["Mở Cẩm Nang bất cứ lúc nào bằng nút ",n.jsx("kbd",{className:"rounded border border-gold-700/30 bg-ink-800 px-1.5 py-0.5 text-gold-300",children:"?"})," trên thanh navigation"]})]})})})}):null};function v(a){return a.split(/\n\n+/).map((e,i)=>{const h=e.trim();if(h.startsWith(">"))return n.jsx("blockquote",{className:"my-3 rounded-r-sm border-l-2 border-gold-500/40 bg-gold-500/5 px-4 py-2 text-[13px] italic text-gold-200",children:m(h.replace(/^>\s*/,""))},i);if(h.startsWith("- ")){const c=h.split(`
`).map(l=>l.replace(/^-\s*/,""));return n.jsx("ul",{className:"my-3 space-y-1.5 pl-5",children:c.map((l,d)=>n.jsx("li",{className:"list-disc text-[13.5px] text-gold-300 marker:text-gold-500/60",children:m(l)},d))},i)}return n.jsx("p",{className:"mb-3 text-[14px] leading-relaxed text-gold-300/95",children:m(h)},i)})}function m(a){return a.split(/(\*\*[^*]+\*\*)/g).map((e,i)=>e.startsWith("**")&&e.endsWith("**")?n.jsx("strong",{className:"font-semibold text-gold-100",children:e.slice(2,-2)},i):n.jsx("span",{children:e},i))}export{u as HANDBOOK_CATEGORIES,g as HANDBOOK_ENTRIES,N as HandbookModal,P as WelcomeOverlay,L as hasSeenTutorial,H as markTutorialSeen,M as resetAllTutorials};
//# sourceMappingURL=index-sDvs00dz.js.map
