"use client";

import { ArrowUpRight, MapPin, UserRound, Wrench } from "lucide-react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCardBorderHighlight } from "@/components/ui/card-border-highlight";

type ServiceImage = string | { url?: string };

export type Service = {
  _id: string;
  title?: string;
  category?: string;
  serviceMode?: string;
  area?: string;
  serviceArea?: string;
  location?: string;
  basePrice?: number;
  technicianName?: string;
  technician?: { name?: string; fullName?: string };
  imageUrl?: string;
  thumbnailUrl?: string;
  image?: ServiceImage;
  images?: ServiceImage[];
  description?: string;
  estimatedDuration?: string;
  duration?: string;
};

function imageUrl(image: ServiceImage | undefined) {
  return typeof image === "string" ? image : image?.url;
}

export function ServiceCard({ service }: { service: Service }) {
  const reducedMotion = useReducedMotion();
  const { borderHighlight, ...pointerHandlers } = useCardBorderHighlight(reducedMotion);
  const title = service.title || "Untitled service";
  const photo = service.imageUrl || service.thumbnailUrl || imageUrl(service.image) || imageUrl(service.images?.[0]);
  const area = service.area || service.serviceArea || service.location || "Area not specified";
  const technician = service.technicianName || service.technician?.name || service.technician?.fullName || "To be assigned";
  const price = typeof service.basePrice === "number" && Number.isFinite(service.basePrice)
    ? `৳${new Intl.NumberFormat("en-BD").format(service.basePrice)}`
    : "On request";

  return (
    <li
      className="relative flex h-full min-w-0 flex-col rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-5"
      {...pointerHandlers}
    >
      {borderHighlight}
      <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-lg bg-secondary text-secondary-foreground">
        {photo ? (
          <Image
            src={photo}
            alt={`${title} repair service`}
            width={640}
            height={400}
            unoptimized
            className="size-full object-cover"
          />
        ) : (
          <Wrench aria-hidden="true" className="size-10 text-primary" strokeWidth={1.5} />
        )}
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {service.category || "Repair service"}
        </p>
        <h2 className="mt-2 font-heading text-xl font-semibold leading-tight">{title}</h2>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-start gap-2.5">
            <Wrench aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            <dt className="sr-only">Service mode</dt>
            <dd>{service.serviceMode || "Mode not specified"}</dd>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            <dt className="sr-only">Area</dt>
            <dd>{area}</dd>
          </div>
          <div className="flex items-start gap-2.5">
            <UserRound aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            <dt className="sr-only">Technician</dt>
            <dd>{technician}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-5 sm:mt-6">
          <div>
            <p className="text-xs text-muted-foreground">Starting at</p>
            <p className="font-heading text-lg font-semibold">{price}</p>
          </div>
          <Link
            href={`/services/${encodeURIComponent(service._id)}`}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            View Details <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </li>
  );
}
