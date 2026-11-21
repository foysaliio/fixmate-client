import { Search } from "lucide-react";
import Link from "next/link";
import { ServiceCard, type Service } from "@/components/services/service-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const categories = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];
const serviceModes = ["Home Visit", "Workshop"];

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

async function getServices(filters: {
  search: string;
  category: string;
  serviceMode: string;
  sort: string;
}): Promise<Service[] | null> {
  if (!process.env.API_BASE_URL) return null;

  try {
    const url = new URL("/api/services", process.env.API_BASE_URL);
    if (filters.search) url.searchParams.set("search", filters.search);
    if (filters.category) url.searchParams.set("category", filters.category);
    if (filters.serviceMode) url.searchParams.set("serviceMode", filters.serviceMode);
    url.searchParams.set("sort", filters.sort);

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;

    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Service[]) : null;
  } catch {
    return null;
  }
}

export default async function ServicesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = singleValue(params.search);
  const category = singleValue(params.category);
  const serviceMode = singleValue(params.serviceMode);
  const requestedSort = singleValue(params.sort);
  const sort = ["newest", "price-asc", "price-desc"].includes(requestedSort)
    ? requestedSort
    : "newest";
  const services = await getServices({ search, category, serviceMode, sort });
  const hasFilters = Boolean(search || category || serviceMode || requestedSort);

  return (
    <main className="bg-background py-16 text-foreground sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <SectionHeading label="DEVICE & APPLIANCE REPAIR" level="h1">
            Browse Services
          </SectionHeading>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Find a repair service that fits your device, location, and schedule.
          </p>
        </div>

        <form action="/services" method="get" className="mt-10 rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <label className="flex min-w-0 flex-col gap-2 text-sm font-medium" htmlFor="service-search">
              Search
              <input
                id="service-search"
                name="search"
                type="search"
                defaultValue={search}
                placeholder="Service or category"
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-2 text-sm font-medium" htmlFor="service-category">
              Category
              <select
                id="service-category"
                name="category"
                defaultValue={category}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All categories</option>
                {category && !categories.includes(category) && <option value={category}>{category}</option>}
                {categories.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-2 text-sm font-medium" htmlFor="service-mode">
              Service Mode
              <select
                id="service-mode"
                name="serviceMode"
                defaultValue={serviceMode}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All modes</option>
                {serviceMode && !serviceModes.includes(serviceMode) && <option value={serviceMode}>{serviceMode}</option>}
                {serviceModes.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-2 text-sm font-medium" htmlFor="service-sort">
              Sort
              <select
                id="service-sort"
                name="sort"
                defaultValue={sort}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button type="submit" className="h-11 gap-2 px-5">
              <Search aria-hidden="true" className="size-4" /> Show Services
            </Button>
            {hasFilters && <Link href="/services" className="text-sm font-medium text-primary underline-offset-4 hover:underline">Clear filters</Link>}
          </div>
        </form>

        <section aria-label="Service results" className="mt-12">
          {services === null ? (
            <div role="alert" className="rounded-xl border border-border bg-card p-8 text-card-foreground">
              <h2 className="text-xl font-semibold">Unable to load services</h2>
              <p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p>
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-card-foreground">
              <h2 className="text-xl font-semibold">No services found</h2>
              <p className="mt-2 text-sm text-muted-foreground">Try another search or change your filters.</p>
            </div>
          ) : (
            <>
              <p className="mb-5 text-sm text-muted-foreground">
                {services.length} {services.length === 1 ? "service" : "services"} found
              </p>
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {services.map((service) => <ServiceCard key={service._id} service={service} />)}
              </ul>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
