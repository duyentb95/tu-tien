import { callGemini } from './client';
import { buildNarrativePrompt, type NarrativeContext } from './prompts/narrative';
import { parseNarrativeResponse, type ParsedNarrative } from './parser';
import { getMockNarrative, shouldUseMockAi } from './mock';
// Phase 8.1: multi-provider router (Gemini + DeepSeek hybrid)
import { callAI, callAIJson } from './providers/router';
// Hybrid Logic Engine pipeline lazy-loaded — chỉ tải khi user thực sự chơi
// (initial screen + setup không cần) → tiết kiệm ~60KB initial bundle.

/**
 * Cấp cao nhất — feature gọi hàm này, không cần biết Gemini vs mock vs hybrid.
 *
 * Pipeline (theo prototype "Hybrid Xúc Xắc"):
 *   1. Mock fallback nếu chưa có Gemini key
 *   2. Hybrid mode (default): Logic Engine → Dice → Narrative Engine → combine
 *   3. Legacy single-call mode: 1 prompt làm hết (fallback nếu hybrid fail)
 *   4. Catch all → mock fallback (giữ UX smooth)
 *
 * Toggle qua settings.useHybridLogic (default true).
 */
export const generateNarrative = async (
  ctx: NarrativeContext,
): Promise<ParsedNarrative> => {
  // ─── Mock fallback (no API key) ───
  if (shouldUseMockAi()) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 700));
    const raw = getMockNarrative(!!ctx.isOpening, ctx);
    return parseNarrativeResponse(raw);
  }

  const useHybrid = (ctx.settings as { useHybridLogic?: boolean }).useHybridLogic !== false;

  if (useHybrid) {
    try {
      return await generateNarrativeHybrid(ctx);
    } catch (err) {
      console.warn('[narrative-service] Hybrid fail, fallback single-call:', err);
      // Tiếp tục fallback single-call dưới
    }
  }

  // ─── Legacy single-call (fallback) ───
  try {
    const prompt = buildNarrativePrompt(ctx);
    const raw = await callGemini(prompt, { temperature: 0.95, maxOutputTokens: 2500 });
    return parseNarrativeResponse(raw);
  } catch (err) {
    console.warn('[narrative-service] AI fail, fallback mock:', err);
    const raw = getMockNarrative(!!ctx.isOpening, ctx);
    const parsed = parseNarrativeResponse(raw);
    return { ...parsed, isFallback: true };
  }
};

/**
 * Hybrid mode: 2-step Logic Engine + Narrative Engine.
 *
 * Step 1: Logic call → 6 scenarios JSON
 * Step 2: Dice roll → pick 1 scenario theo probability
 * Step 3: Narrative call → văn phong cho scenario chosen
 * Step 4: Combine raw = <narrative>{text}</narrative> + commands + actions
 *           → parse như bình thường để tag-parser apply state mutations
 */
const generateNarrativeHybrid = async (ctx: NarrativeContext): Promise<ParsedNarrative> => {
  const t0 = Date.now();

  // Lazy load hybrid modules — chỉ tải lần đầu khi cần
  const [
    { buildLogicEnginePrompt, LogicResponseSchema },
    { buildNarrativeEnginePrompt },
    { pickScenarioByDice, formatScenariosTable },
  ] = await Promise.all([
    import('./prompts/logic-engine'),
    import('./prompts/narrative-engine'),
    import('@core/dice/scenario-roller'),
  ]);

  ctx.onPhase?.('logic');

  // ─── Step 1: Logic Engine ───
  const logicCtx = {
    settings: ctx.settings,
    player: ctx.player,
    recentHistory: ctx.recentHistory,
    ...(ctx.realm !== undefined ? { realm: ctx.realm } : {}),
    ...(ctx.lastAction !== undefined ? { lastAction: ctx.lastAction } : {}),
    ...(ctx.currentLocation !== undefined ? { currentLocation: ctx.currentLocation } : {}),
    ...(ctx.isOpening !== undefined ? { isOpening: ctx.isOpening } : {}),
    difficulty: ctx.settings.difficulty,
    // Pass lore context để AI tag WORLD_* với loreId đúng
    ...(ctx.loreNpcs ? { loreNpcs: ctx.loreNpcs } : {}),
    ...(ctx.loreLocations ? { loreLocations: ctx.loreLocations } : {}),
    ...(ctx.worldNpcs ? { worldNpcs: ctx.worldNpcs } : {}),
    ...(ctx.worldLocations ? { worldLocations: ctx.worldLocations } : {}),
    // Memory expand (Refactor 5)
    ...(ctx.meaningfulEvents ? { meaningfulEvents: ctx.meaningfulEvents } : {}),
    ...(ctx.customRules ? { customRules: ctx.customRules } : {}),
    // Phase 8.3: Fan-fic items + skills hints
    ...(ctx.fanFicItems ? { fanFicItems: ctx.fanFicItems } : {}),
    ...(ctx.fanFicSkills ? { fanFicSkills: ctx.fanFicSkills } : {}),
    // Phase 9.2: Cultivation terms
    ...(ctx.fanFicTerms ? { fanFicTerms: ctx.fanFicTerms } : {}),
  };
  const logicPrompt = buildLogicEnginePrompt(logicCtx);
  // Phase 8.1: Logic Engine — default Gemini (rẻ + JSON structured tốt)
  const logicProvider = (ctx.settings as { aiProviderLogic?: 'gemini' | 'deepseek' | 'auto' }).aiProviderLogic ?? 'gemini';
  const logicResp = await callAIJson(logicProvider, logicPrompt, LogicResponseSchema, {
    temperature: 0.85,
    maxOutputTokens: 2500,
    purpose: 'logic',
  });
  const t1 = Date.now();

  if (!logicResp.scenarios || logicResp.scenarios.length === 0) {
    throw new Error('[hybrid] Logic Engine trả 0 scenarios');
  }

  console.info(
    `[hybrid] Logic OK ${t1 - t0}ms, ${logicResp.scenarios.length} scenarios:\n${formatScenariosTable(logicResp.scenarios)}`,
  );

  // ─── Step 2: Dice Roll ───
  const pick = pickScenarioByDice(logicResp.scenarios);
  console.info(
    `[hybrid] 🎲 Rolled ${pick.roll.toFixed(3)} → #${pick.index + 1} (${Math.round(pick.pickedProbability * 100)}% prob): ${pick.scenario.summary.slice(0, 60)}...`,
  );

  ctx.onPhase?.('narrative');

  // ─── Step 3: Narrative Engine ───
  const narrativePrompt = buildNarrativeEnginePrompt({
    scenario: pick.scenario,
    settings: ctx.settings,
    player: ctx.player,
    recentHistory: ctx.recentHistory,
    ...(ctx.realm !== undefined ? { realm: ctx.realm } : {}),
    ...(ctx.lastAction !== undefined ? { lastAction: ctx.lastAction } : {}),
    ...(ctx.isOpening !== undefined ? { isOpening: ctx.isOpening } : {}),
  });
  // Phase 8.1: Narrative Engine — default 'auto' (DeepSeek nếu có, else Gemini)
  // DeepSeek viết văn tu tiên Trung-Việt đẹp hơn rõ rệt
  const narrativeProvider = (ctx.settings as { aiProviderNarrative?: 'gemini' | 'deepseek' | 'auto' }).aiProviderNarrative ?? 'auto';
  const narrativeText = await callAI(narrativeProvider, narrativePrompt, {
    temperature: 1.0,
    maxOutputTokens: 2500,
    purpose: 'narrative',
  });
  const t2 = Date.now();

  console.info(`[hybrid] Narrative OK ${t2 - t1}ms (total ${t2 - t0}ms) — provider: ${narrativeProvider}`);

  // ─── Step 4: Combine raw text ───
  // Narrative engine trả <narrative>...</narrative> + [ACTION:1]...[ACTION:4]
  // Scenario commands chứa các game tags ([EXP+], [ITEM]...) cần apply.
  // Combine: insert commands GIỮA </narrative> và [ACTION:1] để tag-parser thấy.
  const combinedRaw = mergeCommandsIntoRaw(narrativeText, pick.scenario.commands);

  return parseNarrativeResponse(combinedRaw);
};

/**
 * Insert scenario.commands vào raw narrative text giữa </narrative> và [ACTION:1].
 * Nếu narrative không có </narrative> tag → append commands trước [ACTION:1].
 * Nếu cũng không có ACTION → append cuối.
 */
const mergeCommandsIntoRaw = (narrativeText: string, commands: string): string => {
  const trimmedCmds = (commands ?? '').trim();
  if (!trimmedCmds) return narrativeText;

  // Try insert after </narrative>
  const closeNarrativeIdx = narrativeText.indexOf('</narrative>');
  if (closeNarrativeIdx >= 0) {
    const beforeAndTag = narrativeText.slice(0, closeNarrativeIdx + '</narrative>'.length);
    const after = narrativeText.slice(closeNarrativeIdx + '</narrative>'.length);
    return `${beforeAndTag}\n\n${trimmedCmds}\n${after}`;
  }

  // Try insert before [ACTION:1]
  const actionIdx = narrativeText.search(/\[ACTION:\s*1/);
  if (actionIdx >= 0) {
    return `${narrativeText.slice(0, actionIdx)}\n${trimmedCmds}\n\n${narrativeText.slice(actionIdx)}`;
  }

  // Fallback: append cuối
  return `${narrativeText}\n\n${trimmedCmds}`;
};
