import { hash, pick } from '../utils/hash.js';
import { STACKS, PROJECT_TYPES, TEAM_SIZES } from '../utils/export.js';

const FEAS_RISKS = [
  { risk: 'Feature creep pulls the timeline out.', fix: 'Freeze scope after the foundation phase and ship the vertical slice.' },
  { risk: 'Integration friction with existing workflows blocks adoption.', fix: 'Design a paste-ready output and a copyable CLI from day one.' },
  { risk: 'Underspecified inputs produce unreliable outputs.', fix: 'Define the input contract explicitly in the first milestone.' },
  { risk: 'Solo support load grows faster than the feature set.', fix: 'Keep the surface area small; automate errors and self-help.' },
  { risk: 'The stack is unfamiliar at this comfort level.', fix: 'Use the scaffolded starter files and step-by-step notes for the first week.' },
  { risk: 'Deadline is tight relative to scope.', fix: 'Scope down to a strict MVP; defer everything non-essential to v2.' },
];

function padScore(n, max) {
  let s = String(n);
  while (s.length < String(max).length) s = ' ' + s;
  return s + '/' + max;
}

// ── Deadline parsing ──────────────────────────────────────────────────────────
/**
 * Normalize a free-text deadline string into a structured result.
 *
 * Returns:
 *   { days: number | null, label: string, kind: 'days'|'weeks'|'months'|'vague'|'empty' }
 *
 * - days: total calendar days represented, or null if unparseable / not given.
 * - label: human-readable form used in the score breakdown line.
 * - kind:  'empty'  — no deadline entered
 *          'days'   — N days parsed
 *          'weeks'  — N weeks parsed
 *          'months' — N months parsed
 *          'vague'  — non-empty but could not be reliably converted to a duration
 */
export function parseDeadline(raw) {
  const s = String(raw || '').trim();

  if (!s) {
    return { days: null, label: 'no deadline', kind: 'empty' };
  }

  const lower = s.toLowerCase();

  // Match patterns like "3 months", "1month", "2.5 months"
  const monthMatch = lower.match(/^(\d+(?:\.\d+)?)\s*months?$/);
  if (monthMatch) {
    const n = parseFloat(monthMatch[1]);
    return { days: Math.round(n * 30), label: s, kind: 'months' };
  }

  // Match patterns like "4 weeks", "1week", "2.5 weeks"
  const weekMatch = lower.match(/^(\d+(?:\.\d+)?)\s*weeks?$/);
  if (weekMatch) {
    const n = parseFloat(weekMatch[1]);
    return { days: Math.round(n * 7), label: s, kind: 'weeks' };
  }

  // Match patterns like "6 days", "1day"
  const dayMatch = lower.match(/^(\d+(?:\.\d+)?)\s*days?$/);
  if (dayMatch) {
    const n = parseFloat(dayMatch[1]);
    return { days: Math.round(n), label: s, kind: 'days' };
  }

  // Anything else (natural language, abbreviations, bare numbers without unit, etc.)
  // is treated as vague rather than silently assigned an arbitrary value.
  return { days: null, label: s, kind: 'vague' };
}

/**
 * Convert a parsed deadline into the Time Realism feasibility score (max 15).
 *
 * Scoring rationale:
 *   ≤  7 days  →  6  Very tight; high execution risk for any scope.
 *   8–14 days  →  9  Short sprint; achievable only for a very narrow problem.
 *  15–31 days  → 12  Healthy 2–4 week sprint; good MVP runway.
 *  32–90 days  → 14  1–3 months; comfortable buffer with room for iteration.
 *   > 90 days  → 13  Long horizon; introduces scope-drift risk, slight penalty.
 *   empty      →  8  No commitment signal; same as original.
 *   vague      → 10  Non-empty but unparseable; explicit middle-ground.
 */
function deadlineScore(parsed) {
  if (parsed.kind === 'empty')  return 8;
  if (parsed.kind === 'vague')  return 10;

  const d = parsed.days;
  if (d <= 7)  return 6;
  if (d <= 14) return 9;
  if (d <= 31) return 12;
  if (d <= 90) return 14;
  return 13;
}

// ── Main agent ────────────────────────────────────────────────────────────────
export function runFeasibilityAgent(input) {
  const idea = String(input.idea || '').trim();
  const words = idea ? idea.split(/\s+/).length : 0;
  const audience = String(input.audience || '').trim();
  const comfort = input.comfort || 'beginner';
  const typeKey = PROJECT_TYPES[input.type] ? input.type : 'unsure';
  const teamKey = TEAM_SIZES[input.team] ? input.team : 'solo';
  const hasCustomStack = !!input.customStack;

  const deadline = parseDeadline(input.deadline);

  // Five scoring axes
  const clarity    = Math.min(30, Math.floor(words * 0.5) + (audience ? 3 : 0));
  const stackFit   = comfort === 'advanced' ? 25 : comfort === 'intermediate' ? 20 : 15;
  const scope      = { tool: 20, 'data-pipeline': 18, service: 15, 'web-app': 14, unsure: 10 }[typeKey] ?? 10;
  const time       = deadlineScore(deadline);
  const builderFit = (input.stack && input.stack !== 'unsure') || hasCustomStack ? 10 : 6;

  const score = Math.max(0, Math.min(100, clarity + stackFit + scope + time + builderFit));

  let verdictClass, verdict, verdictMsg, recommendation;
  if (score >= 70) {
    verdictClass = 'good'; verdict = 'GO';
    verdictMsg = 'Worth building now — scope and stack line up with a realistic path.';
    recommendation = 'Start with the MVP slice defined in the builder plan. Ship something runnable in week 2.';
  } else if (score >= 50) {
    verdictClass = 'warn'; verdict = 'Proceed with caution';
    verdictMsg = 'Buildable — tighten scope or extend the deadline before committing.';
    recommendation = 'Pick 2–3 core features only. Defer everything else to v2. Revisit the deadline.';
  } else {
    verdictClass = 'bad'; verdict = 'Rethink / reshape';
    verdictMsg = 'Too much surface for the current setup — reshape the scope first.';
    recommendation = 'Redefine the idea as a single, sharp use case. Remove unknowns before committing to build.';
  }

  const estimate = score >= 75 ? 'Lean' : score >= 55 ? 'Medium' : 'Large';
  const weeks    = score >= 75 ? '1–2'  : score >= 55 ? '3–5'   : '6–10';

  const seed = hash((input.idea || '') + '|' + (input.stack || '') + '|' + comfort + '|' + (input.deadline || '') + '|' + typeKey);
  const risks = pick(seed, FEAS_RISKS, 3);

  const stackLabel = hasCustomStack
    ? input.customStack
    : (input.stack && STACKS[input.stack] && input.stack !== 'unsure' ? STACKS[input.stack].label : 'default stack');

  const lines = [
    `Feasibility Score: ${score}/100`,
    `Verdict: ${verdict}`,
    `Summary: ${verdictMsg}`,
    '',
    'Score breakdown',
    `  Idea clarity   ${padScore(clarity, 30)}  (${words} words${audience ? ' · audience: yes' : ''})`,
    `  Stack fit      ${padScore(stackFit, 25)}  (${comfort})`,
    `  Scope          ${padScore(scope, 20)}  (${(PROJECT_TYPES[typeKey] || typeKey).toLowerCase()})`,
    `  Time realism   ${padScore(time, 15)}  (${deadline.label})`,
    `  Builder fit    ${padScore(builderFit, 10)}  (${stackLabel})`,
    '',
    `Effort estimate: ${estimate} — ~${weeks} weeks (${TEAM_SIZES[teamKey] || 'Solo'})`,
    '',
    'Recommendation',
    `  ${recommendation}`,
    '',
    'Key risks & mitigations',
    ...risks.flatMap((r, i) => [`  ${i + 1}. ${r.risk}`, `     Mitigation: ${r.fix}`]),
    '',
    '> Note: This score is a planning estimate, not a scientific measure. Use it as a starting point for scoping conversations.',
  ];

  return {
    score,
    verdict,
    verdictClass,
    estimate: `${estimate} — ~${weeks} weeks`,
    axes: [
      { label: 'Idea clarity',  value: clarity,    max: 30 },
      { label: 'Stack fit',     value: stackFit,   max: 25 },
      { label: 'Scope',         value: scope,      max: 20 },
      { label: 'Time realism',  value: time,       max: 15 },
      { label: 'Builder fit',   value: builderFit, max: 10 },
    ],
    text: lines.join('\n'),
  };
}
