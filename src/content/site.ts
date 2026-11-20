import jcamiLogo from "../../public/jcami-logo3.png";
import rivetLogo from "../../public/rivet-logo-trimmed.png";

export const site = {
  name: "PALCANA",
  url: "https://palcana.com",
  title: "PALCANA | Independent Brands & Digital Ventures",
  tagline: "Independent Brands & Digital Ventures",
  description:
    "PALCANA is a UAE-registered business group bringing independent brands, creative ventures, software development, and e-commerce together.",
} as const;

/** Page sections in scroll order; the wordmark links back to `top`. */
export const sections = ["top", "brands", "contact"] as const;

export type SectionId = (typeof sections)[number];

export const navigation = [
  { id: "brands", label: "Our Brands", href: "#brands" },
  { id: "contact", label: "Contact", href: "#contact" },
] as const;

export const hero = {
  headline: { sans: "Different ideas.", serif: "One vision." },
  copy: "PALCANA is a UAE-registered business group bringing independent brands, digital experiences, and creative ventures together, working with clients and partners all over the world.",
  disciplines: "Digital × Ecommerce × Creative",
} as const;

export const brands = [
  {
    id: "jcami",
    number: "01",
    name: "JCAMI.DEV",
    category: ["Software Development", "Digital Experiences"],
    description:
      "Building thoughtful digital experiences through software, design, and technology.",
    href: "https://jcami.dev",
    domain: "jcami.dev",
    cta: "Explore JCAMI.DEV",
    logo: { src: jcamiLogo, alt: "JCAMI.DEV logo", fit: "cover" },
  },
  {
    id: "rivet",
    number: "02",
    name: "RIVET STUDIOS",
    category: ["Fashion", "Lifestyle", "E-Commerce"],
    description:
      "An independent fashion and lifestyle brand celebrating individuality and self-expression.",
    href: "https://www.rivetstudios.store/",
    domain: "rivetstudios.store",
    cta: "Explore RIVET STUDIOS",
    logo: { src: rivetLogo, alt: "RIVET STUDIOS logo", fit: "inset" },
  },
] as const;

export type Brand = (typeof brands)[number];

export const contact = {
  email: "hello@palcana.com",
  emailHref: "mailto:hello@palcana.com",
  whatsapp: "+971 58 565 0930",
  whatsappTel: "+971585650930",
  whatsappHref: "https://wa.me/971585650930",
} as const;

export const company = {
  status: "UAE-Registered Business",
  locality: "Dubai",
  country: "United Arab Emirates",
  countryCode: "AE",
} as const;
