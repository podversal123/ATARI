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

/** Client direction, 2026-09-13: at most 2 photos in this section, each between 2MB and 5MB - matches lib/blob.ts's own "module-image" rule (server-side enforces the same size bounds; this is just the fast, no-round-trip check plus the count cap the server can't know about on its own, since it validates one file at a time). */
const MAX_PHOTOS = 2;
const MIN_BYTES = 2 * 1024 * 1024;
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Real "Upload Photograph(s) + Caption" section every form's photo upload
 * uses (client PDF, "Module Image workflow", 2026-09-02) - each photo carries
 * its own caption. Feeds Module Images automatically on save
 * (leaf-record-registry.ts's syncModuleImages) rather than the old standalone
 * Add Images page - there is no separate upload flow for this data anymore.
 */
export function FormPhotosField({ label = "Photographs", value, onChange }: FormPhotosFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const atLimit = value.length >= MAX_PHOTOS;

  async function handleFiles(files: FileList) {
    setError(null);
    const slotsLeft = MAX_PHOTOS - value.length;
    const picked = Array.from(files);
    const overflow = picked.length > slotsLeft;
    const toUpload = picked.slice(0, Math.max(slotsLeft, 0));

    const failures: string[] = [];
    const accepted: File[] = [];
    for (const file of toUpload) {
      if (file.size < MIN_BYTES) {
        failures.push(`${file.name}: too small - min 2MB.`);
      } else if (file.size > MAX_BYTES) {
        failures.push(`${file.name}: too large - max 5MB.`);
      } else {
        accepted.push(file);
      }
    }

    if (accepted.length === 0) {
      if (overflow) failures.push(`Only ${MAX_PHOTOS} photos allowed per section.`);
      if (failures.length > 0) setError(failures.join(" "));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    const uploaded: FormPhoto[] = [];
    try {
      for (const file of accepted) {
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
      if (overflow) failures.push(`Only ${MAX_PHOTOS} photos allowed per section - the rest were skipped.`);
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
      {/* Hidden once 2 photos are already attached (client direction, 2026-09-13) rather than left clickable-but-rejecting - the caption below already explains the cap for anyone who removes a photo and needs to upload again. */}
      {!atLimit && (
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
            Only images allowed, {MIN_BYTES / (1024 * 1024)}MB to {MAX_BYTES / (1024 * 1024)}MB each, up to {MAX_PHOTOS} photos.
          </span>
        </button>
      )}
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
