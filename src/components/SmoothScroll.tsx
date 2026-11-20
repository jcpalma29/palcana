"use client";

import Lenis from "lenis";
import { MEDIA, ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { scrollToTarget, setLenis } from "@/lib/scroll";
import { onSiteReady } from "@/lib/site-ready";

/** Lenis smooth scrolling synced to ScrollTrigger, plus in-page anchor handling. */
export function SmoothScroll() {
  useGSAP(() => {
    const onAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      const target = link && document.getElementById(link.hash.slice(1));
      if (!target) return;

      event.preventDefault();
      scrollToTarget(target.id === "top" ? 0 : target);
      target.focus({ preventScroll: true });
    };
    document.addEventListener("click", onAnchorClick);

    gsap.matchMedia().add(MEDIA.motion, () => {
      const lenis = new Lenis({ lerp: 0.09, autoRaf: false });
      const raf = (time: number) => lenis.raf(time * 1000);

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      lenis.stop();
      setLenis(lenis);
      const offReady = onSiteReady(() => lenis.start());

      return () => {
        offReady();
        gsap.ticker.remove(raf);
        setLenis(null);
        lenis.destroy();
      };
    });

    return () => document.removeEventListener("click", onAnchorClick);
  });

  return null;
}
