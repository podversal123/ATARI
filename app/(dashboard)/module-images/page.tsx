import { ImageIcon, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FORM_MANAGEMENT } from "@/lib/navigation";

/**
 * Per the client's own description: one representative image per top-level
 * Form Management module (About KVK, Achievements, ...), set by the admin
 * — distinct from Gallery, which browses real photos KVKs submit through
 * their forms. No reference screenshot exists for this exact page, but the
 * shape (one card per module, upload/replace its image) comes directly
 * from that description rather than being invented.
 */
export default function ModuleImagesPage() {
  return (
    <div>
      <PageHeader
        trail={[{ label: "Module Images" }]}
        title="Module Images"
        description="Set a representative image for each Form Management module."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FORM_MANAGEMENT.map((module) => (
          <div key={module.slug} className="rounded-lg border border-border bg-card p-4">
            <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-border bg-muted/40">
              <ImageIcon className="size-8 text-muted-foreground/40" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">{module.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">No image set</p>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              <Upload className="size-3.5" />
              Upload Image
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
