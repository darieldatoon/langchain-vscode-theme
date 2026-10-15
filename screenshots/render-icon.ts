// Renders assets/icon.png, the Marketplace icon, from Macaw's LangChain
// logomark (copied from macaw-design-system's components/Logo).
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { palette, parseTokenFile, tokenTable } from '../src/tokens.ts';
import { iconHtml } from './icon.ts';

/** CSS pixels; rendered at 2x for the Marketplace's 256px recommendation. */
const SIZE = 128;

const path = (relative: string) =>
  fileURLToPath(new URL(`../${relative}`, import.meta.url));

const tokensPath = fileURLToPath(
  import.meta.resolve('@langchain/macaw-tokens/tokens.json')
);
const { color } = palette(
  tokenTable(
    parseTokenFile(JSON.parse(await readFile(tokensPath, 'utf8'))),
    'light'
  )
);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: SIZE, height: SIZE },
    deviceScaleFactor: 2,
  });
  await page.setContent(
    iconHtml({
      logomark: await readFile(path('assets/langchain-logomark.svg'), 'utf8'),
      size: SIZE,
      backdrop: {
        glow: color('--brand-400'),
        accent: color('--purple-500'),
        from: color('--brand-800'),
        to: color('--brand-950'),
      },
    })
  );
  await writeFile(
    path('assets/icon.png'),
    await page.screenshot({ omitBackground: true })
  );
  console.log('wrote assets/icon.png');
} finally {
  await browser.close();
}
