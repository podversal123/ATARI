import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
};

/** Icon-less stat card used on the OFT/FLD detailed-analytics pages (denser than the Dashboard's StatCard). */
export function MetricCard({ label, value }: MetricCardProps) {
  /** A bare "-" placeholder (Locations/Quantity, where no matching field exists to show a real number) sits at half a digit's visual height at the same font-size, reading as noticeably smaller than every other card even though the class is identical - bumped up to match the other cards' visual weight (client report, 2026-08-30). */
  const isPlaceholder = value === "-";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p
        className={cn(
          "mt-1 font-semibold tabular-nums text-foreground",
          isPlaceholder ? "text-4xl" : "text-2xl",
        )}
      >
        {value}
      </p>
    </div>
  );
}
