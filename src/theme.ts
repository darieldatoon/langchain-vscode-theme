import type { Hex } from './color.ts';
import { type TokenColor, semanticTokenColors, tokenColors } from './syntax.ts';
import { type TokenFile, type Variant, palette, tokenTable } from './tokens.ts';
import { workbenchColors } from './workbench.ts';

export type ThemeSpec = {
  readonly variant: Variant;
  readonly label: string;
  readonly path: `./themes/${string}.json`;
};

/** Must match `contributes.themes` in package.json (a test enforces it). */
export const THEMES: readonly ThemeSpec[] = [
  {
    variant: 'light',
    label: 'LangChain Light',
    path: './themes/langchain-light.json',
  },
  {
    variant: 'dark',
    label: 'LangChain Dark',
    path: './themes/langchain-dark.json',
  },
];

export type Theme = {
  readonly $schema: 'vscode://schemas/color-theme';
  readonly name: string;
  readonly type: Variant;
  readonly semanticHighlighting: true;
  readonly colors: Readonly<Record<string, Hex>>;
  readonly tokenColors: readonly TokenColor[];
  readonly semanticTokenColors: Readonly<Record<string, Hex>>;
};

export function buildTheme(file: TokenFile, spec: ThemeSpec): Theme {
  const p = palette(tokenTable(file, spec.variant));
  return {
    $schema: 'vscode://schemas/color-theme',
    name: spec.label,
    type: spec.variant,
    semanticHighlighting: true,
    colors: workbenchColors(p, spec.variant),
    tokenColors: tokenColors(p),
    semanticTokenColors: semanticTokenColors(p),
  };
}

export const renderTheme = (theme: Theme): string =>
  `${JSON.stringify(theme, null, 2)}\n`;
