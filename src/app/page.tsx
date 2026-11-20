import { Brands } from "@/components/Brands";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Preloader } from "@/components/Preloader";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <>
      <Preloader />
      <SiteHeader />
      <main id="main" className="relative z-10 bg-neutral">
        <Hero />
        <Brands />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
