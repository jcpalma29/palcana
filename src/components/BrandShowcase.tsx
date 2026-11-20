import Image from "next/image";
import type { Brand } from "@/content/site";

type BrandShowcaseProps = {
  brand: Brand;
  priority?: boolean;
};

const SIZES = "(min-width: 1024px) 60vw, 100vw";

/**
 * A brand's own logo, shown whole. A logo that ships on its own colour tile
 * fills the panel on that colour; a transparent one sits inset on charcoal.
 */
export function BrandShowcase({ brand, priority = false }: BrandShowcaseProps) {
  const fills = brand.logo.fit === "cover";

  return (
    <div className={`relative grid size-full place-items-center ${fills ? "bg-brand-jcami" : "bg-charcoal"}`}>
      <Image
        src={brand.logo.src}
        alt={brand.logo.alt}
        sizes={SIZES}
        priority={priority}
        className={fills ? "absolute inset-0 size-full object-contain" : "h-auto w-4/5"}
      />
    </div>
  );
}
