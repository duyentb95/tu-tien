/**
 * AI Provider Router — Phase 8.1.
 *
 * Route call AI sang đúng provider (Gemini hoặc DeepSeek) theo settings.
 * Auto-fallback nếu primary provider không available.
 *
 * Usage:
 *   await callAI('gemini', prompt, opts)
 *   await callAIJson('deepseek', prompt, schema, opts)
 *
 * Hoặc dùng 'auto' để smart-pick:
 *   await callAI('auto', prompt, { purpose: 'narrative' }) // → DeepSeek nếu có, else Gemini
 *   await callAI('auto', prompt, { purpose: 'logic' })     // → Gemini (cheaper + JSON tốt)
 */

import type { z } from 'zod';
import type { AIProvider, ProviderName, CallOptions } from './types';
import { geminiProvider } from './gemini';
import { deepseekProvider } from './deepseek';

export type RouteSelector = ProviderName | 'auto';

export interface RouteOptions extends CallOptions {
  /** Khi route='auto': hint AI smart pick */
  purpose?: 'logic' | 'narrative' | 'analyze';
}

const providers: Record<ProviderName, AIProvider> = {
  gemini: geminiProvider,
  deepseek: deepseekProvider,
};

/** Pick provider theo route + purpose + availability. Throw nếu không có provider khả dụng */
const pickProvider = (route: RouteSelector, purpose?: 'logic' | 'narrative' | 'analyze'): AIProvider => {
  if (route !== 'auto') {
    const p = providers[route];
    if (p.isAvailable()) return p;
    // Fallback: nếu route chỉ định không available → thử provider khác
    const fallback = route === 'gemini' ? providers.deepseek : providers.gemini;
    if (fallback.isAvailable()) {
      console.warn(`[ai/router] ${route} không khả dụng, fallback ${fallback.name}`);
      return fallback;
    }
    throw new Error(`[ai/router] ${route} không khả dụng và không có fallback. Set env API key.`);
  }

  // route === 'auto' — smart pick theo purpose
  if (purpose === 'narrative' && deepseekProvider.isAvailable()) {
    return deepseekProvider; // DeepSeek viết văn tu tiên đẹp hơn
  }
  if (purpose === 'logic' && geminiProvider.isAvailable()) {
    return geminiProvider; // Gemini Flash rẻ + JSON structured tốt
  }
  // Default: Gemini nếu có, else DeepSeek
  if (geminiProvider.isAvailable()) return geminiProvider;
  if (deepseekProvider.isAvailable()) return deepseekProvider;
  throw new Error('[ai/router] Không provider nào khả dụng. Set VITE_GEMINI_API_KEY hoặc VITE_DEEPSEEK_API_KEY.');
};

/** Call AI với route + options. Trả raw text. */
export async function callAI(
  route: RouteSelector,
  prompt: string,
  opts: RouteOptions = {},
): Promise<string> {
  const { purpose, ...callOpts } = opts;
  const provider = pickProvider(route, purpose);
  try {
    return await provider.call(prompt, callOpts);
  } catch (err) {
    // Last-resort: nếu primary fail, thử provider khác (nếu chưa thử)
    const fallback = provider.name === 'gemini' ? providers.deepseek : providers.gemini;
    if (fallback.isAvailable() && fallback.name !== provider.name) {
      console.warn(`[ai/router] ${provider.name} fail, last-resort fallback ${fallback.name}:`, err);
      return await fallback.call(prompt, callOpts);
    }
    throw err;
  }
}

/** Call AI với JSON schema validation. */
export async function callAIJson<T>(
  route: RouteSelector,
  prompt: string,
  schema: z.ZodSchema<T>,
  opts: RouteOptions = {},
): Promise<T> {
  const { purpose, ...callOpts } = opts;
  const provider = pickProvider(route, purpose);
  try {
    return await provider.callJson(prompt, schema, callOpts);
  } catch (err) {
    const fallback = provider.name === 'gemini' ? providers.deepseek : providers.gemini;
    if (fallback.isAvailable() && fallback.name !== provider.name) {
      console.warn(`[ai/router] ${provider.name} JSON fail, fallback ${fallback.name}:`, err);
      return await fallback.callJson(prompt, schema, callOpts);
    }
    throw err;
  }
}

/** UI helper: list provider available status */
export const getProviderStatus = (): Array<{ name: ProviderName; available: boolean }> => {
  return (['gemini', 'deepseek'] as ProviderName[]).map((name) => ({
    name,
    available: providers[name].isAvailable(),
  }));
};
