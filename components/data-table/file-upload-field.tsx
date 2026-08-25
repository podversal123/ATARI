"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

  const accept = column.fileKind === "image" ? "image/jpeg,image/png,image/webp" : ".pdf,.doc,.docx";
  const Icon = column.fileKind === "image" ? ImageIcon : FileText;

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
      <div className="flex items-center gap-2">
        {value ? (
          <a
            href={`/api/files/view?url=${encodeURIComponent(value)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 flex-1 items-center gap-1.5 truncate rounded-lg border border-input px-2.5 text-sm text-primary hover:underline"
          >
            <Icon className="size-3.5 shrink-0" />
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
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
