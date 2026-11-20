import type Lenis from "lenis";

type ScrollTarget = number | HTMLElement;
type ScrollOptions = { lerp?: number };

let lenis: Lenis | null = null;
let locks = 0;
let pending: (() => void) | null = null;

export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
  if (instance && locks > 0) instance.stop();
};

export const getLenis = () => lenis;

/**
 * Scrolls to a pixel offset or element, smoothly when Lenis is running.
 * A request made while scrolling is locked (a link tapped inside the open
 * menu) is held until the lock releases.
 */
export function scrollToTarget(target: ScrollTarget, options: ScrollOptions = {}) {
  if (locks > 0) {
    pending = () => scrollToTarget(target, options);
    return;
  }
  if (lenis) {
    lenis.scrollTo(
      target,
      options.lerp ? { lerp: options.lerp } : { duration: 1.4, easing: (t) => 1 - (1 - t) ** 4 },
    );
    return;
  }
  const top =
    typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top });
}

export function lockScroll() {
  locks += 1;
  lenis?.stop();
  document.documentElement.dataset.scrollLock = "";
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  lenis?.start();
  delete document.documentElement.dataset.scrollLock;

  const resume = pending;
  pending = null;
  resume?.();
}
