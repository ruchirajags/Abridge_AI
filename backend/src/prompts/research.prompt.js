/**
 * Builds the prompt for the Gemini research stage.
 *
 * The prompt is deliberately constrained so the model stays concrete and
 * idea-specific instead of "overdoing" generic knowledge: hard caps on item
 * counts and length, and a rule against filler phrases.
 */
export function buildResearchPrompt(input, gh) {
  const languages = gh?.languages?.length
    ? gh.languages.slice(0, 5).map(l => `${l.language} (${l.count} repos)`).join(', ')
    : 'no public repo data (sample fallback)';

  return `You are a research analyst inside a project-planning studio. A developer submitted a project idea. Produce a short, concrete, independent research brief for THIS idea.

Project idea: "${input.idea}"
Project type: ${input.type || 'not specified'}
Target audience: ${input.audience || 'not specified'}
Deadline: ${input.deadline || 'not specified'}
Builder comfort level: ${input.comfort || 'not specified'}
Builder's top GitHub languages: ${languages}

Return ONLY strict JSON. No markdown fences, no commentary, no keys other than the four below:
{
  "opportunities": ["...", "...", "..."],
  "risks": ["...", "...", "..."],
  "directions": ["...", "..."],
  "builderSignal": "..."
}

Rules:
- Exactly 3 opportunities, 3 risks, 2 directions, 1 builderSignal.
- Every item MUST reference this specific idea, its type, audience, or deadline. One sentence, max 24 words, no leading numbering.
- Forbidden filler: "build a vertical slice", "scope carefully", "iterate quickly", "define an MVP" — say something specific instead.
- Be realistic. Never invent market data, competitors, or facts about the user.
- builderSignal: one sentence tying the builder's language history (or its absence) to the idea.`;
}