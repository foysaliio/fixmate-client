import type { ReactNode } from "react";

type SectionHeadingProps = {
  label: string;
  children: ReactNode;
  id?: string;
  level?: "h1" | "h2";
};

export function SectionHeading({
  label,
  children,
  id,
  level = "h2",
}: SectionHeadingProps) {
  const Heading = level;

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
        {label}
      </p>
      <Heading
        id={id}
        className={
          level === "h1"
            ? "font-heading text-[clamp(2.25rem,11.1vw,2.85rem)] font-bold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.25rem]"
            : "font-heading text-3xl font-bold tracking-tight sm:text-4xl"
        }
      >
        {children}
      </Heading>
    </div>
  );
}
