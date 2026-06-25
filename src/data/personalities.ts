/**
 * Personality + writing options — port từ prototype `PREVIEW.md:3569`.
 */

export const PLAYER_PERSONALITIES = [
  'Trầm ổn, ít nói, nhìn xa trông rộng',
  'Nhiệt tình, hào sảng, trọng nghĩa khinh tài',
  'Lạnh lùng, tàn nhẫn, làm việc dứt khoát',
  'Ranh mãnh, thâm trầm, mọi chuyện đều có toan tính',
  'Vui vẻ, lạc quan, thích đùa giỡn',
  'Cao ngạo, khinh người, tự tin vào năng lực bản thân',
  'Nhân hậu, từ bi, không nỡ giết người',
  'Hiếu chiến, máu lửa, gặp chuyện là động thủ',
] as const;

export const WRITING_STYLES = [
  'Cổ phong nhẹ nhàng, từ ngữ thanh tao',
  'Tu chân nghiêm trang, đặc tả cảnh giới',
  'Huyền huyễn kỳ ảo, đậm yếu tố thần thoại',
  'Đô thị tu tiên, có yếu tố hiện đại',
  'Hắc ám, tàn khốc, máu lửa',
  'Hài hước, châm biếm, không nghiêm túc',
] as const;

export const NARRATOR_PRONOUNS = [
  'Để AI quyết định',
  'Ngươi',
  'Ngài',
  'Tại hạ',
  'Bổn tọa',
  'Bần đạo',
] as const;

export const GENDERS = ['Nam', 'Nữ', 'Không xác định'] as const;
