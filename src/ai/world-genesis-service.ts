/**
 * Phase 13.1D: World Genesis Service.
 *
 * Gọi AI sinh thế giới tu tiên mới từ user params, parse + validate qua Zod.
 * Mock fallback nếu không có API key.
 */

import { callAIJson } from './providers/router';
import {
  buildWorldGenesisPrompt,
  WorldGenesisSchema,
  type WorldGenesisInput,
  type WorldGenesisResult,
} from './prompts/world-genesis';
import { shouldUseMockAi } from './mock';

/**
 * Sinh world setting từ user input.
 * Throw nếu AI fail — caller cần try/catch.
 */
export const generateWorldGenesis = async (
  input: WorldGenesisInput,
): Promise<WorldGenesisResult> => {
  if (shouldUseMockAi()) {
    await new Promise((r) => setTimeout(r, 1200));
    return getMockWorldGenesis(input);
  }

  const prompt = buildWorldGenesisPrompt(input);
  return await callAIJson('auto', prompt, WorldGenesisSchema, {
    temperature: 1.1, // creative
    maxOutputTokens: 4000,
    purpose: 'analyze',
  });
};

/** Mock world genesis cho demo offline */
const getMockWorldGenesis = (input: WorldGenesisInput): WorldGenesisResult => {
  const tone = input.tone[0] ?? 'tươi sáng';
  return {
    worldName: 'Hỗn Nguyên Đại Thiên',
    tagline: 'Nơi vạn đạo cùng tồn, một niệm khởi sinh càn khôn.',
    setting:
      'Hỗn Nguyên Đại Thiên là vùng vũ trụ cổ xưa được sinh ra từ tan vỡ của Hồng Hoang Tổ Thiên. ' +
      'Mỗi hơi thở chứa nguyên khí thái cổ, mỗi tấc đất ẩn giấu di tích Đại Đế đời trước. ' +
      `Bầu không khí nhuốm màu ${tone}, người tu chân vừa khao khát đỉnh cao vừa đối diện vô số hiểm họa.`,
    theme: input.themes.length > 0 ? input.themes.join(' + ') : 'tu tiên huyền huyễn',
    currencyName: 'Hỗn Nguyên Thạch',
    realmList: [
      'Khai Nguyên', 'Linh Khu', 'Pháp Tướng', 'Đạo Cảnh',
      'Tiên Phẩm', 'Đại Năng', 'Hỗn Nguyên Tôn',
    ],
    cosmologyDescription:
      'Tu Hỗn Nguyên Khí từ Khai Nguyên cảnh, tiến lên Hỗn Nguyên Tôn — đỉnh cao kiểm soát một phương vũ trụ.',
    startingLocation: 'Hắc Phong sơn thôn',
    sects: [
      { name: 'Cửu Tinh Đạo Tông', alignment: 'chinh', description: 'Đại tông môn chính đạo, 9 sao chiếu thiên.', philosophy: 'Đạo pháp tự nhiên, nhân quả tuần hoàn.' },
      { name: 'Hắc Nguyệt Ma Đình', alignment: 'ma', description: 'Đại ma đình hắc nguyệt, tu hắc đạo bí pháp.' },
      { name: 'Thiên Phù Bảo Các', alignment: 'trung', description: 'Tổ chức luyện phù chế khí, trung lập trong tranh đoạt chính ma.' },
      { name: 'Hỗn Nguyên Khư', alignment: 'an', description: 'Cấm địa cổ, ẩn cư cao nhân Đại Năng.' },
    ],
    locations: [
      { name: 'Hắc Phong sơn thôn', category: 'Sơn thôn', description: 'Sơn thôn nhỏ phía Bắc, nơi nhân vật khởi đầu.' },
      { name: 'Cửu Tinh đại đô', category: 'Đô thị', description: 'Đô thị lớn nhất khu vực, có Cửu Tinh Đạo Tông trú ngụ.' },
      { name: 'Hỗn Nguyên cấm địa', category: 'Cấm địa', description: 'Vực cấm cổ chứa khí Hỗn Nguyên thuần khiết.' },
      { name: 'Hồng Hoang tàn tích', category: 'Cổ chiến trường', description: 'Tàn tích Hồng Hoang Tổ Thiên, đầy di vật cấm.' },
    ],
    npcs: [
      { name: 'Lý Khôi Nhược', role: 'Sư phụ tiềm năng', description: 'Lão tu sĩ ẩn cư Hắc Phong, từng là đệ tử Cửu Tinh Đạo Tông.' },
      { name: 'Mộ Dung Phong', role: 'Đối thủ', description: 'Thiên tài cùng thôn, kình địch nhân vật chính.' },
      { name: 'Tiêu Vũ Yên', role: 'Tri kỷ tiềm năng', description: 'Cô gái Thiên Phù Bảo Các, có duyên với nhân vật.' },
      { name: 'Hắc Y khách', role: 'Bí ẩn', description: 'Người áo đen xuất hiện đột ngột, mang theo huyền cơ.' },
    ],
    items: [
      { name: 'Hỗn Nguyên Châu', category: 'Pháp bảo', rarity: 'Huyền Thoại', description: 'Châu chứa khí Hỗn Nguyên cổ, vũ khí tối thượng.' },
      { name: 'Cửu Tinh Phù', category: 'Tín vật', rarity: 'Hiếm', description: 'Phù lệnh đệ tử Cửu Tinh Đạo Tông.' },
      { name: 'Hắc Nguyệt Đan', category: 'Đan dược', rarity: 'Cực Phẩm', description: 'Đan dược ma đạo tăng tu vi nhanh.' },
    ],
    skills: [
      { name: 'Hỗn Nguyên Quyết', kind: 'adventure', rarity: 'Huyền Thoại', description: 'Pháp môn cơ bản tu Hỗn Nguyên Khí.' },
      { name: 'Cửu Tinh Liên Châu', kind: 'combat_ultimate', rarity: 'Cực Phẩm', description: '9 sao nối nhau, áp chế địch trong vạn dặm.' },
      { name: 'Hắc Nguyệt Trảm', kind: 'combat_basic', rarity: 'Hiếm', description: 'Trảm pháp hắc nguyệt, cắt đứt hồn phách.' },
    ],
    terminology: [
      { term: 'Hỗn Nguyên Khí', kind: 'other', explanation: 'Khí nguyên thủy thuần khiết, gốc của vạn pháp.' },
      { term: 'Khai Nguyên', kind: 'realm_term', explanation: 'Cảnh giới khởi đầu, mở 36 nguyên khiếu.' },
      { term: 'Hỗn Nguyên Tôn', kind: 'realm_term', explanation: 'Đỉnh cao truyền thuyết, kiểm soát một phương vũ trụ.' },
      { term: 'Đại Năng', kind: 'realm_term', explanation: 'Cảnh giới giáp ranh Tiên, sức mạnh khôn lường.' },
    ],
    suggestedBackstories: [
      'Cô nhi Hắc Phong sơn thôn được Lý Khôi Nhược cứu, học pháp môn cơ bản.',
      'Đệ tử ngoại môn Cửu Tinh Đạo Tông sa cơ về thôn nhỏ, tìm cơ hội phục hưng.',
      'Khách lữ hành lạc vào Hỗn Nguyên cấm địa, vô tình lấy được di vật cổ.',
    ],
  };
};
