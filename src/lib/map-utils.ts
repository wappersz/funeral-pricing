/**
 * Colour scale for choropleth map.
 * Cheapest = green (#39D353) → teal (#4cbb95) → navy (#002D72) = most expensive.
 */

// Colour stops
const COLOURS = [
  { r: 57, g: 211, b: 83 }, // #39D353 green (cheap)
  { r: 76, g: 187, b: 149 }, // #4cbb95 teal (mid)
  { r: 0, g: 45, b: 114 }, // #002D72 navy (expensive)
];

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Get a colour for a value between min and max.
 * Returns a hex colour string.
 */
export function priceToColour(
  value: number,
  min: number,
  max: number
): string {
  if (max === min) return toHex(COLOURS[1].r, COLOURS[1].g, COLOURS[1].b);

  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));

  // Two-segment interpolation: 0→0.5 = green→teal, 0.5→1 = teal→navy
  let from: (typeof COLOURS)[0];
  let to: (typeof COLOURS)[0];
  let segT: number;

  if (t < 0.5) {
    from = COLOURS[0];
    to = COLOURS[1];
    segT = t * 2;
  } else {
    from = COLOURS[1];
    to = COLOURS[2];
    segT = (t - 0.5) * 2;
  }

  return toHex(lerp(from.r, to.r, segT), lerp(from.g, to.g, segT), lerp(from.b, to.b, segT));
}

/** No data colour */
export const NO_DATA_COLOUR = "#e5e3de";
