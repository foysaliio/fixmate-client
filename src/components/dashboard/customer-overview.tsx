import Link from "next/link";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { DashboardStatusChart } from "@/components/dashboard/dashboard-status-chart";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { customerBookingStats } from "@/lib/customer-booking-stats";
import type { CustomerBooking } from "@/lib/customer-bookings";

export function CustomerOverview({ bookings }: { bookings: CustomerBooking[] | null }) {
  const stats = bookings === null ? null : customerBookingStats(bookings);

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

            <DashboardStatusChart
              rows={stats.byStatus}
              emptyTitle="No bookings yet"
              emptyDescription="Your booking status chart will appear here once you request a service."
            />

            <Button render={<Link href="/dashboard/customer/bookings" />} nativeButton={false} className="mt-8">
              My Bookings
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
