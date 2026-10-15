import { expect, it } from 'vitest';

import { toHex } from '../src/color.ts';
import { iconHtml } from '../screenshots/icon.ts';

it('centers the logomark on a rounded backdrop tile', () => {
  const html = iconHtml({
    logomark: '<svg id="mark"></svg>',
    size: 128,
    backdrop: {
      glow: toHex('#006ddd'),
      accent: toHex('#6244a0'),
      from: toHex('#0c336a'),
      to: toHex('#101a30'),
    },
  });
  expect(html).toContain('<div class="tile"><svg id="mark"></svg></div>');
  expect(html).toContain('border-radius: 28px');
  expect(html).toContain('linear-gradient(135deg, #0c336a, #101a30)');
});
