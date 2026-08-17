type MetricCardProps = {
  label: string;
  value: string | number;
};

/** Icon-less stat card used on the OFT/FLD detailed-analytics pages (denser than the Dashboard's StatCard). */
export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
