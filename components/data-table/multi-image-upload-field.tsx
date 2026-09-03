"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UploadKind } from "@/lib/blob";

type MultiImageUploadFieldProps = {
  /** Optional - omit when an external heading already introduces this field (e.g. OftResultFields' own "Photographs" section title, styled bigger than a plain field label); CFLD's two side-by-side cards ("Farmers' Training Photographs", "Quality Action Photographs") still pass their own, since there each card needs its own name. */
  label?: string;
  uploadKind: UploadKind;
  value: string[];
  onChange: (urls: string[]) => void;
};

/**
 * Real multi-file image upload - the reference's own "Farmers' Training
 * Photographs" / "Quality Action Photographs" fields (atari-client.vercel.app,
 * confirmed 2026-09-01), each captioned "Only images allowed. Hold Ctrl/Cmd
 * in the file picker to select multiple. (Max 5 MB per file)". Every file is
 * uploaded to the private Blob store immediately on selection (same
 * upload-on-select pattern as the single-file FileUploadField), one request
 * per file so one bad file doesn't block the rest. Styled as a dashed
 * drop-zone (client request, 2026-09-01: "thoda UI enhance kar do") rather
 * than a bare native file input, matching the app's own upload-zone look
 * used elsewhere - same upload/remove behavior underneath, cosmetic only.
 */
export function MultiImageUploadField({ label, uploadKind, value, onChange }: MultiImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    setUploading(true);
    const uploaded: string[] = [];
    const failures: string[] = [];
    try {
      for (const file of Array.from(files)) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("kind", uploadKind);
          const response = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await response.json();
          if (!response.ok) {
            failures.push(`${file.name}: ${data.error ?? "Upload failed."}`);
            continue;
          }
          uploaded.push(data.url);
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

  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((url, index) => (
            <div key={url} className="group relative size-20 overflow-hidden rounded-lg border border-border shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/files/view?url=${encodeURIComponent(url)}`}
                alt=""
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
