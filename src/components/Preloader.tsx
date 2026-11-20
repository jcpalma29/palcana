"use client";

import { useRef } from "react";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { shapePath } from "@/lib/shapes";
import { markSiteReady } from "@/lib/site-ready";
import { DashedLine } from "./DashedLine";
import { Wordmark } from "./Wordmark";

const SESSION_KEY = "palcana:intro";
const ASSET_TIMEOUT = 4000;
const DOT_COUNT = 5;

const ONES_STEP = 5;

/** How far a reel has turned into its next digit while the reel to its right rolls over. */
const carry = (count: number, span: number) =>
  Math.floor(count / span) + Math.max(0, (count % span) - (span - ONES_STEP)) / ONES_STEP;

/** Odometer reels for the 0–100 counter; `turns` maps the count to a digit index. */
const REELS = [
  { id: "hundreds", digits: [0, 1], turns: (count: number) => carry(count, 100) },
  { id: "tens", digits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0], turns: (count: number) => carry(count, 10) },
  {
    id: "ones",
    digits: Array.from({ length: 21 }, (_, index) => (index % 2 ? ONES_STEP : 0)),
    turns: (count: number) => count / ONES_STEP,
  },
] as const;

/** Resolves when fonts and the page itself have loaded (or after a timeout). */
function assetsReady() {
  const loaded = new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, ASSET_TIMEOUT));
  return Promise.race([Promise.all([document.fonts.ready, loaded]), timeout]);
}

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const html = document.documentElement;
      if (html.dataset.intro !== "play") {
        markSiteReady();
        return;
      }

      const q = gsap.utils.selector(root);
      const reels = q<HTMLElement>("[data-reel]");
      const dots = q<SVGPathElement>("[data-dot] path");
      const [marker] = q<SVGPathElement>("[data-marker] path");
      const state = { count: 0, morph: 0 };

      const render = () => {
        reels.forEach((reel, index) => {
          const { digits, turns } = REELS[index];
          gsap.set(reel, { yPercent: (-turns(state.count) / digits.length) * 100 });
        });
        dots.forEach((dot, index) => {
          const reached = Math.min(state.morph * (DOT_COUNT - 1), index);
          dot.setAttribute("d", shapePath(reached / (DOT_COUNT - 1)));
        });
        marker.setAttribute("d", shapePath(state.morph));
      };

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      const isCompact = window.matchMedia("(max-width: 767.98px)").matches;
      timeline.timeScale(isCompact ? 1.3 : 1);

      timeline
        .from(
          q("[data-letter]"),
          { yPercent: -140, duration: 1.5, stagger: { each: 0.06, from: "center" } },
          0,
        )
        .fromTo(
          q("[data-seam-line]"),
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: EASE.reveal },
          0.2,
        )
        .from(q("[data-seam-item]"), { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.3)
        .from(q("[data-dot]"), { scale: 0, duration: 0.5, stagger: 0.06, ease: "back.out(2)" }, 0.5)
        .to(state, { count: 100, morph: 1, duration: 2.8, ease: EASE.reveal, onUpdate: render }, 0.4)
        .fromTo(
          q("[data-cut]"),
          { xPercent: -100 },
          { xPercent: 0, duration: 2.8, ease: EASE.reveal },
          0.4,
        )
        .fromTo(
          q("[data-marker]"),
          { rotation: 0 },
          { rotation: 540, transformOrigin: "50% 50%", duration: 2.8, ease: EASE.reveal },
          0.4,
        )
        .addPause(">", () => {
          assetsReady().then(() => timeline.play());
        })
        .to(q("[data-seam]"), { autoAlpha: 0, duration: 0.25, ease: "none" })
        .addLabel("split")
        .to(q("[data-cover='top']"), { yPercent: -100, duration: 1.1, ease: EASE.split }, "split")
        .to(q("[data-cover='bottom']"), { yPercent: 100, duration: 1.1, ease: EASE.split }, "split")
        .call(markSiteReady, undefined, "split+=0.3")
        .call(() => {
          html.dataset.intro = "done";
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* Storage can be unavailable; the intro then simply replays. */
          }
        });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-preloader
      role="status"
      aria-label="Loading PALCANA"
      className="fixed inset-0 z-100 text-white"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <div data-cover="top" className="absolute inset-x-0 top-0 h-3/5 overflow-clip bg-primary">
          <div className="absolute inset-x-gutter top-gutter">
            <Wordmark />
          </div>
        </div>

        <div data-cover="bottom" className="absolute inset-x-0 bottom-0 h-2/5 bg-primary">
          <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
            {Array.from({ length: DOT_COUNT }, (_, index) => (
              <svg key={index} data-dot viewBox="0 0 100 100" className="size-3 fill-current">
                <path d={shapePath(0)} />
              </svg>
            ))}
          </div>
        </div>

        <div data-seam className="absolute inset-x-0 bottom-2/5 overflow-x-clip">
          <div data-seam-item className="label absolute bottom-3 left-gutter flex h-[1lh] items-start overflow-clip tabular-nums">
            {REELS.map((reel) => (
              <span key={reel.id} data-reel className="flex flex-col">
                {reel.digits.map((digit, index) => (
                  <span key={index}>{digit}</span>
                ))}
              </span>
            ))}
          </div>
          <p data-seam-item className="label absolute right-gutter bottom-3">
            Taking shape
          </p>

          <div data-seam-line className="text-white/50">
            <DashedLine />
          </div>
          <div data-cut className="absolute inset-x-0 top-0 h-px bg-white">
            <span className="absolute top-1/2 left-full size-3.5 -translate-x-1/2 -translate-y-1/2">
              <svg data-marker viewBox="0 0 100 100" className="size-full fill-current">
                <path d={shapePath(0)} />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
