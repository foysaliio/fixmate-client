import { Clock3, MapPin, UserRound, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Service } from "@/components/services/service-card";
import { RequestRepair } from "@/components/services/request-repair";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAuthSession } from "@/lib/server-auth";

type ServiceImage = string | { url?: string };

function getImageUrl(image: ServiceImage | undefined) {
  return typeof image === "string" ? image : image?.url;
}

async function getService(id: string): Promise<Service> {
  if (!process.env.API_BASE_URL) {
    throw new Error("API_BASE_URL is not configured.");
  }

  const url = new URL(`/api/services/${encodeURIComponent(id)}`, process.env.API_BASE_URL);
  const response = await fetch(url, { cache: "no-store" });

  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load service details.");

  return (await response.json()) as Service;
}

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [service, session] = await Promise.all([getService(id), getAuthSession()]);
  const title = service.title || "Untitled service";
  const photo =
    service.imageUrl ||
    service.thumbnailUrl ||
    getImageUrl(service.image) ||
    getImageUrl(service.images?.[0]);
  const area = service.area || service.serviceArea || service.location || "Area not specified";
  const technician =
    service.technicianName ||
    service.technician?.name ||
    service.technician?.fullName ||
    "To be assigned";
  const price =
    typeof service.basePrice === "number" && Number.isFinite(service.basePrice)
      ? `৳${new Intl.NumberFormat("en-BD").format(service.basePrice)}`
      : "On request";

  return (
    <main className="bg-background py-16 text-foreground sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Link
          href="/services"
          className="mb-8 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Browse Services
        </Link>

        <div className="max-w-4xl">
          <SectionHeading label={service.category || "REPAIR SERVICE"} level="h1">
            {title}
          </SectionHeading>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)] lg:items-start lg:gap-10">
          <div className="space-y-8">
            <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary text-secondary-foreground">
              {photo ? (
                <Image
                  src={photo}
                  alt={`${title} repair service`}
                  width={1200}
                  height={750}
                  unoptimized
                  loading="eager"
                  className="size-full object-cover"
                />
              ) : (
                <Wrench aria-hidden="true" className="size-16 text-primary" strokeWidth={1.5} />
              )}
            </div>

            <section aria-labelledby="service-description-title">
              <h2 id="service-description-title" className="font-heading text-2xl font-semibold">
                About this service
              </h2>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground sm:text-lg">
                {service.description || "A description is not available yet."}
              </p>
            </section>
          </div>

          <aside className="rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6">
            <p className="text-sm text-muted-foreground">Starting at</p>
            <p className="mt-1 font-heading text-3xl font-semibold">{price}</p>

            <dl className="mt-6 divide-y divide-border border-t border-border">
              <div className="flex items-start gap-3 py-4">
                <Clock3 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="text-sm text-muted-foreground">Estimated time</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {service.estimatedDuration || service.duration || "Ask for an estimate"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3 py-4">
                <Wrench aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="text-sm text-muted-foreground">Service mode</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {service.serviceMode || "Mode not specified"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3 py-4">
                <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="text-sm text-muted-foreground">Area</dt>
                  <dd className="mt-1 text-sm font-medium">{area}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-4">
                <UserRound aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="text-sm text-muted-foreground">Technician</dt>
                  <dd className="mt-1 text-sm font-medium">{technician}</dd>
                </div>
              </div>
            </dl>

            <RequestRepair serviceId={id} user={session?.user ?? null} />
          </aside>
        </div>
      </div>
    </main>
  );
}
