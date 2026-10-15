// Screenshots VS Code for the web with each theme, then writes the README
// hero image: the light window over the dark one, split on a diagonal.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { open } from '@vscode/test-web';
import { type Browser, type Page, chromium } from 'playwright';

import { THEMES, type ThemeSpec } from '../src/theme.ts';
import {
  type Variant,
  palette,
  parseTokenFile,
  resolve,
  tokenTable,
} from '../src/tokens.ts';
import { heroHtml, heroSize } from './hero.ts';

const PORT = 3123;
const WINDOW = { width: 1600, height: 1000 };
const SCALE = 2;
/** Opened from the URL; `gotoLineMode` places the cursor at line:column. */
const PRIMARY_FILE = 'agent/graph.py:14:6';
const SIDE_FOLDER = 'web';
const SIDE_FILE = 'client.ts';
const FOLDER_NAME = 'research-agent';

const path = (relative: string) =>
  fileURLToPath(new URL(`../${relative}`, import.meta.url));
const dataDir = path('.vscode-test-web');
const output = path('docs/images/hero.png');

/**
 * Removes labels only VS Code for the web's test harness shows. Theme colors
 * are untouched; this makes the window read like a local install.
 */
async function tidyHarness(page: Page) {
  await page.evaluate((folder) => {
    document
      .querySelectorAll('[id="status.workbench.keyboardLayout"]')
      .forEach((e) => e.remove());
    const host = document.getElementById('status.host');
    host
      ?.querySelectorAll('*')
      .forEach((e) =>
        [...e.childNodes]
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .forEach((n) => n.remove())
      );
    document
      .querySelectorAll('.explorer-viewlet .pane-header h3.title')
      .forEach((e) => {
        if (e.textContent?.includes('Test Files')) e.textContent = folder;
      });
  }, FOLDER_NAME);
}

/** A copy of the sample workspace whose settings select one theme. */
async function workspaceFor(spec: ThemeSpec): Promise<string> {
  const dir = `${dataDir}/workspace-${spec.variant}`;
  await rm(dir, { recursive: true, force: true });
  await cp(path('screenshots/workspace'), dir, { recursive: true });
  const settingsPath = `${dir}/.vscode/settings.json`;
  const settings = JSON.parse(await readFile(settingsPath, 'utf8'));
  await writeFile(
    settingsPath,
    JSON.stringify({ ...settings, 'workbench.colorTheme': spec.label })
  );
  return dir;
}

async function capture(
  browser: Browser,
  spec: ThemeSpec,
  port: number
): Promise<Buffer> {
  const server = await open({
    browserType: 'none',
    quality: 'stable',
    extensionDevelopmentPath: path(''),
    folderPath: await workspaceFor(spec),
    port,
    testRunnerDataDir: dataDir,
  });
  const page = await browser.newPage({
    viewport: WINDOW,
    deviceScaleFactor: SCALE,
  });
  try {
    const payload = [
      ['openFile', `vscode-test-web://mount/${PRIMARY_FILE}`],
      ['gotoLineMode', 'true'],
    ];
    await page.goto(
      `http://localhost:${port}/?payload=${encodeURIComponent(JSON.stringify(payload))}`
    );
    await page.locator('.monaco-editor .view-lines').first().waitFor({
      timeout: 120_000,
    });
    await page.waitForTimeout(2000);

    const tree = page.locator('.explorer-folders-view');
    await tree
      .getByRole('treeitem', { name: SIDE_FOLDER, exact: true })
      .click();
    await tree
      .getByRole('treeitem', { name: SIDE_FILE, exact: true })
      .click({ modifiers: ['Alt'] });
    await page.locator('.monaco-editor .view-lines').nth(1).waitFor();

    // Back to the first editor so its cursor and line highlight show.
    await page.locator('.tab', { hasText: 'graph.py' }).click();
    // Empty activity bar: hovering an editor or the explorer reveals controls.
    await page.mouse.move(24, WINDOW.height - 300);
    await tidyHarness(page);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);

    const png = await page.screenshot();
    await writeFile(`${dataDir}/shots/${spec.variant}.png`, png);
    return png;
  } finally {
    await page.close();
    server.dispose();
  }
}

const tokensPath = fileURLToPath(
  import.meta.resolve('@langchain/macaw-tokens/tokens.json')
);
const table = tokenTable(
  parseTokenFile(JSON.parse(await readFile(tokensPath, 'utf8'))),
  'light'
);
const { color } = palette(table);

const spec = (variant: Variant): ThemeSpec => {
  const found = THEMES.find((t) => t.variant === variant);
  if (!found) throw new Error(`No ${variant} theme`);
  return found;
};
const [lightSpec, darkSpec] = [spec('light'), spec('dark')];

await mkdir(`${dataDir}/shots`, { recursive: true });
const browser = await chromium.launch();
try {
  const dataUrl = (png: Buffer) =>
    `data:image/png;base64,${png.toString('base64')}`;
  const light = dataUrl(await capture(browser, lightSpec, PORT));
  const dark = dataUrl(await capture(browser, darkSpec, PORT + 1));

  const input = {
    light,
    dark,
    window: WINDOW,
    padding: 96,
    radius: resolve(table, '--radius-xl'),
    divider: color('--brand-200'),
    backdrop: {
      glow: color('--brand-400'),
      accent: color('--purple-500'),
      from: color('--brand-800'),
      to: color('--brand-950'),
    },
    labels: { light: lightSpec.label, dark: darkSpec.label },
  };
  const hero = await browser.newPage({
    viewport: heroSize(input),
    deviceScaleFactor: SCALE,
  });
  await hero.setContent(heroHtml(input));
  await hero.evaluate(() => document.fonts.ready);
  await mkdir(path('docs/images'), { recursive: true });
  await writeFile(output, await hero.screenshot());
  console.log(`wrote ${output}`);
} finally {
  await browser.close();
}
