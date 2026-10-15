// Writes themes/*.json from the installed @langchain/macaw-tokens.
// `--check` writes nothing and exits 1 if a committed theme is stale.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { THEMES, buildTheme, renderTheme } from './theme.ts';
import { parseTokenFile } from './tokens.ts';

const check = process.argv.includes('--check');
const root = new URL('../', import.meta.url);

const tokensPath = fileURLToPath(
  import.meta.resolve('@langchain/macaw-tokens/tokens.json')
);
const file = parseTokenFile(JSON.parse(await readFile(tokensPath, 'utf8')));

const stale: string[] = [];
for (const spec of THEMES) {
  const target = new URL(spec.path, root);
  const text = renderTheme(buildTheme(file, spec));
  if (!check) {
    await writeFile(target, text);
    console.log(`wrote ${spec.path}`);
  } else if ((await readFile(target, 'utf8').catch(() => '')) !== text) {
    stale.push(spec.path);
  }
}

if (stale.length > 0) {
  console.error(`stale: ${stale.join(', ')}. Run \`mise run generate\`.`);
  process.exit(1);
}
