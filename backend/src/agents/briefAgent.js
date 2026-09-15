import { buildBriefModel } from '../brief/model.js';
import { renderText } from '../brief/render.js';

/**
 * Brief stage. Composes the canonical brief model from the pipeline context
 * (structured results only — no text slicing) and returns the model plus the
 * rendered text used on screen and in exports.
 */
export function runBriefAgent(ctx) {
  const brief = buildBriefModel(ctx);
  return { ...brief, text: renderText(brief) };
}