/** Morph stages: diamond → hexagon → octagon → dodecagon → circle (0 sides). */
const STAGES = [4, 6, 8, 12, 0] as const;
const SAMPLES = 96;

export const SHAPE_CHECKPOINTS = STAGES.map((_, index) => index / (STAGES.length - 1));

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Distance from the centre to the edge of a regular polygon at `theta` (vertex at 0). */
function radial(sides: number, theta: number) {
  if (!sides) return 1;
  const segment = (2 * Math.PI) / sides;
  const local = (((theta % segment) + segment) % segment) - segment / 2;
  return Math.cos(Math.PI / sides) / Math.cos(local);
}

/**
 * SVG path for the morphing shape at `progress` (0 = diamond, 1 = circle),
 * centred in a square box of `size`. Every stage shares one sampled outline,
 * so any two values of `progress` interpolate without a morphing plugin.
 */
export function shapePath(progress: number, size = 100) {
  const clamped = Math.min(1, Math.max(0, progress));
  const position = clamped * (STAGES.length - 1);
  const lower = Math.min(STAGES.length - 2, Math.floor(position));
  const blend = smooth(position - lower);
  const centre = size / 2;
  let path = "";

  for (let index = 0; index < SAMPLES; index++) {
    const theta = (index / SAMPLES) * 2 * Math.PI;
    const from = radial(STAGES[lower], theta);
    const to = radial(STAGES[lower + 1], theta);
    const radius = (from + (to - from) * blend) * centre;
    const x = centre + radius * Math.sin(theta);
    const y = centre - radius * Math.cos(theta);
    path += `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  return `${path}Z`;
}
