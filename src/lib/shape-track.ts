import { gsap } from "./gsap";
import { SHAPE_CHECKPOINTS, shapePath } from "./shapes";

const SVG_NS = "http://www.w3.org/2000/svg";
const FULL_TURNS = 450;

type ShapeTrackOptions = {
  /** Positioned container the shape travels across. */
  track: HTMLElement;
  /** Element translated along the track. */
  mover: HTMLElement;
  /** Element rotated as the shape rolls. */
  rotor: SVGElement;
  /** Path whose outline morphs. */
  path: SVGPathElement;
  /** Leave fading outlines behind at each morph checkpoint. */
  trails: boolean;
};

/**
 * Drives a shape along a horizontal track: `render(progress)` moves, rolls
 * and morphs it from diamond (0) to circle (1).
 */
export function createShapeTrack({ track, mover, rotor, path, trails }: ShapeTrackOptions) {
  const live = new Set<HTMLElement>();
  let previous = 0;

  const travel = () => track.clientWidth - mover.offsetWidth - mover.offsetLeft * 2;

  function leaveTrail(checkpoint: number) {
    const ghost = document.createElement("div");
    const svg = document.createElementNS(SVG_NS, "svg");
    const outline = document.createElementNS(SVG_NS, "path");

    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("class", "size-full overflow-visible");
    outline.setAttribute("d", shapePath(checkpoint));
    outline.setAttribute("fill", "none");
    outline.setAttribute("stroke", "currentColor");
    outline.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(outline);
    ghost.appendChild(svg);

    ghost.setAttribute("aria-hidden", "true");
    ghost.className = "pointer-events-none absolute";
    ghost.style.left = `${mover.offsetLeft}px`;
    ghost.style.top = `${mover.offsetTop}px`;
    ghost.style.width = `${mover.offsetWidth}px`;
    ghost.style.height = `${mover.offsetHeight}px`;
    track.insertBefore(ghost, mover);
    live.add(ghost);

    gsap.fromTo(
      ghost,
      { x: checkpoint * travel(), rotation: checkpoint * FULL_TURNS },
      {
        rotation: `+=${45 * Math.sign(checkpoint - previous || 1)}`,
        opacity: 0,
        duration: 0.5 + live.size * 0.3,
        ease: "power2.out",
        onComplete: () => {
          ghost.remove();
          live.delete(ghost);
        },
      },
    );
  }

  return {
    render(progress: number) {
      gsap.set(mover, { x: progress * travel() });
      gsap.set(rotor, { rotation: progress * FULL_TURNS });
      path.setAttribute("d", shapePath(progress));

      if (trails) {
        for (const checkpoint of SHAPE_CHECKPOINTS) {
          const crossed =
            (previous < checkpoint && progress >= checkpoint) ||
            (previous > checkpoint && progress <= checkpoint);
          if (crossed) leaveTrail(checkpoint);
        }
      }
      previous = progress;
    },
    kill() {
      live.forEach((ghost) => {
        gsap.killTweensOf(ghost);
        ghost.remove();
      });
      live.clear();
    },
  };
}
