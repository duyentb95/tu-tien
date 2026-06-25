import { describe, it, expect } from 'vitest';
import { parseNarrativeResponse } from './parser';

describe('parseNarrativeResponse', () => {
  it('Parse narrative + 4 actions chuẩn', () => {
    const raw = `<narrative>
Sương sớm bao phủ ngọn Thanh Vân Phong. Ngươi mở mắt, cảm nhận linh khí mỏng manh xung quanh.
</narrative>

[ACTION:1] Vận khí tu luyện ngay tại chỗ
[ACTION:2] Xuống núi tìm hiểu tin tức
[ACTION:3] Kiểm tra túi trữ vật
[ACTION:4] Tìm sư phụ vấn an`;

    const r = parseNarrativeResponse(raw);
    expect(r.actions).toHaveLength(4);
    expect(r.actions[0]).toContain('Vận khí');
    expect(r.segments).toHaveLength(1);
    expect(r.segments[0]).toMatchObject({ type: 'narrative' });
  });

  it('Parse narrative có dialogue bubble', () => {
    const raw = `<narrative>
Một lão giả áo xanh tiến lại gần.
<dialogue speaker="Lão Giả">Tiểu hữu trông có khí chất khác lạ.</dialogue>
Ngươi cảnh giác lùi một bước.
</narrative>

[ACTION:1] Cảm tạ
[ACTION:2] Hỏi danh xưng`;

    const r = parseNarrativeResponse(raw);
    expect(r.segments).toHaveLength(3);
    expect(r.segments[1]).toMatchObject({ type: 'dialogue', speaker: 'Lão Giả' });
    expect(r.actions).toHaveLength(2);
  });

  it('Fallback khi AI quên thẻ <narrative>', () => {
    const raw = `Tiếng kiếm vọng giữa hư không.

[ACTION:1] Rút kiếm
[ACTION:2] Tránh né`;
    const r = parseNarrativeResponse(raw);
    expect(r.segments[0]).toMatchObject({ type: 'narrative' });
    expect(r.actions).toHaveLength(2);
  });

  it('Empty input không crash', () => {
    const r = parseNarrativeResponse('');
    expect(r.segments).toHaveLength(0);
    expect(r.actions).toHaveLength(0);
  });
});
