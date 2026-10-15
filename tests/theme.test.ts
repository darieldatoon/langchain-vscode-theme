import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { type Hex, contrast } from '../src/color.ts';
import { THEMES, buildTheme } from '../src/theme.ts';
import { parseTokenFile } from '../src/tokens.ts';

const readJson = (path: string): unknown =>
  JSON.parse(readFileSync(path, 'utf8'));

const file = parseTokenFile(
  readJson(
    fileURLToPath(import.meta.resolve('@langchain/macaw-tokens/tokens.json'))
  )
);
const pkg = readJson(new URL('../package.json', import.meta.url).pathname) as {
  contributes: { themes: unknown[] };
};

it('package.json contributes exactly the generated themes', () => {
  expect(pkg.contributes.themes).toEqual(
    THEMES.map(({ variant, label, path }) => ({
      label,
      uiTheme: variant === 'light' ? 'vs' : 'vs-dark',
      path,
    }))
  );
});

describe.each(THEMES)('$label', (spec) => {
  const theme = buildTheme(file, spec);
  const color = (key: string): Hex => {
    const value = theme.colors[key];
    if (!value) throw new Error(`missing ${key}`);
    return value;
  };
  const editor = color('editor.background');

  it('emits only colors VS Code can parse', () => {
    const all = [
      ...Object.values(theme.colors),
      ...Object.values(theme.semanticTokenColors),
      ...theme.tokenColors.flatMap((t) => t.settings.foreground ?? []),
    ];
    for (const value of all)
      expect(value).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/);
  });

  it.each([
    ['editor.foreground', 'editor.background'],
    ['foreground', 'sideBar.background'],
    ['tab.inactiveForeground', 'tab.inactiveBackground'],
    ['statusBar.foreground', 'statusBar.background'],
    ['editorLineNumber.foreground', 'editor.background'],
    ['list.activeSelectionForeground', 'list.activeSelectionBackground'],
    ['gitDecoration.addedResourceForeground', 'sideBar.background'],
    ['gitDecoration.modifiedResourceForeground', 'sideBar.background'],
    ['gitDecoration.deletedResourceForeground', 'sideBar.background'],
  ])('%s on %s is readable text (4.5:1)', (fg, bg) => {
    expect(contrast(color(fg), color(bg))).toBeGreaterThanOrEqual(4.5);
  });

  const below = (checks: readonly (readonly [string, Hex, Hex, number])[]) =>
    checks
      .map(([name, fg, bg, min]) => ({ name, ratio: contrast(fg, bg), min }))
      .filter(({ ratio, min }) => ratio < min);

  it('syntax colors are readable on the editor', () => {
    const checks = theme.tokenColors.flatMap(({ name, settings }) =>
      settings.foreground
        ? // Comments are deliberately muted; Macaw's dark comment measures ~4.2.
          [
            [
              name,
              settings.foreground,
              editor,
              name === 'Comment' ? 3 : 4.5,
            ] as const,
          ]
        : []
    );
    expect(below(checks)).toEqual([]);
  });

  it('ANSI colors read on the terminal background', () => {
    const bg = color('terminal.background');
    const hues = ['Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan'];
    const checks = hues.flatMap((hue) => [
      [hue, color(`terminal.ansi${hue}`), bg, 4.5] as const,
      [`Bright${hue}`, color(`terminal.ansiBright${hue}`), bg, 3] as const,
    ]);
    expect(below(checks)).toEqual([]);
  });
});
