"use client";

import { useEffect, useRef, useState } from "react";
import { contact, navigation, sections, site, type SectionId } from "@/content/site";
import { EASE, MEDIA, ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { introWasPlayed, onSiteReady } from "@/lib/site-ready";
import { DashedLine } from "./DashedLine";
import { UaeClock } from "./UaeClock";
import { Wordmark } from "./Wordmark";

const MENU_ID = "site-menu";
const TONE = "transition-colors duration-500 group-data-[tone=light]:text-white group-data-[menu=open]:text-white";

export function SiteHeader() {
  const root = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuTimeline = useRef<gsap.core.Timeline | null>(null);
  const [active, setActive] = useState<SectionId>("top");
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      const header = root.current;
      if (!header) return;
      const q = gsap.utils.selector(header);
      const [mark] = q<HTMLElement>("[data-wordmark]");
      const [row] = q<HTMLElement>("[data-row]");
      const [stack] = q<HTMLElement>("[data-stack]");
      const [dock] = q<HTMLElement>("[data-dock]");
      const [bar] = q<HTMLElement>("[data-bar]");
      const footer = document.getElementById("footer");
      const brands = document.getElementById("brands");
      const targets = sections.map((id) => document.getElementById(id));
      const dockScale = () => dock.offsetWidth / mark.offsetWidth;
      const centreInBar = (height: number) => (bar.offsetHeight - height) / 2 - stack.offsetTop;

      /* The wordmark shrinks into the corner and the menu row rises beside it. */
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            start: 0,
            end: () => `+=${mark.offsetHeight}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(mark, { scale: dockScale, y: () => centreInBar(mark.offsetHeight * dockScale()) }, 0)
        .to(row, { y: () => centreInBar(row.offsetHeight) - row.offsetTop }, 0)
        .to(q("[data-tagline]"), { opacity: 0, duration: 0.3 }, 0);

      /* Active section, tone and visibility, read from live positions on every scroll update. */
      let current: SectionId = "top";
      const update = () => {
        const probe = window.innerHeight / 2;
        const edge = bar.offsetHeight;
        let next: SectionId = "top";
        targets.forEach((target, index) => {
          if (target && target.getBoundingClientRect().top <= probe) next = sections[index];
        });
        if (next !== current) {
          current = next;
          setActive(next);
        }
        const overFooter = !!footer && footer.getBoundingClientRect().top <= edge / 2;
        header.dataset.tone = overFooter ? "light" : "dark";

        /* The header steps aside while the brands showcase owns the viewport. */
        const showcase = brands?.getBoundingClientRect();
        header.dataset.hidden = String(!!showcase && showcase.top <= edge && showcase.bottom >= edge);
      };
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: update, onRefresh: update });

      /* Mobile menu: a green panel drops in, links rise through masks. */
      const reduced = !window.matchMedia(MEDIA.motion).matches;
      const menu = gsap
        .timeline({ paused: true })
        .set(q("[data-menu]"), { visibility: "visible" })
        .fromTo(q("[data-menu-backdrop]"), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "none" }, 0)
        .fromTo(q("[data-menu-panel]"), { yPercent: -100 }, { yPercent: 0, duration: 0.8, ease: EASE.split }, 0)
        .fromTo(
          q("[data-menu-link]"),
          { yPercent: 115 },
          { yPercent: 0, duration: 0.9, ease: EASE.mask, stagger: 0.07 },
          0.35,
        )
        .fromTo(q("[data-menu-meta]"), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "none" }, 0.7);
      if (reduced) menu.timeScale(100);
      menuTimeline.current = menu;

      /* Entrance, once the preloader has cleared. */
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        const offReady = onSiteReady(() => {
          gsap.set(q("[data-enter]"), { visibility: "visible" });
          gsap.from(row, { opacity: 0, duration: 0.6, ease: "power1.out" });
          if (!introWasPlayed()) {
            gsap.from(q("[data-wordmark] [data-letter]"), {
              yPercent: 115,
              duration: 1.2,
              ease: EASE.mask,
              stagger: { each: 0.05, from: "center" },
            });
          }
        });
        return offReady;
      });
    },
    { scope: root },
  );

  useEffect(() => {
    const menu = menuTimeline.current;
    if (!menu) return;

    if (!open) {
      menu.reverse();
      return;
    }

    menu.play();
    lockScroll();
    root.current?.querySelector<HTMLElement>("[data-menu-link]")?.focus();

    const close = () => setOpen(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      menuButton.current?.focus();
    };
    const wide = window.matchMedia("(min-width: 768px)");
    window.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", close);

    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", close);
    };
  }, [open]);

  return (
    <header ref={root} data-menu={open ? "open" : "closed"} className="group">
      <a
        href="#main"
        className="label sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-gutter focus:z-100 focus:bg-primary focus:px-4 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>

      <div
        data-shell
        className="fixed inset-x-0 top-0 z-50 transition-transform duration-700 ease-out-expo lg:group-data-[hidden=true]:-translate-y-28"
      >
        <div
          data-bar
          className="absolute inset-x-0 top-0 h-header bg-neutral transition-colors duration-500 group-data-[menu=open]:bg-primary group-data-[tone=light]:bg-primary"
        />
        <span data-dock aria-hidden="true" className="invisible absolute w-dock" />

        <div data-stack className="absolute inset-x-gutter top-gutter flex flex-col gap-3">
          <a
            href="#top"
            data-wordmark
            data-enter
            aria-label="PALCANA, back to top"
            className={`block origin-top-left will-change-transform ${TONE}`}
          >
            <Wordmark />
          </a>

          <div data-row data-enter className={`grid h-12 grid-cols-2 items-center will-change-transform ${TONE}`}>
            <p data-tagline className="max-w-44 text-small font-medium md:max-w-none md:text-body">
              {site.tagline}
            </p>

            <div className="flex items-center justify-end md:justify-between">
              <nav aria-label="Primary" className="hidden md:block">
                <ul className="flex items-center gap-6 text-body font-medium">
                  {navigation.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        aria-current={active === item.id ? "location" : undefined}
                        className="link-underline"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <a href={contact.emailHref} className="type-serif link-underline hidden text-h4 lg:block">
                {contact.email}
              </a>

              <button
                ref={menuButton}
                type="button"
                aria-expanded={open}
                aria-controls={MENU_ID}
                onClick={() => setOpen((value) => !value)}
                className="label -mr-3 flex h-12 items-center gap-3 px-3 md:hidden"
              >
                <span>{open ? "Close" : "Menu"}</span>
                <span aria-hidden="true" className="relative block h-2 w-6">
                  <span className="absolute inset-x-0 top-0 h-px bg-current transition-transform duration-500 ease-out-expo group-data-[menu=open]:translate-y-1 group-data-[menu=open]:rotate-45" />
                  <span className="absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-500 ease-out-expo group-data-[menu=open]:-translate-y-1 group-data-[menu=open]:-rotate-45" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id={MENU_ID} data-menu inert={!open} className="invisible fixed inset-0 z-40 md:hidden">
        <button
          type="button"
          data-menu-backdrop
          tabIndex={-1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 size-full bg-charcoal/50"
        />
        <div
          data-menu-panel
          className="absolute inset-x-0 top-0 flex min-h-[72svh] flex-col gap-8 bg-primary px-gutter pt-44 pb-5 text-white"
        >
          <nav aria-label="Mobile">
            <ul className="flex flex-col gap-1">
              {navigation.map((item, index) => (
                <li key={item.id} className="line-mask">
                  <a
                    href={item.href}
                    data-menu-link
                    aria-current={active === item.id ? "location" : undefined}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 text-h1 aria-[current]:type-serif"
                  >
                    <span className="label">0{index + 1}</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div data-menu-meta className="mt-auto flex flex-col gap-4 text-white">
            <DashedLine className="text-white/50" />
            <div className="flex flex-wrap items-end justify-between gap-4">
              <a href={contact.emailHref} className="type-serif text-h4">
                {contact.email}
              </a>
              <UaeClock />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
