import type { Metadata, Viewport } from "next";
import { Archivo, Fira_Code, Instrument_Serif } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import { company, contact, site } from "@/content/site";
import "./globals.css";

const sans = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-instrument",
});

const mono = Fira_Code({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fira",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#102a20",
  colorScheme: "light",
};

/**
 * Runs before first paint: decides whether motion is allowed and whether the
 * preloader plays (once per browser session, never with reduced motion).
 */
const BOOT_SCRIPT = `(function(){var d=document.documentElement,s=d.dataset;try{var r=matchMedia("(prefers-reduced-motion: reduce)").matches;s.motion=r?"off":"on";s.intro=r||sessionStorage.getItem("palcana:intro")?"skip":"play"}catch(e){s.motion="off";s.intro="skip"}})()`;

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  description: site.description,
  email: contact.email,
  address: {
    "@type": "PostalAddress",
    addressRegion: company.locality,
    addressCountry: company.countryCode,
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: contact.email,
    telephone: contact.whatsappTel,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${mono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organization).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="min-h-svh">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
