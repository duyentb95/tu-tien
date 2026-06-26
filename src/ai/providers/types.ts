/**
 * AI Provider abstraction — Phase 8.1 Strategy B Hybrid.
 *
 * Mục đích: tách interface khỏi implementation, cho phép call AI theo provider
 * động (Gemini cho Logic Engine, DeepSeek cho Narrative Engine).
 *
 * Provider mới chỉ cần implement interface này → router callAI() tự xử lý.
 */

import type { z } from 'zod';

export type ProviderName = 'gemini' | 'deepseek';

export interface CallOptions {
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: 'text/plain' | 'application/json';
  signal?: AbortSignal;
  /** Gemini-only: 0 = disable thinking. DeepSeek bỏ qua. */
  thinkingBudget?: number;
}

export interface AIProvider {
  /** Tên provider — log + UI hiển thị */
  name: ProviderName;
  /** Có sẵn không (key configured)? */
  isAvailable(): boolean;
  /**
   * Call AI với prompt + opts. Trả raw text.
   * Throw khi tất cả keys + retries exhausted.
   */
  call(prompt: string, opts?: CallOptions): Promise<string>;
  /**
   * Call AI với JSON schema validation. Trả parsed object.
   * Auto inject responseMimeType: 'application/json'.
   */
  callJson<T>(prompt: string, schema: z.ZodSchema<T>, opts?: CallOptions): Promise<T>;
}

/** Helper: check provider có available không qua env */
export const checkEnvKey = (envKey: string): boolean => {
  const env = import.meta.env as Record<string, string | undefined>;
  if (env[envKey] && env[envKey] !== '') return true;
  // Check numbered variants
  for (let i = 1; i <= 10; i++) {
    if (env[`${envKey}_${i}`]) return true;
  }
  // Check proxy URL
  if (env.VITE_AI_PROXY_URL) return true; // proxy handles either provider
  return false;
};
