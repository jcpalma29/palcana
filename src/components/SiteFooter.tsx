import { company, contact, navigation } from "@/content/site";
import { CopyrightYear } from "./CopyrightYear";
import { FooterWordmark } from "./FooterWordmark";
import { Mark } from "./Mark";
import { UaeClock } from "./UaeClock";

/** Sticks to the viewport bottom on roomy screens, so the page above lifts away to reveal it. */
const REVEAL = "[@media(min-width:1024px)_and_(min-height:720px)]:sticky [@media(min-width:1024px)_and_(min-height:720px)]:bottom-0";

export function SiteFooter() {
  return (
    <footer
      id="footer"
      className={`relative flex flex-col gap-20 bg-primary px-gutter pt-5 pb-3 text-white lg:gap-28 ${REVEAL}`}
    >
      <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-[49%_1fr_25%]">
        <ul className="flex flex-col items-start gap-1 sm:col-span-2 lg:col-span-1">
          <li>
            <a href={contact.emailHref} className="type-serif link-underline text-h4">
              {contact.email}
            </a>
          </li>
          <li>
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
            >
              <span className="sr-only">WhatsApp </span>
              {contact.whatsapp}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>

        <div className="flex flex-col items-start gap-4">
          <address className="flex flex-col gap-1 not-italic">
            <span>PALCANA</span>
            <span>{company.status}</span>
            <span>
              {company.locality}, {company.country}
            </span>
          </address>
          <UaeClock />
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-col items-start gap-1">
            {navigation.map((item) => (
              <li key={item.id}>
                <a href={item.href} className="link-underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <FooterWordmark />
        <div className="flex items-end justify-between gap-4">
          <p className="label normal-case">
            PALCANA © <CopyrightYear /> All rights reserved.
          </p>
          <Mark className="w-20 md:w-28" />
        </div>
      </div>

      <div
        data-footer-shade
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-charcoal/60 opacity-0"
      />
    </footer>
  );
}
