import Link from "next/link";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { DashboardStatusChart } from "@/components/dashboard/dashboard-status-chart";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { technicianOverviewStats } from "@/lib/technician-overview-stats";
import type { TechnicianRequest } from "@/lib/technician-requests";
import type { TechnicianService } from "./my-services-list";

export function TechnicianOverview({
  services,
  requests,
}: {
  services: TechnicianService[] | null;
  requests: TechnicianRequest[] | null;
}) {
  const stats = services === null || requests === null ? null : technicianOverviewStats(services, requests);

  return (
    <main className="bg-background py-12 text-foreground sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl [&_h1]:text-[30px] [&_h1]:leading-tight lg:[&_h1]:text-[36px]">
          <SectionHeading label="TECHNICIAN DASHBOARD" level="h1">Your technician dashboard</SectionHeading>
          <p className="mt-5 text-base text-muted-foreground">See your services and follow incoming repair requests.</p>
        </div>

        {stats === null ? (
          <div role="alert" className="mt-8 rounded-xl border border-border bg-card p-6 text-sm text-destructive">
            Could not load your services or requests. Please try again.
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <DashboardStatCard label="Total Services" value={stats.totalServices} description="All services you created" />
              <DashboardStatCard label="Approved Services" value={stats.approvedServices} description="Services approved by an admin" />
              <DashboardStatCard label="Pending Requests" value={stats.pendingRequests} description="New requests awaiting your review" />
            </div>

            <DashboardStatusChart
              rows={stats.byStatus}
              emptyTitle="No requests in these statuses yet"
              emptyDescription="Your request status chart will appear here once customers book your services."
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <Button render={<Link href="/dashboard/technician/my-services" />} nativeButton={false}>My Services</Button>
              <Button render={<Link href="/dashboard/technician/requests" />} nativeButton={false} variant="outline">Manage Requests</Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
