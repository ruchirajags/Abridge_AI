import { STACKS } from '../domain/stacks.js';
import { slugify, scaffoldFiles, getScaffoldTree, filePurpose } from '../scaffold/scaffold.js';

const MILESTONES = [
  { week: 1, title: 'Foundation',  tasks: ['Scaffold the repo from the starter files.', 'Wire build, test, and lint scripts.', 'Add fixtures for the first input sample.'], accept: 'the repo builds and the placeholder test passes.' },
  { week: 2, title: 'Core slice',  tasks: ['Implement the main input → output flow in the core module.', 'Connect the entry point to the core.'], accept: 'running the entry point on the sample input produces the expected output.' },
  { week: 3, title: 'Harden',      tasks: ['Add error taxonomy and edge-case handling.', 'Unit-test every module with fixed fixtures.'], accept: 'all tests are green and failures are clear and actionable.' },
  { week: 4, title: 'Ship',        tasks: ['Write docs and a README quick start.', 'Tag a release.'], accept: 'a fresh clone builds and runs straight from the README.' },
];

export function runBuilderAgent(input) {
  const stackKey = input.stack || 'unsure';
  const stack = STACKS[stackKey] || STACKS.unsure;
  const slug = slugify(input.name || input.idea || 'project');
  const files = scaffoldFiles(input, slug);
  const treeLines = getScaffoldTree(files, slug);
  const dirCount = countDirs(files);

  const stackLabel = input.customStack || stack.label;

  const lines = [
    `Builder Plan`,
    `Scaffold: ${files.length} files · ${dirCount} directories (${stackLabel})`,
    '',
    ...(stackKey === 'unsure' && !input.customStack
      ? ['Stack: recommended default (TypeScript / JavaScript) until the stack is decided.', '']
      : []),
    'Starter project scaffold',
    ...treeLines.map(l => '  ' + l),
    '',
    'File purposes',
    ...files.map(f => `  ${f.path} — ${filePurpose(f.path)}`),
    '',
    'Implementation milestones',
    ...MILESTONES.flatMap((m, i) => [
      `  M${i + 1} · W${m.week} ${m.title}`,
      ...m.tasks.map(t => `    - ${t}`),
      `    ✓ Done when: ${m.accept}`,
    ]),
    '',
    'Note: This scaffold is a starting point for implementation, not production-ready software.',
    'Adapt file names and structure to match your specific project requirements.',
  ];

  return { text: lines.join('\n'), folder: slug, files };
}

function countDirs(files) {
  const dirs = {};
  files.forEach(f => {
    const parts = f.path.split('/');
    if (parts.length > 1) {
      for (let i = 1; i < parts.length; i++) dirs[parts.slice(0, i).join('/')] = true;
    }
  });
  return Object.keys(dirs).length;
}