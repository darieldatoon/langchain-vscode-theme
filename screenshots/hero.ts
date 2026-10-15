import type { Hex } from '../src/color.ts';

export type Size = { readonly width: number; readonly height: number };

export type HeroInput = {
  /** PNG data URLs of the same window in each variant. */
  readonly light: string;
  readonly dark: string;
  readonly window: Size;
  readonly padding: number;
  readonly radius: string;
  /** The diagonal seam between the two variants. */
  readonly divider: Hex;
  readonly backdrop: {
    readonly glow: Hex;
    readonly accent: Hex;
    readonly from: Hex;
    readonly to: Hex;
  };
  readonly labels: { readonly light: string; readonly dark: string };
};

/** Where the split crosses the top and bottom edges, in percent of width. */
const SPLIT = { top: 62, bottom: 38 } as const;

export const heroSize = ({ window, padding }: HeroInput): Size => ({
  width: window.width + padding * 2,
  height: window.height + padding * 2,
});

/** A page showing the light window over the dark one, cut on a diagonal. */
export function heroHtml(input: HeroInput): string {
  const { light, dark, window, padding, radius, divider, backdrop, labels } =
    input;
  const { width, height } = heroSize(input);
  return `<!doctype html>
<html>
<head>
<style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: ${width}px;
    height: ${height}px;
    position: relative;
    overflow: hidden;
    font: 600 18px/1 Inter, -apple-system, BlinkMacSystemFont, sans-serif;
    letter-spacing: -0.01em;
    color: #ffffffd9;
    background:
      radial-gradient(circle at 12% 8%, ${backdrop.glow} 0, transparent 45%),
      radial-gradient(circle at 92% 96%, ${backdrop.accent} 0, transparent 40%),
      linear-gradient(135deg, ${backdrop.from}, ${backdrop.to});
  }
  .window {
    position: absolute;
    left: ${padding}px;
    top: ${padding}px;
    width: ${window.width}px;
    height: ${window.height}px;
    border-radius: ${radius};
    overflow: hidden;
    box-shadow:
      0 0 0 1px #ffffff26,
      0 30px 80px -20px #000000b3,
      0 12px 30px -10px #00000080;
  }
  .window img, .window svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .light {
    clip-path: polygon(0 0, ${SPLIT.top}% 0, ${SPLIT.bottom}% 100%, 0 100%);
  }
  .label { position: absolute; }
  .label.light-label { left: ${padding}px; top: ${padding / 2 - 9}px; }
  .label.dark-label { right: ${padding}px; bottom: ${padding / 2 - 9}px; }
</style>
</head>
<body>
  <div class="label light-label">${labels.light}</div>
  <div class="window">
    <img src="${dark}" alt="">
    <img class="light" src="${light}" alt="">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="${SPLIT.top}" y1="0" x2="${SPLIT.bottom}" y2="100"
        stroke="${divider}" stroke-width="3"
        vector-effect="non-scaling-stroke" />
    </svg>
  </div>
  <div class="label dark-label">${labels.dark}</div>
</body>
</html>`;
}
