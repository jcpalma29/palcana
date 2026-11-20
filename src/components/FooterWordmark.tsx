"use client";

import { useRef } from "react";
import { MEDIA, gsap, useGSAP } from "@/lib/gsap";
import { Wordmark } from "./Wordmark";

/**
 * The closing logotype. As the page lifts away to uncover the footer, the
 * shade over it clears and the letters rise into place, centre first.
 */
export function FooterWordmark() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MEDIA.motion, () => {
        const shade = document.querySelector("[data-footer-shade]");

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: document.getElementById("main"),
              start: "bottom bottom",
              end: "max",
              scrub: true,
            },
          })
          .fromTo(shade, { opacity: 1 }, { opacity: 0, duration: 1 }, 0)
          .from(
            "[data-letter]",
            { yPercent: 105, duration: 0.6, ease: "power2.out", stagger: { each: 0.06, from: "center" } },
            0.1,
          );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true">
      <Wordmark />
    </div>
  );
}
