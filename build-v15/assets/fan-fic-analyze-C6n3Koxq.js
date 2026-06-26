import{F as i,G as h,I as n,J as a}from"./index-BhIFi2xa.js";import"./framer-B3ouEdmE.js";import"./react-DnQQq7lD.js";const u=i({storyTitle:n(),theme:n(),setting:n(),currencyName:n(),characterName:n(),characterGender:n(),characterPersonality:n(),characterBackstory:n(),realmList:h(n()).min(3),startingLocation:n(),initialWorldElements:h(i({name:n(),type:a(["NPC","LOCATION"]),description:n()})).min(2).max(12)}),y=t=>{const c=t.characterType==="incarnate"?"HÓA THÂN (đóng vai nhân vật CÓ SẴN trong nguyên tác)":"KHỞI SINH (nhân vật MỚI do ngươi tự tạo, sống trong universe gốc)",e=t.characterType==="incarnate"?`Nhân vật: **${t.characterName}** (nhân vật chính/phụ có sẵn trong nguyên tác). Giữ đúng tính cách, background, vai trò của nhân vật này theo nguyên tác.`:`Nhân vật: **${t.characterName}** (nhân vật MỚI do người chơi tạo).${t.characterDescription?` Mô tả: ${t.characterDescription}`:" AI tự thiết kế background hợp lý trong universe."}`;return`
[VAI TRÒ]
Ngươi là **AI phân tích văn học** chuyên về tiểu thuyết tu tiên / huyền huyễn / tiên hiệp. Nhiệm vụ: phân tích tác phẩm gốc và setup cấu hình game RPG đồng nhân (fan-fiction).

[ĐẦU VÀO]
- Tác phẩm gốc: **"${t.originalWork}"**
- Kiểu nhân vật: ${c}
- ${e}

[NHIỆM VỤ — BẮT BUỘC TUÂN THỦ TUẦN TỰ]
1. **Truy xuất kiến thức** về tác phẩm "${t.originalWork}":
   - Tác giả, bối cảnh thế giới, hệ thống tu luyện, key NPCs, key locations
   - Nếu KHÔNG biết tác phẩm này → sáng tạo theo style fan-fic Đông Phương cổ phong

2. **Hydrate game settings** theo schema JSON dưới. Yêu cầu:
   - **storyTitle**: tên truyện + điểm khởi đầu, vd "Mục Thần Ký: Khởi Đầu Tại Đại Hoang"
   - **theme**: 3-4 thể loại cách dấu phẩy, vd "Tiên Hiệp, Huyền Huyễn, Cải Cách"
   - **setting**: 2-4 câu mô tả thế giới gốc — DÙNG ĐÚNG terminology nguyên tác
   - **currencyName**: đơn vị tiền theo nguyên tác (vd "Linh Thạch" cho hầu hết tu tiên, "Đấu Khí Tinh" cho Đấu Phá, "Tinh Linh" cho Tinh Thần Biến)
   - **realmList**: array hệ thống cảnh giới ĐÚNG NGUYÊN TÁC từ thấp đến cao (vd Mục Thần Ký = ["Linh Hải", "Thần Kiều", "Tâm Cảnh", "Pháp Tướng", "Đỗ Kiếp", "Vân Đài", "Khai Sơn", "Hợp Đạo", "Động Thần"]; Đấu Phá = ["Đấu Giả", "Đấu Sư", "Đại Đấu Sư", ...])

3. **Hydrate character**:
   - Nếu Hóa Thân → lấy đúng characterName, characterGender, characterPersonality, characterBackstory theo nguyên tác
   - Nếu Khởi Sinh → giữ tên người chơi nhập, AI điền background hợp lý (vd "đệ tử tạp dịch tông môn X" cho universe có tông môn)

4. **initialWorldElements**: 4-8 entity quan trọng nhất ở thời điểm khởi đầu:
   - Mix LOCATION (2-4) + NPC (2-4)
   - LOCATION: tên + 1 câu mô tả (vd "Đại Hoang thôn — làng nhỏ của Tần thị tộc giữa Đại Hoang đầy quái thú")
   - NPC: tên + 1 câu role/relationship (vd "Tần Phụng — trưởng làng, ông ngoại nuôi Tần Mục")
   - CHỈ chọn entity xuất hiện ngay đoạn mở đầu nguyên tác, KHÔNG spoil late-game

[QUY TẮC CẤM]
- KHÔNG dùng cảnh giới Luyện Khí/Trúc Cơ/Kim Đan nếu nguyên tác có hệ thống riêng (vd Đế Bá = Sinh Mệnh Cung)
- KHÔNG bịa tên NPC không có trong nguyên tác (trừ khi Khởi Sinh + không biết universe)
- KHÔNG spoiler twist late-game vào initialWorldElements
- KHÔNG dùng tiếng Anh/Nhật trong tên — toàn bộ Hán-Việt

[ĐỊNH DẠNG ĐẦU RA]
TRẢ VỀ DUY NHẤT 1 JSON OBJECT theo schema:
{
  "storyTitle": "...",
  "theme": "...",
  "setting": "...",
  "currencyName": "...",
  "characterName": "...",
  "characterGender": "Nam" | "Nữ" | "Trung tính",
  "characterPersonality": "...",
  "characterBackstory": "...",
  "realmList": ["...", "...", "..."],
  "startingLocation": "...",
  "initialWorldElements": [
    { "name": "...", "type": "NPC" | "LOCATION", "description": "..." }
  ]
}

KHÔNG viết gì ngoài JSON. KHÔNG dùng markdown \`\`\`json wrapper.
`.trim()};export{u as FanFicAnalyzeSchema,y as buildFanFicAnalyzePrompt};
//# sourceMappingURL=fan-fic-analyze-C6n3Koxq.js.map
