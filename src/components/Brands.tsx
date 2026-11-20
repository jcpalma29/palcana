"use client";

import { useRef, useState } from "react";
import { brands } from "@/content/site";
import { CLIP, EASE, MEDIA, ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { getLenis, scrollToTarget } from "@/lib/scroll";
import { ArrowSwap } from "./ArrowSwap";
import { BrandShowcase } from "./BrandShowcase";
import { Button } from "./Button";
import { DashedLine } from "./DashedLine";
import { RevealText } from "./RevealText";

const LAST = brands.length - 1;
const ZOOM = { in: 1.1, rest: 1, out: 1.2 };
const TRANSITION = 0.9;
/**
 * Pinned pacing, in timeline units: each logo holds for HOLD before and after
 * its wipe, and every unit costs SCROLL_PER_UNIT viewport heights of scrolling.
 */
const PIN = { hold: 1, wipe: 1.2, scrollPerUnit: 0.7 };
const pinnedAt = (index: number) => index * (PIN.hold + PIN.wipe);
const SWIPE_THRESHOLD = 50;
/** Snap rules while pinned: commit forward early, fall back late. */
const SNAP = { forwardAt: 0.1, backAt: 0.9, delay: 120, lerp: 0.1 };
const ORBIT_TEXT = "Explore • Explore • Explore • ";

export function Brands() {
  const root = useRef<HTMLElement>(null);
  const select = useRef<(index: number) => void>(() => {});
  const current = useRef(0);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const masks = q<HTMLElement>("[data-mask]");
      const visuals = q<HTMLElement>("[data-visual]");
      const [stage] = q<HTMLElement>("[data-stage]");
      const mm = gsap.matchMedia();

      const activate = (index: number) => {
        if (index === current.current) return;
        current.current = index;
        setActive(index);
      };

      /* Desktop: the section pins and scrolling wipes each showcase in from the corner. */
      mm.add(MEDIA.pinned, () => {
        const [pin] = q<HTMLElement>("[data-pin]");
        gsap.set(masks, { clipPath: CLIP.hidden });
        gsap.set(visuals, { scale: ZOOM.in });

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: section, start: "top 80%", end: "top top", scrub: true },
          })
          .to(masks[0], { clipPath: CLIP.full, ease: EASE.reveal }, 0)
          .to(visuals[0], { scale: ZOOM.rest }, 0);

        /* Hold on a logo, wipe to the next, hold again; the last hold lets the final logo linger. */
        const steps = gsap.timeline({ defaults: { duration: PIN.wipe, ease: "none" } });
        for (let index = 1; index <= LAST; index++) {
          const at = pinnedAt(index - 1) + PIN.hold;
          steps
            .to(masks[index], { clipPath: CLIP.full, ease: EASE.reveal }, at)
            .to(visuals[index], { scale: ZOOM.rest }, at)
            .to(visuals[index - 1], { scale: ZOOM.out }, at);
        }
        const total = pinnedAt(LAST) + PIN.hold;
        steps.to({}, { duration: total - steps.duration() });

        /* The brand whose wipe is at least half done is the active one. */
        const brandAt = (time: number) =>
          Math.max(0, Math.min(LAST, Math.floor((time - PIN.hold - PIN.wipe / 2) / (PIN.hold + PIN.wipe)) + 1));

        const trigger = ScrollTrigger.create({
          animation: steps,
          trigger: pin,
          start: "top top",
          end: () => `+=${Math.round(total * PIN.scrollPerUnit * window.innerHeight)}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => activate(brandAt(self.progress * total)),
        });
        const offsetAt = (time: number) => trigger.start + ((trigger.end - trigger.start) * time) / total;
        const timeAt = (y: number) => ((y - trigger.start) / (trigger.end - trigger.start)) * total;
        /* Selecting a brand lands just after its wipe, at the start of its hold. */
        select.current = (index) => scrollToTarget(offsetAt(pinnedAt(index) + (index ? 0.05 : 0)));

        /* Lenis glides past the transition, so settle on the nearest brand once input stops. */
        const lenis = getLenis();
        if (!lenis) return;
        let direction = 0;
        let lastY = trigger.scroll();
        let timer: ReturnType<typeof setTimeout>;
        const settle = () => {
          const y = lenis.targetScroll;
          if (y <= trigger.start || y >= trigger.end) return;
          const time = timeAt(y);
          /* Only a half-finished wipe is resolved; holds are left exactly where the reader stopped. */
          for (let index = 1; index <= LAST; index++) {
            const from = pinnedAt(index - 1) + PIN.hold;
            const to = from + PIN.wipe;
            if (time <= from || time >= to) continue;
            const done = (time - from) / PIN.wipe;
            const threshold = direction > 0 ? SNAP.forwardAt : direction < 0 ? SNAP.backAt : 0.5;
            const target = offsetAt(done >= threshold ? to : from);
            if (Math.abs(target - y) > 2) scrollToTarget(target, { lerp: SNAP.lerp });
            return;
          }
        };
        const offScroll = lenis.on("scroll", () => {
          const y = trigger.scroll();
          if (y !== lastY) {
            direction = y > lastY ? 1 : -1;
            lastY = y;
          }
          clearTimeout(timer);
          timer = setTimeout(settle, SNAP.delay);
        });

        return () => {
          clearTimeout(timer);
          offScroll();
        };
      });

      /* Touch layouts and reduced motion: brands switch in place by tap, arrows or swipe. */
      mm.add(MEDIA.stacked, () => {
        const duration = window.matchMedia(MEDIA.motion).matches ? TRANSITION : 0;
        let busy = false;

        gsap.set(masks, { clipPath: (index) => (index <= current.current ? CLIP.full : CLIP.hidden) });

        select.current = (next) => {
          const previous = current.current;
          if (busy || next === previous || next < 0 || next > LAST) return;
          busy = true;
          const forward = next > previous;
          const wiped = forward ? next : previous;
          const timeline = gsap.timeline({
            defaults: { duration, ease: EASE.reveal },
            onComplete: () => {
              busy = false;
            },
          });

          timeline
            .to(masks[wiped], { clipPath: forward ? CLIP.full : CLIP.hidden }, 0)
            .fromTo(
              visuals[wiped],
              { scale: forward ? ZOOM.in : ZOOM.rest },
              { scale: forward ? ZOOM.rest : ZOOM.in },
              0,
            )
            .fromTo(
              visuals[forward ? previous : next],
              { scale: forward ? ZOOM.rest : ZOOM.out },
              { scale: forward ? ZOOM.out : ZOOM.rest },
              0,
            );
          activate(next);
        };

        if (duration) {
          gsap.from(masks[0], {
            clipPath: CLIP.hidden,
            duration,
            ease: EASE.reveal,
            scrollTrigger: { trigger: stage, start: "top 80%", once: true },
          });
        }

        let startX = 0;
        let startY = 0;
        const onTouchStart = (event: TouchEvent) => {
          startX = event.touches[0].clientX;
          startY = event.touches[0].clientY;
        };
        const onTouchEnd = (event: TouchEvent) => {
          const dx = event.changedTouches[0].clientX - startX;
          const dy = event.changedTouches[0].clientY - startY;
          if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
          select.current(current.current + (dx < 0 ? 1 : -1));
        };
        stage.addEventListener("touchstart", onTouchStart, { passive: true });
        stage.addEventListener("touchend", onTouchEnd, { passive: true });

        return () => {
          stage.removeEventListener("touchstart", onTouchStart);
          stage.removeEventListener("touchend", onTouchEnd);
        };
      });

      /* A circular "Explore" cursor trails the pointer across the showcase. */
      mm.add(`${MEDIA.finePointer} and ${MEDIA.motion}`, () => {
        const [cursor] = q<HTMLElement>("[data-cursor]");
        const moveX = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3" });
        const moveY = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3" });
        gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0 });
        stage.dataset.cursor = "custom";

        const onMove = (event: PointerEvent) => {
          const bounds = stage.getBoundingClientRect();
          moveX(event.clientX - bounds.left);
          moveY(event.clientY - bounds.top);
        };
        const show = () => gsap.to(cursor, { scale: 1, duration: 0.5, ease: "back.out(1.6)" });
        const hide = () => gsap.to(cursor, { scale: 0, duration: 0.3, ease: "power2.in" });
        stage.addEventListener("pointermove", onMove);
        stage.addEventListener("pointerenter", show);
        stage.addEventListener("pointerleave", hide);

        return () => {
          delete stage.dataset.cursor;
          stage.removeEventListener("pointermove", onMove);
          stage.removeEventListener("pointerenter", show);
          stage.removeEventListener("pointerleave", hide);
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="brands" tabIndex={-1} aria-labelledby="brands-title" className="relative">
      <div
        data-pin
        className="flex flex-col gap-8 pt-24 pb-16 lg:h-svh lg:flex-row lg:gap-0 lg:overflow-clip lg:pt-0 lg:pb-0"
      >
        <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:px-gutter lg:pt-gutter lg:pb-3">
          <header className="px-gutter lg:px-0">
            <RevealText as="h2" className="text-h1">
              <span id="brands-title">
                <span className="type-sans">Our</span>
                <br />
                <span className="type-serif">Brands</span>
              </span>
            </RevealText>
            <RevealText className="mt-6 ml-auto max-w-56 text-body lg:mr-8">
              Independent identities.
              <br />
              Shared ambition.
            </RevealText>
          </header>

          <div className="order-last px-gutter lg:order-none lg:mt-auto lg:px-0">
            <div className="grid">
              {brands.map((brand, index) => (
                <div
                  key={brand.id}
                  inert={active !== index}
                  className={`col-start-1 row-start-1 flex flex-col items-start gap-2 transition duration-500 ease-out-expo ${
                    active === index ? "delay-150" : "translate-y-3 opacity-0"
                  }`}
                >
                  <p className="max-w-measure text-h4">{brand.description}</p>
                  <Button href={brand.href} variant="bracket" arrow="out" external>
                    {brand.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="order-3 px-gutter lg:order-none lg:mt-6 lg:px-0">
            <DashedLine />
            <ol>
              {brands.map((brand, index) => (
                <li key={brand.id} className="border-b border-primary last:border-b-0">
                  <button
                    type="button"
                    aria-current={active === index ? "true" : undefined}
                    aria-label={`Show ${brand.name}`}
                    onClick={() => select.current(index)}
                    className="group flex w-full items-end justify-between gap-4 py-5 text-left opacity-30 transition-opacity duration-300 hover:opacity-70 aria-[current]:opacity-100 lg:py-6"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="label">{brand.number}.</span>
                      <span className="flex flex-col gap-2 transition-transform duration-500 ease-out-expo group-hover:translate-x-2 group-aria-[current]:translate-x-2">
                        <span className="type-sans text-h3">{brand.name}</span>
                        <span className="label">{brand.category.join(" / ")}</span>
                      </span>
                    </span>
                    <ArrowSwap direction="right" className="label" />
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div
          data-stage
          className="relative order-2 mx-gutter aspect-4/5 overflow-clip sm:aspect-3/2 lg:order-none lg:mx-0 lg:aspect-auto lg:w-3/5 group/stage data-[cursor=custom]:cursor-none"
        >
          {brands.map((brand, index) => (
            <a
              key={brand.id}
              href={brand.href}
              target="_blank"
              rel="noopener noreferrer"
              data-mask
              tabIndex={-1}
              aria-hidden="true"
              className="absolute inset-0 block overflow-clip group-data-[cursor=custom]/stage:cursor-none"
            >
              <div data-visual className="size-full will-change-transform">
                <BrandShowcase brand={brand} priority={index === 0} />
              </div>
            </a>
          ))}

          <div
            data-cursor
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-10 hidden size-28 place-items-center text-white group-data-[cursor=custom]/stage:grid"
          >
            <span className="col-start-1 row-start-1 size-16 rounded-full bg-neutral" />
            <svg viewBox="0 0 100 100" className="label col-start-1 row-start-1 size-full fill-current motion-safe:animate-orbit">
              <defs>
                <path id="explore-orbit" d="M50 50m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" />
              </defs>
              <text className="tracking-widest">
                <textPath href="#explore-orbit" textLength="268">
                  {ORBIT_TEXT}
                </textPath>
              </text>
            </svg>
            <span className="col-start-1 row-start-1 text-h4 text-primary">↗</span>
          </div>

          <div className="label absolute right-0 bottom-0 z-10 flex items-center gap-1 bg-neutral py-1 pl-3 lg:hidden">
            <button
              type="button"
              aria-label="Previous brand"
              disabled={active === 0}
              onClick={() => select.current(active - 1)}
              className="group grid size-11 place-items-center disabled:opacity-30"
            >
              <ArrowSwap direction="left" />
            </button>
            <span aria-live="polite" className="tabular-nums">
              <span className="sr-only">Brand </span>
              {brands[active].number} / {brands[LAST].number}
            </span>
            <button
              type="button"
              aria-label="Next brand"
              disabled={active === LAST}
              onClick={() => select.current(active + 1)}
              className="group grid size-11 place-items-center disabled:opacity-30"
            >
              <ArrowSwap direction="right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
