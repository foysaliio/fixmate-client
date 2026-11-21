"use client";

import { CreditCard, Search, Send, Wrench, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCardBorderHighlight } from "@/components/ui/card-border-highlight";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    title: "Find a Service",
    description: "Choose a repair service.",
    icon: Search,
  },
  {
    title: "Send a Request",
    description: "Tell us what needs fixing.",
    icon: Send,
  },
  {
    title: "Technician Fixes It",
    description: "A technician makes the repair.",
    icon: Wrench,
  },
  {
    title: "Pay After Completion",
    description: "Pay when the work is done.",
    icon: CreditCard,
  },
];

function StepCard({
  title,
  description,
  Icon,
  index,
  reducedMotion,
}: {
  title: string;
  description: string;
  Icon: LucideIcon;
  index: number;
  reducedMotion: boolean | null;
}) {
  const { borderHighlight, ...pointerHandlers } = useCardBorderHighlight(reducedMotion);

  return (
    <li
      className="relative rounded-xl border border-border bg-card p-6 text-card-foreground"
      {...pointerHandlers}
    >
      {borderHighlight}
      <div className="mb-7 flex items-start justify-between">
        <motion.span
          className="flex size-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
          initial={false}
          whileInView={reducedMotion ? undefined : { y: [0, -3, 0] }}
          whileHover={reducedMotion ? undefined : { scale: 1.05 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: index * 0.06 }}
        >
          <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
        </motion.span>
        <span className="text-xs font-semibold tracking-widest text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </li>
  );
}

export function HowFixMateWorks({ bottomPadding = true }: { bottomPadding?: boolean }) {
  const reducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className={
        bottomPadding
          ? "bg-background py-16 text-foreground sm:py-20 lg:py-24"
          : "bg-background pt-16 pb-0 text-foreground sm:pt-20 lg:pt-24"
      }
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mb-9 max-w-xl sm:mb-11">
          <SectionHeading id="how-it-works-heading" label="Simple from start to finish">
            How FixMate Works
          </SectionHeading>
        </div>

        <ol className="grid gap-4 lg:grid-cols-4 lg:gap-5">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <StepCard
              key={title}
              title={title}
              description={description}
              Icon={Icon}
              index={index}
              reducedMotion={reducedMotion}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
