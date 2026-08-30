// CRC-32 table (lazy-initialized)
let CRC_TABLE = null;

function buildCrcTable() {
  CRC_TABLE = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    CRC_TABLE[n] = c;
  }
}

function crc32(bytes) {
  if (!CRC_TABLE) buildCrcTable();
  let crc = -1;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

// Build a store-only ZIP in the browser — no dependencies
export function buildZip(files) {
  const enc = new TextEncoder();
  const localChunks = [];
  const central = [];
  let offset = 0;
  const DOS_TIME = 0;
  const DOS_DATE = 0x5821;

  files.forEach(f => {
    const nameBytes = enc.encode(f.path);
    const dataBytes = enc.encode(f.content);
    const crc = crc32(dataBytes);
    const local = new Uint8Array(30 + nameBytes.length + dataBytes.length);
    const v = new DataView(local.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 0x0800, true);
    v.setUint16(8, 0, true);
    v.setUint16(10, DOS_TIME, true);
    v.setUint16(12, DOS_DATE, true);
    v.setUint32(14, crc, true);
    v.setUint32(18, dataBytes.length, true);
    v.setUint32(22, dataBytes.length, true);
    v.setUint16(26, nameBytes.length, true);
    v.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    local.set(dataBytes, 30 + nameBytes.length);
    localChunks.push(local);
    central.push({ nameBytes, crc, size: dataBytes.length, offset });
    offset += local.length;
  });

  const centralChunks = [];
  const centralStart = offset;
  central.forEach(c => {
    const hdr = new Uint8Array(46 + c.nameBytes.length);
    const v = new DataView(hdr.buffer);
    v.setUint32(0, 0x02014b50, true);
    v.setUint16(4, 20, true); v.setUint16(6, 20, true);
    v.setUint16(8, 0x0800, true);
    v.setUint16(10, 0, true);
    v.setUint16(12, DOS_TIME, true); v.setUint16(14, DOS_DATE, true);
    v.setUint32(16, c.crc, true);
    v.setUint32(20, c.size, true); v.setUint32(24, c.size, true);
    v.setUint16(28, c.nameBytes.length, true);
    v.setUint16(30, 0, true); v.setUint16(32, 0, true);
    v.setUint16(34, 0, true); v.setUint16(36, 0, true);
    v.setUint32(38, 0, true); v.setUint32(42, c.offset, true);
    hdr.set(c.nameBytes, 46);
    centralChunks.push(hdr);
  });

  const centralSize = centralChunks.reduce((s, c) => s + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true); ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, centralStart, true);
  ev.setUint16(20, 0, true);

  const total = centralStart + centralSize + eocd.length;
  const out = new Uint8Array(total);
  let pos = 0;
  localChunks.forEach(c => { out.set(c, pos); pos += c.length; });
  centralChunks.forEach(c => { out.set(c, pos); pos += c.length; });
  out.set(eocd, pos);
  return out;
}

export function downloadZip(files, name) {
  const blob = new Blob([buildZip(files)], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function slugify(str) {
  return String(str || 'project').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'project';
}

function filePurpose(path) {
  const name = path.split('/').pop();
  const map = {
    'package.json': 'scripts, dev deps, module config',
    'tsconfig.json': 'strict TypeScript config',
    'pyproject.toml': 'project metadata, deps, pytest + ruff config',
    'go.mod': 'module definition',
    'Cargo.toml': 'crate metadata and deps',
    'index.ts': 'entry point — parse input, run core, print output',
    'main.py': 'entry point — Typer CLI over the core',
    'main.go': 'entry point — parse args, run core',
    'main.rs': 'entry point — parse args, run core',
    'core.ts': 'pure deterministic core',
    'core.py': 'pure deterministic core',
    'core.go': 'pure deterministic core',
    'core.rs': 'pure deterministic core',
    'core.test.ts': 'first unit test for the core',
    'test_core.py': 'first unit test for the core',
    'core_test.go': 'first unit test for the core',
    '__init__.py': 'package marker',
    'README.md': 'quick start + run instructions',
    'PLAN.md': 'feasibility summary + milestones',
    '.gitignore': 'ignore build artifacts',
  };
  return map[name] || 'project file';
}

function planMarkdown(input, slug) {
  const idea = input.idea || '—';
  const lines = [
    `# ${input.name || slug} — Build Plan`,
    '',
    `- **Idea:** ${idea}`,
    `- **Stack:** ${input.customStack || input.stack || 'typescript'}`,
    '',
    '## Milestones',
    '',
    '### M1 — W1 Foundation',
    '',
    '- Scaffold the repo from the starter files.',
    '- Wire build, test, and lint scripts.',
    '- Add fixtures for the first input sample.',
    '- **Done when:** the repo builds and the placeholder test passes.',
    '',
    '### M2 — W2 Core slice',
    '',
    '- Implement the main input → output flow in the core module.',
    '- Connect the entry point to the core.',
    '- **Done when:** running the CLI on the sample input produces the expected output.',
    '',
    '### M3 — W3 Harden',
    '',
    '- Add error taxonomy and edge-case handling.',
    '- Unit-test every module with fixed fixtures.',
    '- **Done when:** all tests are green and failures are clear and actionable.',
    '',
    '### M4 — W4 Ship',
    '',
    '- Write docs and a README quick start.',
    '- Tag a release.',
    '- **Done when:** a fresh clone builds and runs straight from the README.',
    '',
  ];
  return lines.join('\n');
}

function tsStarter(slug, name, desc) {
  const pkg = {
    name: slug, version: '0.1.0', private: true, type: 'module', description: desc,
    scripts: { build: 'tsc', test: 'vitest run', 'test:watch': 'vitest', lint: 'biome check src' },
    devDependencies: { typescript: '^5.5.0', vitest: '^2.1.0', '@types/node': '^22.0.0', '@biomejs/biome': '^1.9.0' },
  };
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext',
      strict: true, outDir: 'dist', rootDir: 'src',
      declaration: true, sourceMap: true, esModuleInterop: true, skipLibCheck: true,
    },
    include: ['src'],
  };
  return [
    { path: 'package.json', content: JSON.stringify(pkg, null, 2) + '\n' },
    { path: 'tsconfig.json', content: JSON.stringify(tsconfig, null, 2) + '\n' },
    {
      path: 'src/index.ts',
      content: `// ${name} — ${desc}\n// Entry point: parse the input, run the deterministic core, print output.\n\nimport { run } from './core.js';\n\nfunction main() {\n  const input = process.argv.slice(2).join(' ');\n  process.stdout.write(run(input) + '\\n');\n}\n\nmain();\n`,
    },
    {
      path: 'src/core.ts',
      content: `// Pure, deterministic core — no side effects.\nexport function run(input: string): string {\n  return 'received: ' + input;\n}\n`,
    },
    {
      path: 'test/core.test.ts',
      content: `import { describe, expect, it } from 'vitest';\nimport { run } from '../src/core.js';\n\ndescribe('core', () => {\n  it('handles empty input', () => {\n    expect(run('')).toBe('received: ');\n  });\n});\n`,
    },
    { path: '.gitignore', content: 'node_modules/\ndist/\n*.log\n' },
    { path: 'README.md', content: `# ${name}\n\n${desc}\n\n## Run\n\nnpm install\nnpm run build\nnode dist/index.js "hello"\n` },
  ];
}

function pyStarter(slug, name, desc) {
  return [
    {
      path: 'pyproject.toml',
      content: `[project]\nname = "${slug}"\nversion = "0.1.0"\ndescription = "${desc}"\nrequires-python = ">=3.12"\ndependencies = ["typer>=0.12"]\n\n[project.scripts]\n${slug} = "src.main:cli"\n\n[tool.pytest.ini_options]\naddopts = "-q"\n\n[tool.ruff]\nline-length = 100\n`,
    },
    { path: 'src/__init__.py', content: '' },
    {
      path: 'src/main.py',
      content: `"""Entry point — Typer CLI over the deterministic core."""\n\nfrom src.core import run\n\ndef cli():\n    import typer\n    app = typer.Typer()\n\n    @app.command()\n    def go(input_text: str):\n        """Run the pipeline over INPUT_TEXT."""\n        typer.echo(run(input_text))\n\n    app()\n\nif __name__ == "__main__":\n    cli()\n`,
    },
    {
      path: 'src/core.py',
      content: `"""Pure, deterministic core — no side effects."""\n\ndef run(input_text: str) -> str:\n    return "received: " + input_text\n`,
    },
    {
      path: 'tests/test_core.py',
      content: `from src.core import run\n\ndef test_empty():\n    assert run("") == "received: "\n`,
    },
    { path: '.gitignore', content: '__pycache__/\n.venv/\n*.pyc\n' },
    { path: 'README.md', content: `# ${name}\n\n${desc}\n\n## Run\n\nuv sync\nuv run ${slug} "hello"\n` },
  ];
}

function goStarter(slug, name, desc) {
  return [
    { path: 'go.mod', content: `module ${slug}\n\ngo 1.22\n` },
    {
      path: 'main.go',
      content: `package main\n\nimport (\n  "fmt"\n  "os"\n  "strings"\n  "${slug}/core"\n)\n\nfunc main() {\n  input := strings.Join(os.Args[1:], " ")\n  fmt.Println(core.Run(input))\n}\n`,
    },
    {
      path: 'core/core.go',
      content: `package core\n\n// Run is the pure, deterministic core.\nfunc Run(input string) string {\n  return "received: " + input\n}\n`,
    },
    {
      path: 'core/core_test.go',
      content: `package core\n\nimport "testing"\n\nfunc TestRunEmpty(t *testing.T) {\n  if got := Run(""); got != "received: " {\n    t.Fatalf("Run() = %q, want %q", got, "received: ")\n  }\n}\n`,
    },
    { path: '.gitignore', content: 'bin/\n*.exe\n' },
    { path: 'README.md', content: `# ${name}\n\n${desc}\n\n## Run\n\ngo run . "hello"\n` },
  ];
}

function rustStarter(slug, name, desc) {
  return [
    {
      path: 'Cargo.toml',
      content: `[package]\nname = "${slug}"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\n`,
    },
    {
      path: 'src/main.rs',
      content: `mod core;\n\nfn main() {\n  let input: Vec<String> = std::env::args().skip(1).collect();\n  println!("{}", core::run(&input.join(" ")));\n}\n`,
    },
    {
      path: 'src/core.rs',
      content: `// Pure, deterministic core.\npub fn run(input: &str) -> String {\n  format!("received: {input}")\n}\n\n#[cfg(test)]\nmod tests {\n  use super::*;\n\n  #[test]\n  fn run_empty() {\n    assert_eq!(run(""), "received: ");\n  }\n}\n`,
    },
    { path: '.gitignore', content: '/target\n' },
    { path: 'README.md', content: `# ${name}\n\n${desc}\n\n## Run\n\ncargo run -- "hello"\n` },
  ];
}

export function scaffoldFiles(input, slug) {
  const stackKey = input.customStack ? 'custom' : (input.stack || 'unsure');
  const name = input.name || slug;
  const desc = input.idea || 'A deterministic tool.';
  const planFile = { path: 'PLAN.md', content: planMarkdown(input, slug) };

  let starter;
  if (input.stack === 'python') starter = pyStarter(slug, name, desc);
  else if (input.stack === 'go') starter = goStarter(slug, name, desc);
  else if (input.stack === 'rust') starter = rustStarter(slug, name, desc);
  else starter = tsStarter(slug, name, desc);

  return [planFile, ...starter];
}

export function getScaffoldTree(files, rootName) {
  const root = {};
  files.forEach(f => {
    const parts = f.path.split('/');
    let node = root;
    parts.forEach(part => { if (!node[part]) node[part] = {}; node = node[part]; });
  });
  const lines = [];
  if (rootName) lines.push(rootName + '/');
  (function walk(node, prefix) {
    const keys = Object.keys(node).sort();
    keys.forEach((k, i) => {
      const last = i === keys.length - 1;
      const children = node[k];
      const label = k + (Object.keys(children).length ? '/' : '');
      lines.push(prefix + (last ? '└── ' : '├── ') + label);
      if (Object.keys(children).length) walk(children, prefix + (last ? '    ' : '│   '));
    });
  })(root, '');
  return lines;
}

export { filePurpose };
