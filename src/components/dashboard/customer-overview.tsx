import Link from "next/link";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { customerBookingStats } from "@/lib/customer-booking-stats";
import type { CustomerBooking } from "@/lib/customer-bookings";

export function CustomerOverview({ bookings }: { bookings: CustomerBooking[] | null }) {
  const stats = bookings === null ? null : customerBookingStats(bookings);
  const highestCount = stats ? Math.max(1, ...stats.byStatus.map((row) => row.count)) : 1;

  return (
    <main className="bg-background py-12 text-foreground sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl [&_h1]:text-[30px] [&_h1]:leading-tight lg:[&_h1]:text-[36px]">
          <SectionHeading label="CUSTOMER DASHBOARD" level="h1">Your repair dashboard</SectionHeading>
          <p className="mt-5 text-base text-muted-foreground">Track your repair requests and see how your jobs are progressing.</p>
        </div>

        {stats === null ? (
          <div role="alert" className="mt-8 rounded-xl border border-border bg-card p-6 text-sm text-destructive">
            Could not load your bookings. Please try again.
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <DashboardStatCard label="Total Requests" value={stats.total} description="All booking requests" />
              <DashboardStatCard label="Active Jobs" value={stats.active} description="Requested, accepted or in progress" />
              <DashboardStatCard label="Completed Jobs" value={stats.completed} description="Repairs marked completed" />
            </div>

            <section className="mt-10" aria-labelledby="booking-status-heading">
              <SectionHeading id="booking-status-heading" label="BOOKING ACTIVITY">Requests by status</SectionHeading>
              <div className="mt-5 rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-7">
                {stats.total === 0 ? (
                  <div className="py-6 text-center">
                    <p className="font-heading text-lg font-semibold">No bookings yet</p>
                    <p className="mt-2 text-sm text-muted-foreground">Your booking status chart will appear here once you request a service.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {stats.byStatus.map((row) => (
                      <li key={row.key} className="grid grid-cols-[6.5rem_minmax(0,1fr)_2rem] items-center gap-3 text-sm sm:grid-cols-[8rem_minmax(0,1fr)_2.5rem] sm:gap-5">
                        <span className="font-medium">{row.label}</span>
                        <span className="h-3 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                          <span className="block h-full rounded-full bg-primary" style={{ width: `${row.count / highestCount * 100}%` }} />
                        </span>
                        <span className="text-right font-semibold tabular-nums">{row.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <Button render={<Link href="/dashboard/customer/bookings" />} nativeButton={false} className="mt-8">
              My Bookings
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
