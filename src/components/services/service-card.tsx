"use client";

import { ArrowUpRight, MapPin, UserRound, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  cardSummary?: string;
  estimatedDuration?: string;
  duration?: string;
};

function imageUrl(image: ServiceImage | undefined) {
  return typeof image === "string" ? image : image?.url;
}

export function ServiceCard({ service }: { service: Service }) {
  const title = service.title || "Untitled service";
  const photo = service.imageUrl || service.thumbnailUrl || imageUrl(service.image) || imageUrl(service.images?.[0]);
  const area = service.area || service.serviceArea || service.location || "Area not specified";
  const technician = service.technicianName || service.technician?.name || service.technician?.fullName || "To be assigned";
  const price = typeof service.basePrice === "number" && Number.isFinite(service.basePrice)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(service.basePrice)
    : "On request";

  return (
    <li
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-colors hover:border-primary/50"
    >
      <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-secondary text-secondary-foreground">
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

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          <span className="truncate">{service.category || "Repair service"}</span>
          <span className="shrink-0 text-muted-foreground">{service.serviceMode || "Service"}</span>
        </div>
        <h2 className="mt-3 truncate font-heading text-lg font-semibold leading-tight" title={title}>{title}</h2>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
          {service.cardSummary || service.description || "Book a trusted technician for this repair."}
        </p>

        <dl className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
          <div className="flex min-w-0 items-center gap-2.5">
            <UserRound aria-hidden="true" className="size-4 shrink-0 text-primary" />
            <dt className="sr-only">Technician</dt>
            <dd className="truncate">{technician}</dd>
          </div>
          <div className="flex min-w-0 items-center gap-2.5">
            <MapPin aria-hidden="true" className="size-4 shrink-0 text-primary" />
            <dt className="sr-only">Area</dt>
            <dd className="truncate">{area}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-muted-foreground">Starting at</p>
            <p className="mt-0.5 font-heading text-xl font-semibold leading-none">{price}</p>
          </div>
          <Button
            render={<Link href={`/services/${encodeURIComponent(service._id)}`} />}
            nativeButton={false}
            variant="outline"
            className="gap-1.5 px-4"
          >
            Details <ArrowUpRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}
