import { SectionHeading } from "@/components/ui/section-heading";

export type DashboardStatusRow = { key: string; label: string; count: number };

type DashboardStatusChartProps = {
  rows: DashboardStatusRow[];
  emptyTitle: string;
  emptyDescription: string;
};

export function DashboardStatusChart({ rows, emptyTitle, emptyDescription }: DashboardStatusChartProps) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const highestCount = Math.max(1, ...rows.map((row) => row.count));

  return (
    <section className="mt-10" aria-labelledby="booking-status-heading">
      <SectionHeading id="booking-status-heading" label="BOOKING ACTIVITY">Requests by status</SectionHeading>
      <div className="mt-5 rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-7">
        {total === 0 ? (
          <div className="py-6 text-center">
            <p className="font-heading text-lg font-semibold">{emptyTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {rows.map((row) => (
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
  );
}
