"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import repairWorkshop from "../../../public/images/fixmate-repair-workshop.webp";
import { Button } from "@/components/ui/button";

const MotionLink = motion.create(Link);

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
    </main>
  );
}
