"use client";

import {
  AirVent,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Laptop,
  PlugZap,
  Refrigerator,
  Search,
  Send,
  Smartphone,
  Tv,
  WashingMachine,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import repairWorkshop from "../../../public/images/fixmate-repair-workshop.webp";
import { Button } from "@/components/ui/button";
import { useCardBorderHighlight } from "@/components/ui/card-border-highlight";
import { SectionHeading } from "@/components/ui/section-heading";

const MotionLink = motion.create(Link);

const repairCategories = [
  { name: "Smartphone", icon: Smartphone },
  { name: "Laptop & PC", icon: Laptop },
  { name: "AC", icon: AirVent },
  { name: "Refrigerator", icon: Refrigerator },
  { name: "TV", icon: Tv },
  { name: "Washing Machine", icon: WashingMachine },
  { name: "Electrical", icon: PlugZap },
];

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

function CategoryCard({
  name,
  Icon,
  reducedMotion,
}: {
  name: string;
  Icon: LucideIcon;
  reducedMotion: boolean | null;
}) {
  const { borderHighlight, ...pointerHandlers } = useCardBorderHighlight(reducedMotion);

  return (
    <li className="min-w-0">
      <Link
        href={`/services?category=${encodeURIComponent(name)}`}
        className="relative flex h-full min-h-40 flex-col justify-between rounded-xl border border-border bg-card p-4 text-card-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-h-44 sm:p-5"
        {...pointerHandlers}
      >
        {borderHighlight}
        <span className="flex items-start justify-between gap-2">
          <Icon aria-hidden="true" className="size-8 text-primary sm:size-9" strokeWidth={1.6} />
          <ArrowUpRight
            aria-hidden="true"
            className="size-5 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
          />
        </span>
        <span className="font-heading text-base font-semibold leading-tight sm:text-lg">
          {name}
        </span>
      </Link>
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
            <SectionHeading label="For devices & appliances" level="h1">
              Get it fixed.
              <br />
              <span className="text-primary">Stay in the loop.</span>
            </SectionHeading>
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

      <section
        aria-labelledby="popular-repair-categories-heading"
        className="bg-background py-16 text-foreground sm:py-20 lg:py-24"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="mb-9 sm:mb-11">
            <SectionHeading
              id="popular-repair-categories-heading"
              label="CHOOSE WHAT NEEDS FIXING"
            >
              Popular Repair Categories
            </SectionHeading>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {repairCategories.map(({ name, icon: Icon }) => (
              <CategoryCard key={name} name={name} Icon={Icon} reducedMotion={reducedMotion} />
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="how-it-works-heading" className="bg-background py-16 text-foreground sm:py-20 lg:py-24">
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
    </main>
  );
}
