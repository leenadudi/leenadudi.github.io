/** Shared colour helpers for the five section panels. */

export const CREAM = "#FDF6EC";
export const DARK_INK = "#000000";

/** `#rrggbb` → `rgba(r,g,b,a)` */
export function rgba(hex: string, a: number): string {
  const c = hex.replace("#", "").slice(0, 6);
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function relLuminance(hex: string): number {
  const c = hex.replace("#", "").slice(0, 6);
  const lin = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [relLuminance(a), relLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Pick the higher-contrast ink (cream or near-black) for a given panel colour. */
export function labelColor(hex: string): string {
  return contrast(hex, DARK_INK) >= contrast(hex, CREAM) ? DARK_INK : CREAM;
}
