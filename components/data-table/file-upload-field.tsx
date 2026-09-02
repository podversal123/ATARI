"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
      {isImage ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-60",
              value && "border-solid",
            )}
          >
            {uploading ? (
              <Loader2 className="size-6 animate-spin text-primary" />
            ) : value ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/files/view?url=${encodeURIComponent(value)}`}
                  alt={column.label}
                  className="size-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Replace
                </span>
              </>
            ) : (
              <ImageIcon className="size-6 text-muted-foreground/60" />
            )}
          </button>
          <div className="flex flex-col gap-1.5">
            {value ? (
              <>
                <a
                  href={`/api/files/view?url=${encodeURIComponent(value)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View full size
                </a>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  disabled={uploading}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3" />
                  Remove photo
                </button>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No photo uploaded</span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {value ? (
            <a
              href={`/api/files/view?url=${encodeURIComponent(value)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 flex-1 items-center gap-1.5 truncate rounded-lg border border-input px-2.5 text-sm text-primary hover:underline"
            >
              <FileText className="size-3.5 shrink-0" />
              View current file
            </a>
          ) : (
            <span className="flex h-8 flex-1 items-center px-2.5 text-sm text-muted-foreground">
              No file uploaded
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            {value ? "Replace" : "Upload"}
          </Button>
          {value && !uploading && (
            <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      )}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
