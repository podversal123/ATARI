"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiImageUploadField } from "./multi-image-upload-field";
import {
  defaultResultTables,
  type OftResultTable,
} from "@/lib/oft-result-tables";

type OftResultFieldsProps = {
  oftId: string;
  backHref: string;
};

/**
 * Real "Edit OFT Result" fields (atari-client.vercel.app, confirmed
 * 2026-09-02) - replaces the earlier single-textarea placeholder entirely.
 * Rendered by OftForm when the "Edit Result" tab is active (same tab-pill
 * pattern CFLD Technical Parameter already uses), not a separate page/route.
 */
export function OftResultFields({ oftId, backHref }: OftResultFieldsProps) {
  const router = useRouter();
  const [finalRecommendation, setFinalRecommendation] = useState("");
  const [constraintsIdentified, setConstraintsIdentified] = useState("");
  const [farmersParticipationProcess, setFarmersParticipationProcess] = useState("");
  const [resultSummary, setResultSummary] = useState("");
  const [remark, setRemark] = useState("");
  const [photographUrls, setPhotographUrls] = useState<string[]>([]);
  const [datasheetUrls, setDatasheetUrls] = useState<string[]>([]);
  const [datasheetUploading, setDatasheetUploading] = useState(false);
  const [datasheetError, setDatasheetError] = useState<string | null>(null);
  const [resultTables, setResultTables] = useState<OftResultTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/oft-result/${oftId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setFinalRecommendation(data.finalRecommendation ?? "");
        setConstraintsIdentified(data.constraintsIdentified ?? "");
        setFarmersParticipationProcess(data.farmersParticipationProcess ?? "");
        setResultSummary(data.resultSummary ?? "");
        setRemark(data.remark ?? "");
        setPhotographUrls(data.photographUrls ?? []);
        setDatasheetUrls(data.supplementaryDatasheetUrls ?? []);
        setResultTables(
          Array.isArray(data.resultTables) && data.resultTables.length > 0
            ? data.resultTables
            : defaultResultTables([]),
        );
      })
      .catch(() => setError("Could not load this record."))
      .finally(() => setLoading(false));
  }, [oftId]);

  async function handleDatasheetFiles(files: FileList) {
    setDatasheetError(null);
    setDatasheetUploading(true);
    const uploaded: string[] = [];
    const failures: string[] = [];
    try {
      for (const file of Array.from(files)) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("kind", "oft-supplementary-datasheet");
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
      if (uploaded.length > 0) setDatasheetUrls((prev) => [...prev, ...uploaded]);
      if (failures.length > 0) setDatasheetError(failures.join(" "));
    } finally {
      setDatasheetUploading(false);
    }
  }

  function removeDatasheet(index: number) {
    setDatasheetUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function updateTableName(tableIndex: number, name: string) {
    setResultTables((prev) => prev.map((t, i) => (i === tableIndex ? { ...t, name } : t)));
  }
  function addColumn(tableIndex: number) {
    setResultTables((prev) =>
      prev.map((t, i) =>
        i === tableIndex
          ? { ...t, columns: [...t.columns, `Column ${t.columns.length + 1}`], rows: t.rows.map((r) => [...r, ""]) }
          : t,
      ),
    );
  }
  function removeColumn(tableIndex: number, columnIndex: number) {
    setResultTables((prev) =>
      prev.map((t, i) =>
        i === tableIndex
          ? {
              ...t,
              columns: t.columns.filter((_, ci) => ci !== columnIndex),
              rows: t.rows.map((r) => r.filter((_, ci) => ci !== columnIndex)),
            }
          : t,
      ),
    );
  }
  function updateColumnName(tableIndex: number, columnIndex: number, name: string) {
    setResultTables((prev) =>
      prev.map((t, i) =>
        i === tableIndex ? { ...t, columns: t.columns.map((c, ci) => (ci === columnIndex ? name : c)) } : t,
      ),
    );
  }
  function addRow(tableIndex: number) {
    setResultTables((prev) =>
      prev.map((t, i) => (i === tableIndex ? { ...t, rows: [...t.rows, Array(t.columns.length).fill("")] } : t)),
    );
  }
  function removeRow(tableIndex: number, rowIndex: number) {
    setResultTables((prev) =>
      prev.map((t, i) => (i === tableIndex ? { ...t, rows: t.rows.filter((_, ri) => ri !== rowIndex) } : t)),
    );
  }
  function updateCell(tableIndex: number, rowIndex: number, columnIndex: number, value: string) {
    setResultTables((prev) =>
      prev.map((t, i) =>
        i === tableIndex
          ? {
              ...t,
              rows: t.rows.map((r, ri) => (ri === rowIndex ? r.map((c, ci) => (ci === columnIndex ? value : c)) : r)),
            }
          : t,
      ),
    );
  }
  function removeTable(tableIndex: number) {
    setResultTables((prev) => prev.filter((_, i) => i !== tableIndex));
  }
  function addTable() {
    setResultTables((prev) => [
      ...prev,
      { name: `Table ${prev.length + 1}`, columns: ["Column 1", "Column 2"], rows: [["", ""]] },
    ]);
  }

  async function submit(markCompleted: boolean) {
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`/api/oft-result/${oftId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalRecommendation,
          constraintsIdentified,
          farmersParticipationProcess,
          resultSummary,
          remark,
          photographUrls,
          supplementaryDatasheetUrls: datasheetUrls,
          resultTables,
          markCompleted,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(backHref);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading record…</p>;
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="oft-final-recommendation">
            Final recommendation for micro level situation <span className="text-destructive">*</span>
          </Label>
          <Textarea id="oft-final-recommendation" value={finalRecommendation} onChange={(e) => setFinalRecommendation(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oft-constraints">
            Constraints identified and feedback for research <span className="text-destructive">*</span>
          </Label>
          <Textarea id="oft-constraints" value={constraintsIdentified} onChange={(e) => setConstraintsIdentified(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oft-farmers-participation">
            Process of farmers participation and their reaction <span className="text-destructive">*</span>
          </Label>
          <Textarea id="oft-farmers-participation" value={farmersParticipationProcess} onChange={(e) => setFarmersParticipationProcess(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oft-result-summary">
            Result <span className="text-destructive">*</span>
          </Label>
          <Textarea id="oft-result-summary" value={resultSummary} onChange={(e) => setResultSummary(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="oft-remark">Remark</Label>
        <Textarea id="oft-remark" rows={4} value={remark} onChange={(e) => setRemark(e.target.value)} />
      </div>

      <div className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
        <MultiImageUploadField
          label="Photographs"
          uploadKind="oft-photograph"
          value={photographUrls}
          onChange={setPhotographUrls}
        />
        <div className="space-y-1.5">
          <Label>Supplementary Datasheets</Label>
          <input
            type="file"
            id="oft-datasheet-input"
            accept=".pdf,image/jpeg,image/png,image/webp,.xls,.xlsx,.doc,.docx"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) handleDatasheetFiles(files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={datasheetUploading}
            onClick={() => document.getElementById("oft-datasheet-input")?.click()}
            className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-5 text-center transition-colors hover:border-primary/50 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileText className="size-6 text-muted-foreground" />
            <span className="text-sm font-medium text-primary">
              {datasheetUploading ? "Uploading…" : "Click to upload datasheets"}
            </span>
            <span className="text-xs text-muted-foreground">
              PDF / Image / Excel / Word allowed. (Max 5 MB per file)
            </span>
          </button>
          {datasheetError && <p className="text-xs font-medium text-destructive">{datasheetError}</p>}
          {datasheetUrls.length > 0 && (
            <ul className="space-y-1 pt-1">
              {datasheetUrls.map((url, index) => (
                <li key={url} className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs">
                  <a
                    href={`/api/files/view?url=${encodeURIComponent(url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center gap-1.5 truncate text-primary hover:underline"
                  >
                    <FileText className="size-3.5 shrink-0" />
                    <span className="truncate">{url.split("/").pop()?.split("-").slice(0, -1).join("-") || `File ${index + 1}`}</span>
                  </a>
                  <button type="button" onClick={() => removeDatasheet(index)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-4 border-t border-border pt-4">
        <p className="text-sm font-semibold text-primary">Dynamic Result Tables</p>
        {resultTables.map((table, tableIndex) => (
          <div key={tableIndex} className="rounded-lg border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={table.name}
                onChange={(e) => updateTableName(tableIndex, e.target.value)}
                className="max-w-xs"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => addColumn(tableIndex)}>
                Add Column
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => addRow(tableIndex)}>
                Add Row
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => removeTable(tableIndex)}
              >
                Remove Table
              </Button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="divide-x divide-border border-b border-border">
                    {table.columns.map((column, columnIndex) => (
                      <th key={columnIndex} className="p-1.5">
                        <div className="flex items-center gap-1">
                          <Input
                            value={column}
                            onChange={(e) => updateColumnName(tableIndex, columnIndex, e.target.value)}
                            className="h-8"
                          />
                          <button
                            type="button"
                            onClick={() => removeColumn(tableIndex, columnIndex)}
                            className="shrink-0 text-destructive hover:text-destructive/80"
                            aria-label={`Remove column ${column}`}
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="p-1.5 text-left text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="divide-x divide-border border-b border-border last:border-0">
                      {row.map((cell, columnIndex) => (
                        <td key={columnIndex} className="p-1.5">
                          <Input
                            value={cell}
                            onChange={(e) => updateCell(tableIndex, rowIndex, columnIndex, e.target.value)}
                            className="h-8"
                            disabled={columnIndex === 0}
                          />
                        </td>
                      ))}
                      <td className="p-1.5">
                        <button
                          type="button"
                          onClick={() => removeRow(tableIndex, rowIndex)}
                          className="text-xs font-medium text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addTable}>
          Add Table
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" onClick={() => router.push(backHref)} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="outline-primary" onClick={() => submit(false)} disabled={submitting}>
          <Save className="size-3.5" />
          {submitting ? "Saving…" : "Update Result"}
        </Button>
        <Button onClick={() => submit(true)} disabled={submitting}>
          <CheckCircle2 className="size-3.5" />
          {submitting ? "Saving…" : "Mark as Completed"}
        </Button>
      </div>
    </div>
  );
}
