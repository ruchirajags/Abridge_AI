import { STACKS } from '../utils/export.js';

export function runTechStackAgent(input) {
  const hasCustomStack = !!input.customStack;
  const comfort = input.comfort || 'beginner';

  const comfortNote =
    comfort === 'advanced'     ? 'skip guardrails, add CI + benchmarks early'
    : comfort === 'intermediate' ? 'add small tests per module, keep it boring'
    :                              'prefer scaffolding + step-by-step notes, one feature at a time';

  if (hasCustomStack) {
    const lines = [
      `Stack: ${input.customStack} (custom)`,
      '',
      'Custom stack detected — recommendations are based on your specified combination.',
      '',
      'General guidance for custom stacks:',
      '  • Verify all components have compatible versions before starting.',
      '  • Check community health: documentation quality, open issues, release cadence.',
      '  • Build a minimal integration proof before committing to the full stack.',
      '  • Prefer packages with >1k GitHub stars and active maintenance.',
      '',
      `Pace (${comfort}): ${comfortNote}`,
      '',
      'Note: The starter scaffold uses TypeScript defaults for file structure.',
      '      Adapt the scaffold files to match your custom stack.',
    ];
    return lines.join('\n');
  }

  const key = input.stack || 'unsure';
  const s = STACKS[key] || STACKS.unsure;

  const lines = [
    `Stack: ${s.label}`,
    `  app     ${s.app}`,
    `  ui      ${s.ui}`,
    `  api     ${s.api}`,
    `  data    ${s.data}`,
    `  test    ${s.test}`,
    `  lint    ${s.lint}`,
    '',
    `Why: ${s.why}`,
    `Pace (${comfort}): ${comfortNote}`,
  ];
  return lines.join('\n');
}
