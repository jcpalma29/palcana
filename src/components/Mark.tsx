import { mark } from "@/content/mark";

type MarkProps = {
  className?: string;
};

/** The rising-blade symbol; decorative, so it is hidden from assistive tech. */
export function Mark({ className = "" }: MarkProps) {
  return (
    <svg
      viewBox={`0 0 ${mark.width} ${mark.height}`}
      aria-hidden="true"
      fill="currentColor"
      className={`block h-auto shrink-0 ${className}`}
    >
      <path d={mark.d} />
    </svg>
  );
}
