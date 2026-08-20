import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(apiDir, 'dist-bundle');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [join(apiDir, 'src', 'index.ts')],
  outfile: join(outDir, 'index.js'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  sourcemap: true,
  // Native module. Resolved at run time from the Electron app's node_modules,
  // where Forge has rebuilt it against Electron's ABI.
  external: ['better-sqlite3'],
});

cpSync(
  join(apiDir, 'src', 'shared', 'infrastructure', 'database', 'migrations'),
  join(outDir, 'shared', 'infrastructure', 'database', 'migrations'),
  { recursive: true },
);

console.log('api bundled -> dist-bundle/index.js');
