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
 * multi-image upload fields (MultiImageUploadField - "Farmers' Training
 * Photographs" etc.) instead of the old cramped inline thumbnail/row layout
 * (client report, 2026-09-03: Employee Details' Photo/Resume looked
 * noticeably smaller than every other field). Single-file, so there's no
 * thumbnail strip - the card itself flips into a "file attached" state with
 * Replace/Remove once a value is set.
 */
export function FileUploadField({ column, fieldId, value, onChange }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
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
              ? "JPG, PNG or WEBP. (Max 5 MB)"
              : "PDF or Word document. (Max 5 MB)"}
          </span>
        </button>
      )}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
