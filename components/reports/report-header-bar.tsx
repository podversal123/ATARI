import { FileBarChart } from "lucide-react";

/** The dark-green "KVK REPORTS" / "SUPER ADMIN REPORTS" banner shared by both report screens. */
export function ReportHeaderBar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-primary px-5 py-4">
      <h1 className="text-base font-bold tracking-wide text-primary-foreground">{title}</h1>
      <FileBarChart className="size-5 text-primary-foreground/80" />
    </div>
  );
}
