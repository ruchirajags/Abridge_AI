import { hash, pick } from '../utils/hash.js';

const MODULE_POOL = [
  'core / domain logic',
  'CLI entrypoint',
  'web / API layer',
  'persistence adapter',
  'config & env handling',
  'logging & observability',
  'error taxonomy',
  'test harness / fixtures',
  'event bus / message queue',
  'authentication adapter',
];

const FLOWS = [
  'input → parse → transform → output',
  'request → validate → execute → persist → respond',
  'collect → analyze → summarize → deliver',
  'watch → filter → act → report',
  'ingest → normalize → process → emit',
];

const PRINCIPLES = [
  'Pure core, thin shell: all logic deterministic and side-effect free.',
  'Adapters at the edges: swap CLI for web without touching core.',
  'Every module gets a unit test with fixed fixtures.',
  'Fail loudly at the boundary, silently never inside the core.',
  'Prefer composition over inheritance; small functions, clear names.',
];

export function runArchitectureAgent(input) {
  const seed = hash((input.idea || '') + '|arch');
  const modules = pick(seed, MODULE_POOL, 4);
  const flow = pick(seed ^ 0x2545f491, FLOWS, 1)[0];
  const principles = pick(seed ^ 0x14b2d4c7, PRINCIPLES, 3);

  const lines = [
    `Shape: ${flow}`,
    '',
    'Modules',
    ...modules.map((m, i) => `  ${i + 1}. ${m}`),
    '',
    'Data flow',
    `  boundary → ${modules[0]} → ${modules[1]} → ${modules[2]}`,
    '',
    'Design principles',
    ...principles.map(p => `  • ${p}`),
    '',
    'Notes',
    '  Adapt this blueprint to your specific domain. The module names are',
    '  starting points — rename them to match your project language.',
  ];

  return { shape: flow, modules, flow, principles, text: lines.join('\n') };
}