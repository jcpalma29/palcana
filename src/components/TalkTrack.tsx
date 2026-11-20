"use client";

import { useRef } from "react";
import { contact } from "@/content/site";
import { MEDIA, gsap, useGSAP } from "@/lib/gsap";
import { createShapeTrack } from "@/lib/shape-track";
import { shapePath } from "@/lib/shapes";
import { DashedLine } from "./DashedLine";

const KEY_STEP = 0.1;
const DRAG_SLOP = 6;

const clamp = gsap.utils.clamp(0, 1);

/**
 * The signature contact control: a diamond rides a dashed track, morphing
 * through polygons into a circle as it follows the pointer. It is a real
 * link, so click, tap and Enter all open WhatsApp.
 */
export function TalkTrack() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = root.current;
      const link = track?.querySelector<HTMLAnchorElement>("[data-shape]");
      const zone = track?.closest<HTMLElement>("[data-talk-zone]");
      if (!track || !link || !zone) return;

      const animated = window.matchMedia(MEDIA.motion).matches;
      const shape = createShapeTrack({
        track,
        mover: link,
        rotor: link.querySelector("svg")!,
        path: link.querySelector("path")!,
        trails: animated,
      });
      const state = { progress: 0 };
      const render = () => shape.render(state.progress);
      const glide = gsap.quickTo(state, "progress", {
        duration: animated ? 0.5 : 0,
        ease: "power3",
        onUpdate: render,
      });
      const progressAt = (clientX: number) => {
        const bounds = track.getBoundingClientRect();
        const size = link.offsetWidth;
        return clamp((clientX - bounds.left - size / 2) / (bounds.width - size));
      };

      /* Mouse: the shape follows the cursor anywhere over the contact area. */
      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType === "mouse") glide(progressAt(event.clientX));
      };

      /* Touch and pen: drag the shape; a tap without movement still follows the link. */
      let dragStart: number | null = null;
      let dragged = false;
      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType === "mouse") return;
        dragStart = event.clientX;
        dragged = false;
        link.setPointerCapture(event.pointerId);
      };
      const onDrag = (event: PointerEvent) => {
        if (dragStart === null) return;
        if (Math.abs(event.clientX - dragStart) > DRAG_SLOP) dragged = true;
        if (dragged) glide(progressAt(event.clientX));
      };
      const onPointerUp = () => {
        dragStart = null;
      };
      const onClick = (event: MouseEvent) => {
        if (dragged) event.preventDefault();
        dragged = false;
      };

      /* Keyboard: arrow keys roll the shape; Enter activates the link natively. */
      const onKeyDown = (event: KeyboardEvent) => {
        const step = event.key === "ArrowRight" ? KEY_STEP : event.key === "ArrowLeft" ? -KEY_STEP : 0;
        if (!step) return;
        event.preventDefault();
        glide(clamp(state.progress + step));
      };

      const resize = new ResizeObserver(render);
      resize.observe(track);
      zone.addEventListener("pointermove", onPointerMove);
      link.addEventListener("pointerdown", onPointerDown);
      link.addEventListener("pointermove", onDrag);
      link.addEventListener("pointerup", onPointerUp);
      link.addEventListener("pointercancel", onPointerUp);
      link.addEventListener("click", onClick);
      link.addEventListener("keydown", onKeyDown);

      if (animated) {
        gsap.from(link, {
          scale: 0,
          duration: 1,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: track, start: "top 90%", once: true },
        });
      }

      return () => {
        resize.disconnect();
        zone.removeEventListener("pointermove", onPointerMove);
        link.removeEventListener("pointerdown", onPointerDown);
        link.removeEventListener("pointermove", onDrag);
        link.removeEventListener("pointerup", onPointerUp);
        link.removeEventListener("pointercancel", onPointerUp);
        link.removeEventListener("click", onClick);
        link.removeEventListener("keydown", onKeyDown);
        shape.kill();
      };
    },
    { scope: root },
  );

  return (
    <div className="flex flex-col gap-4">
      <div ref={root} className="relative h-talk">
        <DashedLine className="absolute inset-x-0 top-1/2 text-primary/50" />
        <a
          data-shape
          href={contact.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-describedby="talk-hint"
          className="label absolute top-0 left-gutter grid size-talk touch-pan-y place-items-center text-white will-change-transform select-none"
        >
          <svg
            viewBox="0 0 100 100"
            aria-hidden="true"
            className="absolute inset-0 size-full overflow-visible fill-primary"
          >
            <path d={shapePath(0)} />
          </svg>
          <span className="relative whitespace-nowrap">
            <span aria-hidden="true" className="max-lg:hidden">[ </span>
            Let&rsquo;s talk
            <span aria-hidden="true" className="max-lg:hidden"> ]</span>
          </span>
          <span className="sr-only"> on WhatsApp (opens in a new tab)</span>
        </a>
      </div>
      <p id="talk-hint" className="label px-gutter text-center text-primary/70">
        <span className="pointer-fine:hidden">&lt; Drag or tap &gt;</span>
        <span className="sr-only pointer-fine:hidden"> — </span>
        <span className="sr-only">Use the left and right arrow keys to move the shape.</span>
      </p>
    </div>
  );
}
