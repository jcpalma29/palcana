import type { ReactNode } from "react";
import { ArrowSwap } from "./ArrowSwap";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "bracket";
  arrow?: "down" | "out";
  external?: boolean;
  className?: string;
};

const BRACKET = "transition-transform duration-500 ease-out-expo";

export function Button({
  href,
  children,
  variant = "solid",
  arrow,
  external = false,
  className = "",
}: ButtonProps) {
  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const content = (
    <>
      <span>{children}</span>
      {arrow && <ArrowSwap direction={arrow} />}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  );

  if (variant === "bracket") {
    return (
      <a href={href} className={`group label inline-flex items-center gap-2 py-4 ${className}`} {...externalProps}>
        <span aria-hidden="true" className={`${BRACKET} group-hover:-translate-x-1 group-focus-visible:-translate-x-1`}>
          [
        </span>
        {content}
        <span aria-hidden="true" className={`${BRACKET} group-hover:translate-x-1 group-focus-visible:translate-x-1`}>
          ]
        </span>
      </a>
    );
  }

  return (
    <a
      href={href}
      className={`group label relative inline-flex items-center overflow-clip bg-primary px-5 py-4 text-white ${className}`}
      {...externalProps}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-y-full bg-secondary transition-transform duration-500 ease-out-expo group-hover:translate-y-0 group-focus-visible:translate-y-0"
      />
      <span className="relative inline-flex items-center gap-3">{content}</span>
    </a>
  );
}
