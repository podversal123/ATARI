"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { MasterColumn } from "@/lib/navigation";

type FileUploadFieldProps = {
  column: MasterColumn;
  fieldId: string;
  value: string;
  onChange: (url: string) => void;
};

/**
 * Uploads immediately on file selection (not deferred to form submit) - the
 * field's stored value is the resulting Blob URL, same as if the user had
 * typed it into a plain text field, so the rest of the Add/Edit flow
 * (submitForm/submit in empty-data-table.tsx and add-leaf-page.tsx) doesn't
 * need to know files are involved at all.
 *
 * Styled as the same full-width dashed drop-zone "card" as the app's own
 * captioned multi-photo field (FormPhotosField - "Photographs" etc.)
 * instead of the old cramped inline thumbnail/row layout
 * (client report, 2026-09-03: Employee Details' Photo/Resume looked
 * noticeably smaller than every other field). Single-file, so there's no
 * thumbnail strip - the card itself flips into a "file attached" state with
 * Replace/Remove once a value is set.
 */
/**
 * Client direction, 2026-09-13: real content photos (currently just
 * `cfld-crop-image` - an actual photo of the crop) need a 2MB floor as well
 * as the usual 5MB ceiling, same bounds as the "Photographs" sections
 * (form-photos-field.tsx). Deliberately excludes `staff-photo`, a small
 * ID/passport-style image that a 2MB floor would reject outright. Mirrors
 * lib/blob.ts's own per-kind `minBytes` (kept as a small, explicit list here
 * rather than imported, since that file is server-only) - the fast,
 * no-round-trip half of the check; the server enforces the same floor
 * regardless of what this component does.
 */
const MIN_BYTES_BY_KIND: Partial<Record<NonNullable<MasterColumn["uploadKind"]>, number>> = {
  "cfld-crop-image": 2 * 1024 * 1024,
};
const MAX_BYTES = 5 * 1024 * 1024;

export function FileUploadField({ column, fieldId, value, onChange }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const minBytes = column.uploadKind ? MIN_BYTES_BY_KIND[column.uploadKind] : undefined;

  async function handleFile(file: File) {
    setError(null);
    if (minBytes && file.size < minBytes) {
      setError(`File too small - min ${minBytes / (1024 * 1024)}MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`File too large - max ${MAX_BYTES / (1024 * 1024)}MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", column.uploadKind ?? "");
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isImage = column.fileKind === "image";
  const accept = isImage ? "image/jpeg,image/png,image/webp" : ".pdf,.doc,.docx";
  const noun = column.label.toLowerCase();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId}>{column.label}</Label>
      <input
        ref={inputRef}
        id={fieldId}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {value && !uploading ? (
        <div className="flex w-full items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3.5">
          {isImage ? (
            <div className="size-12 shrink-0 overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/files/view?url=${encodeURIComponent(value)}`}
                alt={column.label}
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-background">
              <FileText className="size-5 text-primary" />
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <a
              href={`/api/files/view?url=${encodeURIComponent(value)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-medium text-primary hover:underline"
            >
              {isImage ? "View full size" : "View current file"}
            </a>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="size-3" />
              Remove
            </button>
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="shrink-0 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            Replace
          </button>
        </div>
      ) : (
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
          ) : isImage ? (
            <ImageIcon className="size-6 text-muted-foreground" />
          ) : (
            <Upload className="size-6 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-primary">
            {uploading ? "Uploading…" : `Click to upload ${noun}`}
          </span>
          <span className="text-xs text-muted-foreground">
            {isImage
              ? minBytes
                ? `JPG, PNG or WEBP. (${minBytes / (1024 * 1024)}MB to ${MAX_BYTES / (1024 * 1024)}MB)`
                : "JPG, PNG or WEBP. (Max 5 MB)"
              : "PDF or Word document. (Max 5 MB)"}
          </span>
        </button>
      )}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
