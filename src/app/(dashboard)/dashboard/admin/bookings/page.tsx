import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

type BookingStatus = "all" | "requested" | "accepted" | "in-progress" | "completed" | "rejected" | "cancelled";
type Booking = {
  _id: string;
  serviceTitle?: string;
  customerName?: string;
  customerEmail?: string;
  technicianName?: string;
  technicianEmail?: string;
  preferredDate?: string;
  status?: string;
  paymentStatus?: string;
  finalAmount?: number;
  basePrice?: number;
};

const filters: { value: BookingStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

async function getBookings(status: BookingStatus): Promise<Booking[] | null> {
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

    const url = new URL("/api/admin/bookings", apiBaseUrl);
    if (status !== "all") url.searchParams.set("status", status);
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${tokenData.accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return Array.isArray(data) ? data as Booking[] : null;
  } catch {
    return null;
  }
}

function person(name?: string, email?: string) {
  return name?.trim() || email?.trim() || "Unknown";
}

function dateLabel(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "—";
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
}

function amountLabel(booking: Booking) {
  const amount = booking.finalAmount ?? booking.basePrice;
  return typeof amount === "number" && Number.isFinite(amount)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
    : "—";
}

function badge(value: string | undefined) {
  const label = value?.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Unknown";
  const color = value === "paid" || value === "completed"
    ? "bg-accent text-accent-foreground"
    : value === "rejected" || value === "cancelled"
      ? "bg-destructive/10 text-destructive"
      : "bg-secondary text-secondary-foreground";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${color}`}>{label}</span>;
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (dashboardPathForRole(session.user.role) !== "/dashboard/admin") {
    redirect(dashboardPathForRole(session.user.role));
  }

  const requestedStatus = (await searchParams).status;
  const status: BookingStatus = filters.some((filter) => filter.value === requestedStatus)
    ? requestedStatus as BookingStatus
    : "all";
  const bookings = await getBookings(status);

  return (
    <main className="bg-background py-12 text-foreground sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="[&_h1]:text-[30px] [&_h1]:leading-tight lg:[&_h1]:text-[36px]">
          <SectionHeading label="ADMIN DASHBOARD" level="h1">All Bookings</SectionHeading>
          <p className="mt-5 text-base text-muted-foreground">View bookings across all customers and technicians.</p>
        </div>

        <nav aria-label="Booking status" className="mt-9 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              render={<Link href={filter.value === "all" ? "/dashboard/admin/bookings" : `/dashboard/admin/bookings?status=${filter.value}`} />}
              nativeButton={false}
              variant={status === filter.value ? "secondary" : "outline"}
              aria-current={status === filter.value ? "page" : undefined}
            >
              {filter.label}
            </Button>
          ))}
        </nav>

        {bookings === null ? (
          <div role="alert" className="mt-6 rounded-xl border border-border bg-card p-6 text-sm text-destructive">Could not load bookings. Please try again.</div>
        ) : bookings.length === 0 ? (
          <div className="mt-6 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">No {status === "all" ? "bookings" : `${status.replace(/-/g, " ")} bookings`} found.</div>
        ) : (
          <>
            <div className="mt-6 space-y-4 lg:hidden">
              {bookings.map((booking) => (
                <article key={booking._id} className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-5">
                  <h2 className="font-heading text-base font-semibold">{booking.serviceTitle || "Repair service"}</h2>
                  <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
                    <div><dt className="text-muted-foreground">Customer</dt><dd className="mt-1 font-medium">{person(booking.customerName, booking.customerEmail)}</dd></div>
                    <div><dt className="text-muted-foreground">Technician</dt><dd className="mt-1 font-medium">{person(booking.technicianName, booking.technicianEmail)}</dd></div>
                    <div><dt className="text-muted-foreground">Preferred date</dt><dd className="mt-1 font-medium">{dateLabel(booking.preferredDate)}</dd></div>
                    <div><dt className="text-muted-foreground">Amount</dt><dd className="mt-1 font-medium">{amountLabel(booking)}</dd></div>
                    <div><dt className="text-muted-foreground">Booking status</dt><dd className="mt-1">{badge(booking.status)}</dd></div>
                    <div><dt className="text-muted-foreground">Payment status</dt><dd className="mt-1">{badge(booking.paymentStatus)}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
            <div className="mt-6 hidden overflow-x-auto rounded-xl border border-border bg-card lg:block">
              <table className="w-full text-left text-sm text-card-foreground">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {(["Service", "Customer", "Technician", "Preferred date", "Booking status", "Payment status", "Amount"] as const).map((heading) => (
                      <th key={heading} scope="col" className="px-4 py-4">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="px-4 py-4 font-medium">{booking.serviceTitle || "Repair service"}</td>
                      <td className="px-4 py-4">{person(booking.customerName, booking.customerEmail)}</td>
                      <td className="px-4 py-4">{person(booking.technicianName, booking.technicianEmail)}</td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{dateLabel(booking.preferredDate)}</td>
                      <td className="px-4 py-4">{badge(booking.status)}</td>
                      <td className="px-4 py-4">{badge(booking.paymentStatus)}</td>
                      <td className="px-4 py-4 font-medium whitespace-nowrap">{amountLabel(booking)}</td>
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
