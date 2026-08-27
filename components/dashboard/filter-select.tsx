import { cn } from "@/lib/utils";

type FilterSelectProps = {
  label: string;
  options: string[];
  /** Widens the select for fields whose real option list runs longer (e.g. KVK names), matching the reference's differing dropdown widths. */
  selectClassName?: string;
  /** Lets the whole label+select block grow to fill leftover row space (e.g. `flex-1`), instead of staying content-sized. */
  className?: string;
  /** Real, controlled query-param value - the Dashboard's Year/KVK filters actually refetch on change now instead of always showing "All". */
  value?: string;
  onChange?: (value: string) => void;
};

export function FilterSelect({
  label,
  options,
  selectClassName,
  className,
  value,
  onChange,
}: FilterSelectProps) {
  return (
    <label className={cn("flex items-center gap-2 text-xs", className)}>
      <span className="font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <select
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={cn(
          "h-8 min-w-24 rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring",
          selectClassName,
        )}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
