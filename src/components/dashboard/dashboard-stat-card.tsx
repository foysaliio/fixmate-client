type DashboardStatCardProps = {
  label: string;
  value: number;
  description: string;
};

export function DashboardStatCard({ label, value, description }: DashboardStatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 font-heading text-4xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
