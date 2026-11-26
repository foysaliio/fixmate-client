import { Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BookingStatus } from "@/components/dashboard/booking-status";
import { PayNowButton } from "@/components/dashboard/pay-now-button";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

type Booking = {
  _id: string;
  serviceTitle?: string;
  serviceImage?: string | { url?: string };
  technicianName?: string;
  preferredDate?: string;
  basePrice?: number;
  finalAmount?: number;
  status?: string;
  paymentStatus?: string;
};

async function getMyBookings(): Promise<Booking[] | null> {
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

    const response = await fetch(new URL("/api/bookings/my", apiBaseUrl), {
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

function money(amount: number | undefined) {
  return typeof amount === "number" && Number.isFinite(amount)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
    : "—";
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

function StatusBadge({ value }: { value?: string }) {
  return (
    <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
      {statusLabel(value)}
    </span>
  );
}

function PaymentStatus({ booking }: { booking: Booking }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge value={booking.paymentStatus} />
      {booking.status === "completed" && booking.paymentStatus === "unpaid" && (
        <PayNowButton bookingId={booking._id} />
      )}
    </div>
  );
}

function ServiceIdentity({ booking }: { booking: Booking }) {
  const imageUrl = typeof booking.serviceImage === "string"
    ? booking.serviceImage
    : booking.serviceImage?.url;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary text-primary">
        {imageUrl ? (
          <Image src={imageUrl} alt="" width={56} height={56} unoptimized className="size-full object-cover" />
        ) : (
          <Wrench aria-hidden="true" className="size-6" />
        )}
      </span>
      <span className="min-w-0 font-medium text-foreground">{booking.serviceTitle || "Repair service"}</span>
    </div>
  );
}

export default async function MyBookingsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.user.role !== "customer") redirect(dashboardPathForRole(session.user.role));

  const bookings = await getMyBookings();
  return (
    <main className="bg-background py-12 text-foreground sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading label="CUSTOMER DASHBOARD" level="h1">My Bookings</SectionHeading>
        <p className="mt-5 text-muted-foreground">Follow your repair requests and their payment status.</p>

        {bookings === null ? (
          <p role="alert" className="mt-8 rounded-xl border border-border bg-card p-6 text-card-foreground">
            Could not load your bookings. Please try again later.
          </p>
        ) : bookings.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-card-foreground">
            <p className="font-heading text-xl font-semibold">No bookings yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Find a repair service to get started.</p>
            <Button render={<Link href="/services" />} nativeButton={false} className="mt-6">
              Browse Services
            </Button>
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-4 lg:hidden">
              {bookings.map((booking) => (
                <li key={booking._id} className="rounded-xl border border-border bg-card p-5 text-card-foreground">
                  <ServiceIdentity booking={booking} />
                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-5 text-sm">
                    <div className="col-span-2"><dt className="text-muted-foreground">Technician</dt><dd className="mt-1 font-medium">{booking.technicianName || "To be assigned"}</dd></div>
                    <div><dt className="text-muted-foreground">Preferred date</dt><dd className="mt-1 font-medium">{dateLabel(booking.preferredDate)}</dd></div>
                    <div><dt className="text-muted-foreground">Starting price</dt><dd className="mt-1 font-medium">{money(booking.basePrice)}</dd></div>
                    <div><dt className="text-muted-foreground">Final amount</dt><dd className="mt-1 font-medium">{money(booking.finalAmount)}</dd></div>
                    <div><dt className="text-muted-foreground">Booking status</dt><dd className="mt-1"><BookingStatus id={booking._id} status={booking.status} serviceTitle={booking.serviceTitle} /></dd></div>
                    <div><dt className="text-muted-foreground">Payment status</dt><dd className="mt-1"><PaymentStatus booking={booking} /></dd></div>
                  </dl>
                </li>
              ))}
            </ul>

            <div className="mt-8 hidden overflow-x-auto rounded-xl border border-border bg-card text-card-foreground lg:block">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-medium">Service</th>
                    <th scope="col" className="px-4 py-4 font-medium">Technician</th>
                    <th scope="col" className="px-4 py-4 font-medium">Preferred date</th>
                    <th scope="col" className="px-4 py-4 font-medium">Starting price</th>
                    <th scope="col" className="px-4 py-4 font-medium">Final amount</th>
                    <th scope="col" className="px-4 py-4 font-medium">Booking status</th>
                    <th scope="col" className="px-5 py-4 font-medium">Payment status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="px-5 py-4"><ServiceIdentity booking={booking} /></td>
                      <td className="px-4 py-4">{booking.technicianName || "To be assigned"}</td>
                      <td className="whitespace-nowrap px-4 py-4">{dateLabel(booking.preferredDate)}</td>
                      <td className="whitespace-nowrap px-4 py-4">{money(booking.basePrice)}</td>
                      <td className="whitespace-nowrap px-4 py-4">{money(booking.finalAmount)}</td>
                      <td className="px-4 py-4"><BookingStatus id={booking._id} status={booking.status} serviceTitle={booking.serviceTitle} /></td>
                      <td className="px-5 py-4"><PaymentStatus booking={booking} /></td>
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
