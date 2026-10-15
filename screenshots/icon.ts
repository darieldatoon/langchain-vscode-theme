import type { Hex } from '../src/color.ts';

export type IconInput = {
  /** Inline SVG markup; it should paint with `currentColor`. */
  readonly logomark: string;
  readonly size: number;
  readonly backdrop: {
    readonly glow: Hex;
    readonly accent: Hex;
    readonly from: Hex;
    readonly to: Hex;
  };
};

/** A rounded tile with the logomark centered on the hero's backdrop. */
export function iconHtml({ logomark, size, backdrop }: IconInput): string {
  return `<!doctype html>
<html>
<head>
<style>
  * { margin: 0; }
  html, body { width: ${size}px; height: ${size}px; background: transparent; }
  .tile {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    border-radius: ${Math.round(size * 0.22)}px;
    color: #ffffff;
    background:
      radial-gradient(circle at 18% 12%, ${backdrop.glow} 0, transparent 60%),
      radial-gradient(circle at 92% 96%, ${backdrop.accent} 0, transparent 55%),
      linear-gradient(135deg, ${backdrop.from}, ${backdrop.to});
  }
  .tile svg { width: 62%; height: 62%; }
</style>
</head>
<body><div class="tile">${logomark}</div></body>
</html>`;
}
