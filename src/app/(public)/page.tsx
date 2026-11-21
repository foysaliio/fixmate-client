"use client";

import { ArrowRight, CreditCard, Search, Send, Wrench, type LucideIcon } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState, type PointerEvent } from "react";
import repairWorkshop from "../../../public/images/fixmate-repair-workshop.webp";
import { Button } from "@/components/ui/button";

const MotionLink = motion.create(Link);

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

const borderSides = ["top", "right", "bottom", "left"] as const;

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
  const [activeSide, setActiveSide] = useState<(typeof borderSides)[number] | null>(null);
  const lineX = useMotionValue(0);
  const lineY = useMotionValue(0);
  const smoothX = useSpring(lineX, { stiffness: 320, damping: 32 });
  const smoothY = useSpring(lineY, { stiffness: 320, damping: 32 });

  function moveHighlight(event: PointerEvent<HTMLLIElement>) {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - bounds.left, bounds.width));
    const y = Math.max(0, Math.min(event.clientY - bounds.top, bounds.height));
    const nearest = Math.min(x, bounds.width - x, y, bounds.height - y);

    lineX.set(Math.max(0, Math.min(x - 48, bounds.width - 96)));
    lineY.set(Math.max(0, Math.min(y - 48, bounds.height - 96)));

    if (nearest === x) {
      setActiveSide("left");
    } else if (nearest === bounds.width - x) {
      setActiveSide("right");
    } else if (nearest === y) {
      setActiveSide("top");
    } else {
      setActiveSide("bottom");
    }
  }

  return (
    <li
      className="relative rounded-xl border border-border bg-card p-6 text-card-foreground"
      onPointerEnter={moveHighlight}
      onPointerMove={moveHighlight}
      onPointerLeave={() => setActiveSide(null)}
    >
      {borderSides.map((side) => {
        const horizontal = side === "top" || side === "bottom";
        return (
          <motion.span
            key={side}
            aria-hidden="true"
            style={{
              position: "absolute",
              pointerEvents: "none",
              width: horizontal ? 96 : 2,
              height: horizontal ? 2 : 96,
              top: side === "top" ? -1 : horizontal ? undefined : 0,
              bottom: side === "bottom" ? -1 : undefined,
              left: side === "right" ? undefined : 0,
              right: side === "right" ? -1 : undefined,
              background: horizontal
                ? "linear-gradient(to right, transparent, var(--primary), transparent)"
                : "linear-gradient(to bottom, transparent, var(--primary), transparent)",
              x: horizontal ? (reducedMotion ? lineX : smoothX) : undefined,
              y: horizontal ? undefined : reducedMotion ? lineY : smoothY,
            }}
            initial={false}
            animate={{ opacity: activeSide === side ? 1 : 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          />
        );
      })}
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

export default function Home() {
  const reducedMotion = useReducedMotion();

  return (
    <main>
      <section className="overflow-hidden bg-background text-foreground">
        <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] w-full max-w-6xl grid-cols-1 items-center gap-7 px-5 py-7 sm:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-12 lg:py-14">
          <div className="max-w-xl text-left">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
              For devices &amp; appliances
            </p>
            <h1 className="font-heading text-[clamp(2.25rem,11.1vw,2.85rem)] font-bold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.25rem]">
              Get it fixed.
              <br />
              <span className="text-primary">Stay in the loop.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Book a verified technician, track your repair, and pay after the job is done.
            </p>
            <Button
              nativeButton={false}
              render={
                <MotionLink
                  href="/services"
                  whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                />
              }
              className="mt-8 h-12 gap-2 px-6 text-base motion-reduce:transition-none"
            >
              Browse Services <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>

          <div className="relative order-first h-[min(31svh,220px)] w-full overflow-hidden rounded-2xl lg:order-last lg:h-[460px]">
            <Image
              src={repairWorkshop}
              alt="A technician repairing a laptop beside an open household appliance"
              fill
              preload
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="how-it-works-heading" className="bg-background py-16 text-foreground sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="mb-9 max-w-xl sm:mb-11">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
              Simple from start to finish
            </p>
            <h2 id="how-it-works-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
              How FixMate Works
            </h2>
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
    </main>
  );
}
