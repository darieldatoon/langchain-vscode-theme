import { expect, it } from 'vitest';

import { toHex } from '../src/color.ts';
import { type HeroInput, heroHtml, heroSize } from '../screenshots/hero.ts';

const input: HeroInput = {
  light: 'data:image/png;base64,LIGHT',
  dark: 'data:image/png;base64,DARK',
  window: { width: 1600, height: 1000 },
  padding: 96,
  radius: '12px',
  divider: toHex('#008dff'),
  backdrop: {
    glow: toHex('#006ddd'),
    accent: toHex('#6244a0'),
    from: toHex('#0c336a'),
    to: toHex('#101a30'),
  },
  labels: { light: 'LangChain Light', dark: 'LangChain Dark' },
};

it('pads the window on every side', () => {
  expect(heroSize(input)).toEqual({ width: 1792, height: 1192 });
});

it('stacks the clipped light shot over the dark one', () => {
  const html = heroHtml(input);
  expect(html.indexOf('DARK')).toBeLessThan(html.indexOf('LIGHT'));
  expect(html).toContain(
    '<img class="light" src="data:image/png;base64,LIGHT"'
  );
  expect(html).toContain('stroke="#008dff"');
});
