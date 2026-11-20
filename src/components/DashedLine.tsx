type DashedLineProps = {
  className?: string;
};

export function DashedLine({ className = "" }: DashedLineProps) {
  return <span aria-hidden="true" className={`dashed-line ${className}`} />;
}
