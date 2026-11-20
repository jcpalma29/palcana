import { RevealText } from "./RevealText";
import { TalkTrack } from "./TalkTrack";

export function Contact() {
  return (
    <section
      id="contact"
      tabIndex={-1}
      data-talk-zone
      aria-labelledby="contact-title"
      className="relative overflow-x-clip pt-24 pb-16 lg:pt-32 lg:pb-24"
    >
      <div className="mx-auto flex max-w-prose flex-col items-center gap-8 px-gutter text-center lg:gap-10">
        <p className="type-serif rounded-[50%] border border-primary px-7 py-3 text-h4">Contact</p>
        <RevealText as="h2" className="text-h2">
          <span id="contact-title">
            <span className="type-sans">Have something</span>
            <br />
            <span className="type-serif text-[1.08em]">in mind?</span>
          </span>
        </RevealText>
        <RevealText className="max-w-72 text-h4">
          Let&rsquo;s build something worth talking about.
        </RevealText>
      </div>

      <div className="mt-12 lg:mt-20">
        <TalkTrack />
      </div>
    </section>
  );
}
