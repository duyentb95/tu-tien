# core/

**Logic game thuần.** Không import React. Không gọi Firebase/fetch. Test 100% bằng Vitest.

| Folder | Trách nhiệm |
|---|---|
| `stats/` | calculateFinalStats, leveling, realms, AP allocation |
| `combat/` | damage formulas, status effects, turn order, AI action heuristics |
| `items/` | rarity distribution, budget, crafting, pricing |
| `cultivation/` ★ | linh căn, công pháp, độ kiếp, tâm cảnh |
| `world/` ★ | map graph, locations, secret realms, time |
| `society/` ★ | sects, relationships, reputation, vendetta |

★ = thêm mới ngoài prototype.
