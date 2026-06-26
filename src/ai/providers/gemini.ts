/**
 * Gemini provider — wrapper quanh callGemini() từ client.ts.
 * Provider interface adapter cho router callAI().
 */

import type { z } from 'zod';
import type { AIProvider, CallOptions } from './types';
import { callGemini, getKeyCount, isUsingProxy } from '../client';

export const geminiProvider: AIProvider = {
  name: 'gemini',
  isAvailable: () => isUsingProxy() || getKeyCount() > 0,
  async call(prompt: string, opts: CallOptions = {}) {
    return await callGemini(prompt, opts);
  },
  async callJson<T>(prompt: string, schema: z.ZodSchema<T>, opts: CallOptions = {}) {
    return await callGemini(prompt, {
      ...opts,
      schema,
      responseMimeType: 'application/json',
    });
  },
};
