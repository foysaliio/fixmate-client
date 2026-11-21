import { HomeContent } from "@/components/home/home-content";
import type { Service } from "@/components/services/service-card";

async function getFeaturedServices(): Promise<Service[] | null> {
  if (!process.env.API_BASE_URL) return null;

  try {
    const url = new URL("/api/services", process.env.API_BASE_URL);
    url.searchParams.set("limit", "6");

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;

    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Service[]) : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const featuredServices = await getFeaturedServices();
  return <HomeContent featuredServices={featuredServices} />;
}
