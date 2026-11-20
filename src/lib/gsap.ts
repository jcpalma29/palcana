"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

export const MEDIA = {
  motion: "(prefers-reduced-motion: no-preference)",
  desktop: "(min-width: 1024px)",
  pinned: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  stacked: "(max-width: 1023.98px), (prefers-reduced-motion: reduce)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;

export const EASE = {
  mask: "expo.out",
  reveal: "power2.inOut",
  split: "power4.inOut",
} as const;

export const CLIP = {
  hidden: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
  full: "polygon(0% 0%, 100% 0%, 100% 101%, 0% 101%)",
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
