import { useId } from "react";
import { cn } from "@/lib/utils";
import { SimpleSelect } from "@/components/ui/simple-select";

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
  const id = useId();
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <label htmlFor={id} className="font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </label>
      <SimpleSelect
        id={id}
        value={value ?? options[0] ?? ""}
        onValueChange={onChange ?? (() => {})}
        options={options.map((option) => ({ value: option, label: option }))}
        className={cn("h-8 min-w-24", selectClassName)}
      />
    </div>
  );
}
