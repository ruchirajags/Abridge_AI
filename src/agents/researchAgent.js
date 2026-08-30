import { hash, pick } from '../utils/hash.js';

const OPPORTUNITIES = [
  'Small, focused tools with a single clear job tend to win over sprawling platforms.',
  'There is a steady market for fast, opinionated utilities that remove ceremony.',
  'Automation of recurring manual work remains underserved by most tooling.',
  'Teams pay for measurable time saved; the pitch should be concrete and numeric.',
  'The pattern of "input → structured output" generalizes well across domains.',
  'Developer-facing tools that integrate with existing workflows see faster adoption.',
  'Products that make complex workflows observable and predictable have strong retention.',
];

const RISKS = [
  'Feature creep is the top failure mode; scope to one sharp slice first.',
  'Existing incumbents often win on habit rather than capability.',
  'Solo-built tools struggle on support load; keep the surface area small.',
  'Integration friction with existing workflows is the most common adoption blocker.',
  'Underspecified inputs produce unreliable outputs; define inputs explicitly.',
  'Perfectionism before shipping is a common project killer — prefer iterative delivery.',
];

const DIRECTIONS = [
  'Lead with the fastest end-to-end vertical slice, then harden it.',
  'Ship a CLI first, then wrap it in a minimal web surface.',
  'Publish the deterministic core as a library so other tools can embed it.',
  'Make the pipeline observable: users should see each stage work.',
  'Design for offline-first; it removes a whole class of failure modes.',
  'Define a tight MVP with 3 features maximum, then add based on real usage.',
];

export function runResearchAgent(input, gh) {
  const seed = hash((input.idea || '') + '|' + (input.stack || ''));
  const opportunities = pick(seed, OPPORTUNITIES, 3);
  const risks = pick(seed ^ 0x9e3779b9, RISKS, 3);
  const directions = pick(seed ^ 0x85ebca6b, DIRECTIONS, 2);

  const lines = [
    `Project: ${input.idea}`,
    `Builder signal: ${gh.languages.length ? gh.languages[0].language : 'n/a'}-first builder, ${gh.profile.followers} GitHub followers.`,
    '',
    'Opportunity scan',
    ...opportunities.map((o, i) => `${i + 1}. ${o}`),
    '',
    'Risks to plan around',
    ...risks.map((r, i) => `${i + 1}. ${r}`),
    '',
    'Recommended direction',
    ...directions.map((d, i) => `${i + 1}. ${d}`),
  ];
  return lines.join('\n');
}
