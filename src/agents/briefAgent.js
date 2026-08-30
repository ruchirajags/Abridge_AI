import { STACKS, PROJECT_TYPES, TEAM_SIZES } from '../utils/export.js';

export function runBriefAgent(ctx) {
  const stackLabel = ctx.customStack || (STACKS[ctx.stack] || STACKS.unsure).label;
  const projectType = PROJECT_TYPES[ctx.type] || ctx.type || 'Not specified';
  const teamSize = TEAM_SIZES[ctx.team] || ctx.team || 'Solo';

  const lines = [
    'IMPLEMENTATION PLAN',
    '===================',
    '',
    `Project: ${ctx.idea}`,
    `Owner:   ${ctx.name || 'the builder'}`,
    '',
    '── Context ──────────────────────────────────────',
    `  GitHub profile  : ${ctx.githubFirstLine}`,
    `  Feasibility     : ${ctx.feasLine}`,
    `  Scaffold        : ${ctx.builderLine}`,
    `  Stack           : ${stackLabel}`,
    `  Architecture    : ${ctx.architectureFirstLine}`,
    `  Research signal : ${ctx.researchFirstLine}`,
    `  Deadline        : ${ctx.deadline || 'not specified'} · Comfort: ${ctx.comfort}`,
    `  Project type    : ${projectType} · Team: ${teamSize}`,
    '',
    '── Suggested next steps ─────────────────────────',
    '  1. Review the feasibility score and adjust scope if needed.',
    '  2. Download the starter scaffold and unzip it locally.',
    '  3. Run the build/test commands to confirm the scaffold works.',
    '  4. Implement the core logic in the core module first.',
    '  5. Add a unit test for every module before moving on.',
    '  6. Follow the milestone plan: Foundation → Core slice → Harden → Ship.',
    '  7. Export this project brief and keep it as your reference document.',
    '',
    '── MVP scope guidance ───────────────────────────',
    '  • Build the minimum that proves the core idea works end-to-end.',
    '  • Defer all "nice-to-have" features until the core is working.',
    '  • Prefer working software over comprehensive documentation.',
    '  • Commit working code every day — never let a session end with broken code.',
    '',
    '> This plan was generated deterministically from your project inputs.',
    '> It is a starting point — adapt it to your specific situation.',
  ];

  return lines.join('\n');
}
