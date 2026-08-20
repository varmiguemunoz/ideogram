import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const electronDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(electronDir, '..');
const resourcesDir = join(electronDir, 'resources');

const sources = [
  { from: join(workspaceRoot, 'ui', 'dist'), to: join(resourcesDir, 'ui'), name: 'ui' },
  { from: join(workspaceRoot, 'api', 'dist-bundle'), to: join(resourcesDir, 'api'), name: 'api' },
];

rmSync(resourcesDir, { recursive: true, force: true });
mkdirSync(resourcesDir, { recursive: true });

for (const source of sources) {
  if (!existsSync(source.from)) {
    throw new Error(
      `Cannot stage ${source.name}: ${source.from} does not exist. ` +
        `Build it first with "npm run build -w congen-${source.name}".`,
    );
  }
  cpSync(source.from, source.to, { recursive: true });
  console.log(`staged ${source.name} -> resources/${source.name}`);
}
