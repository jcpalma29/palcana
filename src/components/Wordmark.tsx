import { wordmark } from "@/content/wordmark";

type WordmarkProps = {
  className?: string;
};

/** Decorative by default; each piece is a `data-letter` group so it can animate on its own. */
export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <svg
      viewBox={`0 0 ${wordmark.width} ${wordmark.height}`}
      aria-hidden="true"
      fill="currentColor"
      fillRule="evenodd"
      className={`block h-auto w-full ${className}`}
    >
      {wordmark.pieces.map((piece, index) => (
        <g key={index} data-letter>
          <path d={piece.d} transform={`translate(${piece.x})`} />
        </g>
      ))}
    </svg>
  );
}
