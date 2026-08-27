import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  /** Where clicking this card should take the user - e.g. the KVK Master list for the "KVK" card, or the matching analytics detail page for OFT/FLD/Training/Extension. Cards without a real destination stay plain (non-clickable). */
  href?: string;
};

export function StatCard({ icon: Icon, label, value, href }: StatCardProps) {
  const content = (
    <>
      <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-accent">
        <Icon className="size-4.5 text-accent-foreground" />
      </div>
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
      >
        {content}
      </Link>
    );
  }

  return <div className="rounded-lg border border-border bg-card p-4">{content}</div>;
}
