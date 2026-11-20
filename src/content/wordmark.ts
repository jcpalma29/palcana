/**
 * The PALCANA logotype: high-contrast geometric capitals on a 100-unit cap
 * height, thick strokes at 22 units against 13-unit hairlines. Its edge comes
 * from pointed, open A apexes, a chamfered P and the slanted cuts on the C;
 * its softness from the round bowl, the vertical-stress C and the L, which
 * turns its corner on a curve and runs its foot on to carry the C.
 * One entry per animated piece, in reading order (L and C form one piece).
 */
const P = "M0 10L10 0H46A29 29 0 0 1 46 58H22V100H0ZM22 13V45H46A15 16 0 0 0 46 13Z";
const A = "M0 100L48 0L96 100H71.6L43.01 40.44L14.42 100Z";
const LC =
  "M0 0H22V79A8 8 0 0 0 30 87H108V100H26A26 26 0 0 1 0 74ZM98 10.83A38 40 0 1 0 98 69.17L82 61.83A17 27 0 1 1 82 18.17Z";
const N = "M0 100V0H30L73 76.79V0H86V100H56L13 23.21V100Z";

export const wordmark = {
  width: 629,
  height: 100,
  pieces: [
    { d: P, x: 0 },
    { d: A, x: 89 },
    { d: LC, x: 199 },
    { d: A, x: 323 },
    { d: N, x: 433 },
    { d: A, x: 533 },
  ],
} as const;
