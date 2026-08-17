import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  backHref?: string;
  trail: Crumb[];
  /** Omit for leaf/table pages — those render their own title inside EmptyDataTable's card, next to the export buttons (confirmed from the reference recording). */
  title?: string;
  description?: string;
};

/** Breadcrumb + back link + title block reused at the top of every dashboard page. */
export function PageHeader({ backHref, trail, title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", title && "mb-3")}>
        {backHref && (
          <Link href={backHref} className="flex items-center gap-1 hover:text-foreground">
            <ChevronLeft className="size-4" />
            Back
          </Link>
        )}
        {trail.map((crumb, index) => (
          <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
            <span className="text-border">›</span>
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-primary">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>
      {title && <h1 className="text-2xl font-semibold text-foreground">{title}</h1>}
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
