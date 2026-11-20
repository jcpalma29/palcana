const READY_EVENT = "palcana:ready";

let ready = false;

/** Called once the preloader has finished (or was skipped). */
export function markSiteReady() {
  if (ready) return;
  ready = true;
  window.dispatchEvent(new Event(READY_EVENT));
}

/** Runs `callback` as soon as the page is revealed. Returns an unsubscribe. */
export function onSiteReady(callback: () => void) {
  if (ready) {
    callback();
    return () => {};
  }
  window.addEventListener(READY_EVENT, callback, { once: true });
  return () => window.removeEventListener(READY_EVENT, callback);
}

export const introWasPlayed = () => document.documentElement.dataset.intro !== "skip";
