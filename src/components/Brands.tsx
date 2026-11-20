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
const TRANSITION = 1.6;
/**
 * Pinned pacing, in timeline units: each logo holds for HOLD before and after
 * its wipe, and every unit costs SCROLL_PER_UNIT viewport heights of scrolling.
 */
const PIN = { hold: 1.5, wipe: 1.5, scrollPerUnit: 1 };
const pinnedAt = (index: number) => index * (PIN.hold + PIN.wipe);
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

      /* Desktop with reduced motion: the list swaps brands instantly, without pinning. */
      mm.add(MEDIA.still, () => {
        const show = (index: number) =>
          gsap.set(masks, { clipPath: (mask) => (mask <= index ? CLIP.full : CLIP.hidden) });
        show(current.current);
        select.current = (next) => {
          show(next);
          activate(next);
        };
      });

      /* Mobile: each stacked brand image wipes in as it scrolls into view. */
      mm.add(MEDIA.mobileMotion, () => {
        q<HTMLElement>("[data-stack-mask]").forEach((mask) => {
          gsap
            .timeline({
              defaults: { duration: TRANSITION, ease: EASE.reveal },
              scrollTrigger: { trigger: mask, start: "top 75%", once: true },
            })
            .fromTo(mask, { clipPath: CLIP.hidden }, { clipPath: CLIP.full }, 0)
            .fromTo(mask.firstElementChild, { scale: ZOOM.in }, { scale: ZOOM.rest }, 0);
        });
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
      <div data-pin className="pt-24 pb-16 lg:flex lg:h-svh lg:overflow-clip lg:pt-0 lg:pb-0">
        <div className="lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:px-gutter lg:pt-gutter lg:pb-3">
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

          <ol className="mt-8 flex flex-col gap-16 px-gutter lg:hidden">
            {brands.map((brand, index) => (
              <li key={brand.id} className="flex flex-col gap-6">
                <DashedLine />
                <div className="flex items-baseline gap-4">
                  <span className="label">{brand.number}.</span>
                  <div className="flex flex-col gap-2">
                    <h3 className="type-sans text-h3">{brand.name}</h3>
                    <span className="label">{brand.category.join(" / ")}</span>
                  </div>
                </div>
                <a
                  href={brand.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-stack-mask
                  tabIndex={-1}
                  aria-hidden="true"
                  className="block aspect-4/5 overflow-clip sm:aspect-3/2"
                >
                  <div className="size-full will-change-transform">
                    <BrandShowcase brand={brand} priority={index === 0} />
                  </div>
                </a>
                <p className="max-w-measure text-h4">{brand.description}</p>
                <Button href={brand.href} variant="bracket" arrow="out" external>
                  {brand.cta}
                </Button>
              </li>
            ))}
          </ol>

          <div className="hidden lg:mt-auto lg:block">
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

          <div className="hidden lg:mt-6 lg:block">
            <DashedLine />
            <ol>
              {brands.map((brand, index) => (
                <li key={brand.id} className="border-b border-primary last:border-b-0">
                  <button
                    type="button"
                    aria-current={active === index ? "true" : undefined}
                    aria-label={`Show ${brand.name}`}
                    onClick={() => select.current(index)}
                    className="group flex w-full items-end justify-between gap-4 py-6 text-left opacity-30 transition-opacity duration-300 hover:opacity-70 aria-[current]:opacity-100"
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
          className="relative hidden overflow-clip lg:block lg:w-3/5 group/stage data-[cursor=custom]:cursor-none"
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
        </div>
      </div>
    </section>
  );
}
