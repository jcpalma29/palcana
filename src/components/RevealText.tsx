"use client";

import { useRef, type ReactNode } from "react";
import { EASE, MEDIA, SplitText, gsap, useGSAP } from "@/lib/gsap";

type RevealTextProps = {
  as?: "h2" | "p";
  children: ReactNode;
  className?: string;
};

/** Splits its text into lines and slides each one up through a mask on scroll. */
export function RevealText({ as: Tag = "p", children, className = "" }: RevealTextProps) {
  const ref = useRef<HTMLHeadingElement & HTMLParagraphElement>(null);

  useGSAP(() => {
    const element = ref.current;
    if (!element) return;

    gsap.matchMedia().add(MEDIA.motion, () => {
      SplitText.create(element, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 115,
            duration: 1.1,
            ease: EASE.mask,
            stagger: 0.1,
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          }),
      });
    });
  });

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
