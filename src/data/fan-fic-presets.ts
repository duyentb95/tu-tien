/**
 * @deprecated File này đã bị thay thế bởi:
 *   - `src/data/fan-fic-seeds.ts` — seed examples cho autocomplete
 *   - `src/ai/prompts/fan-fic-analyze.ts` — wizard prompt + JSON schema
 *
 * Lý do refactor: prototype gốc KHÔNG dùng preset cứng cho mỗi universe (maintenance
 * burden + dễ sai như case Vạn Cổ Tối Cường Tông). Thay vào đó dùng wizard 3 fields
 * + AI analyzer hydrate setting + initialWorldElements động.
 *
 * Có thể xóa file này thủ công khi sandbox cho phép.
 * Không export gì để TS warning ai còn import.
 */

export {};
