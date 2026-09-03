"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type FormPhoto = { url: string; caption: string };

type FormPhotosFieldProps = {
  label?: string;
  value: FormPhoto[];
  onChange: (photos: FormPhoto[]) => void;
};

/**
 * Real "Upload Photograph(s) + Caption" section every form gets at the end
 * (client PDF, "Module Image workflow", 2026-09-02) - each photo carries its
 * own caption, unlike MultiImageUploadField's bare URL list. Feeds Module
 * Images automatically on save (leaf-record-registry.ts's syncModuleImages)
 * rather than the old standalone Add Images page - there is no separate
 * upload flow for this data anymore.
 */
export function FormPhotosField({ label = "Photographs", value, onChange }: FormPhotosFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    setUploading(true);
    const uploaded: FormPhoto[] = [];
    const failures: string[] = [];
    try {
      for (const file of Array.from(files)) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("kind", "module-image");
          const response = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await response.json();
          if (!response.ok) {
            failures.push(`${file.name}: ${data.error ?? "Upload failed."}`);
            continue;
          }
          uploaded.push({ url: data.url, caption: "" });
        } catch {
          failures.push(`${file.name}: Could not reach the server.`);
        }
      }
      if (uploaded.length > 0) onChange([...value, ...uploaded]);
      if (failures.length > 0) setError(failures.join(" "));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function setCaption(index: number, caption: string) {
    onChange(value.map((p, i) => (i === index ? { ...p, caption } : p)));
  }

  return (
    <div className="space-y-2">
      {/* Same "text-lg font-semibold text-primary" section-heading style as every other card sub-section (Farmers Details, Details of technologies selected..., ...) - was a plain field-size Label before (client report, 2026-09-03: card sub-headings missing/too small in several places), which read as just another input instead of a section break. */}
      <p className="text-lg font-semibold text-primary">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          if (files && files.length > 0) handleFiles(files);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-5 text-center transition-colors hover:border-primary/50 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-primary" />
        ) : (
          <ImagePlus className="size-6 text-muted-foreground" />
        )}
        <span className="text-sm font-medium text-primary">
          {uploading ? "Uploading…" : "Click to upload photos"}
        </span>
        <span className="text-xs text-muted-foreground">
          Only images allowed. Hold Ctrl/Cmd in the file picker to select multiple. (Max 5 MB per file)
        </span>
      </button>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      {value.length > 0 && (
        <div className="space-y-2 pt-1">
          {value.map((photo, index) => (
            <div key={photo.url} className="flex items-center gap-3 rounded-lg border border-border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/files/view?url=${encodeURIComponent(photo.url)}`}
                alt=""
                className="size-16 shrink-0 rounded-md object-cover"
              />
              <Input
                value={photo.caption}
                onChange={(e) => setCaption(index, e.target.value)}
                placeholder="Caption for this photograph"
                className="h-9"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                title="Remove"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
