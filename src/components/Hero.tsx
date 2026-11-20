"use client";

import { useRef } from "react";
import { hero } from "@/content/site";
import { wordmark } from "@/content/wordmark";
import { EASE, MEDIA, SplitText, gsap, useGSAP } from "@/lib/gsap";
import { createShapeTrack } from "@/lib/shape-track";
import { shapePath } from "@/lib/shapes";
import { onSiteReady } from "@/lib/site-ready";
import { Button } from "./Button";
import { DashedLine } from "./DashedLine";
import { Mark } from "./Mark";
import { UaeClock } from "./UaeClock";

/** Share of the hero's scroll distance over which the shape crosses the track. */
const ROLL_SPAN = 0.8;

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const q = gsap.utils.selector(section);

      gsap.matchMedia().add(MEDIA.motion, () => {
        const [track] = q<HTMLElement>("[data-track]");
        const [roller] = q<HTMLElement>("[data-roller]");
        const shape = createShapeTrack({
          track,
          mover: roller,
          rotor: roller.querySelector("svg")!,
          path: roller.querySelector("path")!,
          trails: true,
        });

        /* Entrance: every line climbs through its mask as the preloader parts. */
        const headline = SplitText.create(q("[data-headline-line]"), { type: "words,chars" });
        const copy = SplitText.create(q("[data-copy]"), { type: "lines", mask: "lines" });
        const entrance = gsap
          .timeline({ paused: true, defaults: { ease: EASE.mask } })
          .set(q("[data-enter]"), { visibility: "visible" })
          .from(headline.chars, { yPercent: 115, duration: 1.2, stagger: 0.022 }, 0.15)
          .from(copy.lines, { yPercent: 115, duration: 1, stagger: 0.08 }, 0.55)
          .from(q("[data-rise]"), { y: 30, opacity: 0, duration: 0.7, ease: "power1.out", stagger: 0.1 }, 0.8)
          .from(roller, { scale: 0, rotation: -135, duration: 1.1, ease: "back.out(1.4)" }, 0.6);
        const offReady = onSiteReady(() => entrance.play());

        /* Scroll: the headline lines drift apart while the shape rolls and morphs. */
        const state = { progress: 0 };
        const scroll = gsap
          .timeline({
            defaults: { ease: "none", duration: 1 },
            scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
          })
          .to(q("[data-drift='left']"), { xPercent: -6 }, 0)
          .to(q("[data-drift='right']"), { xPercent: 8 }, 0)
          .to(
            state,
            { progress: 1, duration: ROLL_SPAN, onUpdate: () => shape.render(state.progress) },
            0,
          );

        return () => {
          offReady();
          scroll.kill();
          shape.kill();
        };
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      tabIndex={-1}
      aria-labelledby="hero-title"
      className="relative flex min-h-svh flex-col overflow-x-clip pt-gutter"
    >
      {/* Reserves the space the fixed wordmark and menu row occupy before they dock. */}
      <div aria-hidden="true" className="invisible flex flex-col gap-3 px-gutter">
        <div style={{ aspectRatio: `${wordmark.width} / ${wordmark.height}` }} />
        <div className="h-12" />
      </div>

      <div className="flex flex-1 flex-col justify-end gap-6 px-gutter pt-2 pb-4">
        <h1 id="hero-title" data-enter className="text-display">
          <span data-drift="left" className="block will-change-transform">
            <span data-headline-line className="type-sans line-mask">
              {hero.headline.sans}
            </span>
          </span>
          <span data-drift="right" className="block will-change-transform lg:pl-[18%]">
            <span data-headline-line className="type-serif line-mask text-[1.08em]">
              {hero.headline.serif}
            </span>
          </span>
        </h1>

        <div className="flex flex-col gap-6 lg:ml-[50%]">
          <p data-copy data-enter className="max-w-measure text-h4">
            {hero.copy}
          </p>
          <div data-rise data-enter className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Button href="#brands" arrow="down">
              Explore Our Brands
            </Button>
            <Button href="#contact" variant="bracket">
              Get in Touch
            </Button>
          </div>
        </div>

        <div className="label flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div data-rise data-enter>
            <UaeClock />
          </div>
          <p data-rise data-enter className="flex items-end gap-3">
            <Mark className="w-10 md:w-12" />
            {hero.disciplines}
          </p>
        </div>
      </div>

      <div data-track aria-hidden="true" className="relative h-roller">
        <DashedLine className="absolute inset-x-0 top-1/2" />
        <div data-roller data-enter className="absolute top-0 left-gutter size-roller will-change-transform">
          <svg viewBox="0 0 100 100" className="size-full overflow-visible fill-current">
            <path d={shapePath(0)} />
          </svg>
        </div>
      </div>
    </section>
  );
}
