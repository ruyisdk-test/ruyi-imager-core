import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  if (!args[index + 1]) throw Error(`${name} requires a path`);
  return args[index + 1];
};

const staticDir = path.resolve(
  process.cwd(),
  option('--static') ?? 'dist/static',
);
const messages = option('--messages');
const output = path.join(staticDir, 'device-runtime');
mkdirSync(output, { recursive: true });

const goRoot = execFileSync('go', ['env', 'GOROOT'], {
  encoding: 'utf8',
}).trim();
execFileSync(
  'go',
  [
    'build',
    '-mod=readonly',
    '-trimpath',
    '-ldflags=-s -w',
    '-o',
    path.join(output, 'device.wasm'),
    '.',
  ],
  {
    cwd: root,
    env: { ...process.env, GOOS: 'js', GOARCH: 'wasm' },
    stdio: 'inherit',
  },
);

const bootstrap = path.join(goRoot, 'lib/wasm/wasm_exec.js');
copyFileSync(bootstrap, path.join(output, 'wasm_exec.js'));
writeFileSync(
  path.join(staticDir, 'device-worker.js'),
  [bootstrap, path.join(root, 'worker.js')]
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n'),
);
if (messages) copyFileSync(messages, path.join(output, 'messages.toml'));

console.log(`Runtime written to ${staticDir}`);
