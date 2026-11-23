import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const formatted = execFileSync('gofmt', ['-l', '.'], {
  cwd: root,
  encoding: 'utf8',
}).trim();
if (formatted) {
  console.error(`Go files need formatting:\n${formatted}`);
  process.exit(1);
}

const goEnv = { ...process.env, GOOS: 'js', GOARCH: 'wasm' };
execFileSync('go', ['vet', './...'], {
  cwd: root,
  env: goEnv,
  stdio: 'inherit',
});
execFileSync('go', ['test', './...'], {
  cwd: root,
  env: goEnv,
  stdio: 'inherit',
});

const scripts = readdirSync(path.join(root, 'scripts'))
  .filter((name) => name.endsWith('.mjs'))
  .map((name) => path.join('scripts', name));
const tests = readdirSync(path.join(root, 'test'))
  .filter((name) => name.endsWith('.mjs'))
  .map((name) => path.join('test', name));
for (const file of ['worker.js', ...scripts, ...tests])
  execFileSync(process.execPath, ['--check', file], {
    cwd: root,
    stdio: 'inherit',
  });
