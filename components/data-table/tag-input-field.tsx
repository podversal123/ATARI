"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type TagInputFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  /** Stored as one comma-separated string (matches the underlying text column, e.g. OFT's `performanceIndicators`) - this field only changes how it's edited, not what's saved. */
  value: string;
  onChange: (value: string) => void;
};

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Real "type each value and press , or Enter to add as a tag" input (the
 * reference's own "Performance Indicators of the Technology" field on OFT,
 * confirmed live 2026-09-03 - a removable-pill tag list, not a plain
 * multi-line textarea). Value stays one comma-separated string underneath
 * (same shape a plain text field would store), so no schema/API change -
 * only this field's own editor UI differs.
 */
export function TagInputField({ id, label, required, value, onChange }: TagInputFieldProps) {
  const [draft, setDraft] = useState("");
  const tags = parseTags(value);

  function commitDraft() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...tags, trimmed].join(", "));
    setDraft("");
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index).join(", "));
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-primary/70 hover:text-primary"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commitDraft();
            } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
              removeTag(tags.length - 1);
            }
          }}
          onBlur={commitDraft}
          className="h-7 min-w-[120px] flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          placeholder={tags.length === 0 ? "Type a value and press , or Enter" : undefined}
        />
      </div>
      <p className="text-xs text-muted-foreground">Tip: type each indicator and press , or Enter to add it as a tag.</p>
    </div>
  );
}
