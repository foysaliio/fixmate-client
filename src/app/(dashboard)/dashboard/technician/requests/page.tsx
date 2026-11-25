import { Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

type RequestStatus = "all" | "requested" | "accepted" | "in-progress" | "completed";
type Booking = {
  _id: string;
  customerName?: string;
  phone?: string;
  address?: string;
  preferredDate?: string;
  problemDescription?: string;
  serviceTitle?: string;
  serviceImage?: string | { url?: string };
  status?: string;
};

const filters: { value: RequestStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

async function getRequests(status: RequestStatus): Promise<Booking[] | null> {
  const apiBaseUrl = process.env.API_BASE_URL;
  const cookie = (await headers()).get("cookie");
  if (!apiBaseUrl || !cookie) return null;

  try {
    const tokenResponse = await fetch(new URL("/api/access-token", apiBaseUrl), {
      method: "POST",
      headers: { cookie },
      cache: "no-store",
    });
    if (!tokenResponse.ok) return null;
    const tokenData: { accessToken?: string } = await tokenResponse.json();
    if (!tokenData.accessToken) return null;

    const url = new URL("/api/bookings/technician", apiBaseUrl);
    url.searchParams.set("status", status);
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${tokenData.accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Booking[]) : null;
  } catch {
    return null;
  }
}

function dateLabel(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "—";
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
}

function statusLabel(value: string | undefined) {
  if (!value) return "Unknown";
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusBadge({ status }: { status?: string }) {
  return (
    <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
      {statusLabel(status)}
    </span>
  );
}

function ServiceIdentity({ booking }: { booking: Booking }) {
  const imageUrl = typeof booking.serviceImage === "string"
    ? booking.serviceImage
    : booking.serviceImage?.url;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary text-primary">
        {imageUrl ? (
          <Image src={imageUrl} alt="" width={48} height={48} unoptimized className="size-full object-cover" />
        ) : (
          <Wrench aria-hidden="true" className="size-5" />
        )}
      </span>
      <span className="font-medium text-foreground">{booking.serviceTitle || "Repair service"}</span>
    </div>
  );
}

export default async function TechnicianRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.user.role !== "technician") redirect(dashboardPathForRole(session.user.role));

  const requestedStatus = (await searchParams).status;
  const status: RequestStatus = filters.some((filter) => filter.value === requestedStatus)
    ? requestedStatus as RequestStatus
    : "all";
  const bookings = await getRequests(status);

  return (
    <main className="bg-background py-12 text-foreground sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading label="TECHNICIAN DASHBOARD" level="h1">Manage Requests</SectionHeading>
        <p className="mt-5 text-muted-foreground">Review the repair requests for your services.</p>

        <nav aria-label="Filter requests" className="mt-8 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.value}
              href={filter.value === "all" ? "/dashboard/technician/requests" : `/dashboard/technician/requests?status=${filter.value}`}
              aria-current={status === filter.value ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${status === filter.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {filter.label}
            </Link>
          ))}
        </nav>

        {bookings === null ? (
          <p role="alert" className="mt-8 rounded-xl border border-border bg-card p-6 text-card-foreground">
            Could not load requests. Please try again later.
          </p>
        ) : bookings.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-card-foreground">
            <p className="font-heading text-xl font-semibold">No requests found</p>
            <p className="mt-2 text-sm text-muted-foreground">Requests matching this filter will appear here.</p>
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-4 lg:hidden">
              {bookings.map((booking) => (
                <li key={booking._id} className="rounded-xl border border-border bg-card p-5 text-card-foreground">
                  <ServiceIdentity booking={booking} />
                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-5 text-sm">
                    <div><dt className="text-muted-foreground">Customer</dt><dd className="mt-1 font-medium">{booking.customerName || "—"}</dd></div>
                    <div><dt className="text-muted-foreground">Phone</dt><dd className="mt-1 font-medium">{booking.phone || "—"}</dd></div>
                    <div className="col-span-2"><dt className="text-muted-foreground">Address</dt><dd className="mt-1 break-words">{booking.address || "—"}</dd></div>
                    <div><dt className="text-muted-foreground">Preferred date</dt><dd className="mt-1 font-medium">{dateLabel(booking.preferredDate)}</dd></div>
                    <div><dt className="text-muted-foreground">Status</dt><dd className="mt-1"><StatusBadge status={booking.status} /></dd></div>
                    <div className="col-span-2"><dt className="text-muted-foreground">Problem description</dt><dd className="mt-1 whitespace-pre-wrap break-words">{booking.problemDescription || "—"}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>

            <div className="mt-8 hidden overflow-x-auto rounded-xl border border-border bg-card text-card-foreground lg:block">
              <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-medium">Service</th>
                    <th scope="col" className="px-4 py-4 font-medium">Customer</th>
                    <th scope="col" className="px-4 py-4 font-medium">Phone</th>
                    <th scope="col" className="px-4 py-4 font-medium">Address</th>
                    <th scope="col" className="px-4 py-4 font-medium">Preferred date</th>
                    <th scope="col" className="px-4 py-4 font-medium">Problem description</th>
                    <th scope="col" className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="align-top">
                      <td className="px-5 py-4"><ServiceIdentity booking={booking} /></td>
                      <td className="px-4 py-4">{booking.customerName || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-4">{booking.phone || "—"}</td>
                      <td className="max-w-48 break-words px-4 py-4">{booking.address || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-4">{dateLabel(booking.preferredDate)}</td>
                      <td className="max-w-64 whitespace-pre-wrap break-words px-4 py-4">{booking.problemDescription || "—"}</td>
                      <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
