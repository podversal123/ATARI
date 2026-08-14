type FilterSelectProps = {
  label: string;
  options: string[];
};

/** Plain, unwired filter dropdown — becomes a real query param once the database step lands. */
export function FilterSelect({ label, options }: FilterSelectProps) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
      <select className="h-8 rounded-md border border-border bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
