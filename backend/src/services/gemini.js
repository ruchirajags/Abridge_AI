import { hash } from '../utils/hash.js';
import { buildResearchPrompt } from '../prompts/research.prompt.js';

const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// In-process cache keyed by an idea hash so identical inputs are never
// re-billed and repeat runs stay deterministic for the same cache lifetime.
const cache = new Map();

function parseJson(raw) {
  if (!raw) return null;
  const cleaned = String(raw)
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '');
  try { return JSON.parse(cleaned); } catch { return null; }
}

/**
 * Run the research stage against the Gemini API.
 * Returns the raw parsed JSON object, or null when no key / request fails —
 * callers fall back to the deterministic agent in that case.
 */
export async function runResearchLLM(input, gh) {
  if (!API_KEY) return null;

  const seed = hash(
    (input.idea || '') + '|' +
    (input.stack || '') + '|' +
    (input.type || '') + '|' +
    (input.deadline || '') + '|' +
    (gh?.profile?.login || ''),
  );
  if (cache.has(seed)) return cache.get(seed);

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildResearchPrompt(input, gh) }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });
    if (!res.ok) {
      console.error(`[gemini] API ${res.status}:`, await res.text().catch(() => ''));
      return null;
    }
    const data = await res.json();
    const raw = (data?.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || '')
      .join('');
    const parsed = parseJson(raw);
    if (!parsed) return null;

    cache.set(seed, parsed);
    return parsed;
  } catch (err) {
    console.error('[gemini] request failed:', err);
    return null;
  }
}

export function clearResearchCache() {
  cache.clear();
}