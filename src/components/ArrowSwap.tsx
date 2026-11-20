const DIRECTIONS = {
  down: {
    glyph: "↓",
    leave: "group-hover:translate-y-full group-focus-visible:translate-y-full",
    enter: "-translate-y-full",
  },
  out: {
    glyph: "↗",
    leave:
      "group-hover:translate-x-full group-hover:-translate-y-full group-focus-visible:translate-x-full group-focus-visible:-translate-y-full",
    enter: "-translate-x-full translate-y-full",
  },
  left: {
    glyph: "←",
    leave: "group-hover:-translate-x-full group-focus-visible:-translate-x-full",
    enter: "translate-x-full",
  },
  right: {
    glyph: "→",
    leave: "group-hover:translate-x-full group-focus-visible:translate-x-full",
    enter: "-translate-x-full",
  },
} as const;

type ArrowSwapProps = {
  direction: keyof typeof DIRECTIONS;
  className?: string;
};

const MOTION = "block transition-transform duration-500 ease-out-expo";

/** Arrow that exits and re-enters along its own direction when its `group` is hovered. */
export function ArrowSwap({ direction, className = "" }: ArrowSwapProps) {
  const { glyph, leave, enter } = DIRECTIONS[direction];

  return (
    <span aria-hidden="true" className={`relative inline-block overflow-clip ${className}`}>
      <span className={`${MOTION} ${leave}`}>{glyph}</span>
      <span
        className={`absolute inset-0 ${MOTION} ${enter} group-hover:translate-0 group-focus-visible:translate-0`}
      >
        {glyph}
      </span>
    </span>
  );
}
