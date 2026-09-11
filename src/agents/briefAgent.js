import { STACKS, PROJECT_TYPES, TEAM_SIZES } from '../utils/export.js';

export function runBriefAgent(ctx) {
  const stackLabel = ctx.customStack || (STACKS[ctx.stack] || STACKS.unsure).label;
  const projectType = PROJECT_TYPES[ctx.type] || ctx.type || 'Not specified';
  const teamSize = TEAM_SIZES[ctx.team] || ctx.team || 'Solo';

  const nextSteps = [
    'Review the feasibility score and adjust scope if needed.',
    'Download the starter scaffold and unzip it locally.',
    'Run the build/test commands to confirm the scaffold works.',
    'Implement the core logic in the core module first.',
    'Add a unit test for every module before moving on.',
    'Follow the milestone plan: Foundation → Core slice → Harden → Ship.',
    'Export this project brief and keep it as your reference document.',
  ];

  const mvpGuidance = [
    'Build the minimum that proves the core idea works end-to-end.',
    'Defer all "nice-to-have" features until the core is working.',
    'Prefer working software over comprehensive documentation.',
    'Commit working code every day — never let a session end with broken code.',
  ];

  const footer = [
    'This plan was generated deterministically from your project inputs.',
    'It is a starting point — adapt it to your specific situation.',
  ];

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
    ...nextSteps.map((s, i) => `  ${i + 1}. ${s}`),
    '',
    '── MVP scope guidance ───────────────────────────',
    ...mvpGuidance.map(s => `  • ${s}`),
    '',
    ...footer.map(s => `> ${s}`),
  ];

  const text = lines.join('\n');

  return {
    text,
    projectName: ctx.name || 'the builder',
    ownerName:   ctx.name || 'the builder',
    idea:        ctx.idea,
    stackLabel,
    projectType,
    teamSize,
    audience:               ctx.audience  || '',
    github:                 ctx.github    || '',
    deadline:               ctx.deadline  || '',
    comfort:                ctx.comfort   || '',
    githubFirstLine:        ctx.githubFirstLine,
    feasLine:               ctx.feasLine,
    builderLine:            ctx.builderLine,
    architectureFirstLine:  ctx.architectureFirstLine,
    researchFirstLine:      ctx.researchFirstLine,
    nextSteps,
    mvpGuidance,
    footer,
  };
}
