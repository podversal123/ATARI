"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Row = { id?: string; item: string; areaHa: string };

const blankRow = (): Row => ({ item: "", areaHa: "" });

/**
 * "Total Land with KVK" - the repeatable Item + In Ha section from the live
 * reference's Edit KVK form (atariams.org /edit-kvks), lifted out into the
 * About KVK > Land Details leaf. "Add More Item" appends a row, "Remove
 * Item" drops one, and a single Save writes the whole set through
 * PUT /api/land-details. The rows still feed report section 1.3.B.
 *
 * Rendered inside the shared leaf page, which already carries the
 * breadcrumb - so this owns just the card, no PageHeader of its own.
 */
export function LandDetailsForm({ backHref }: { backHref: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([blankRow()]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/land-details")
      .then((r) => r.json())
      .then((data: { rows?: Row[] }) => {
        setRows(data.rows && data.rows.length ? data.rows : [blankRow()]);
      })
      .catch(() => setRows([blankRow()]))
      .finally(() => setLoaded(true));
  }, []);

  function update(index: number, key: "item" | "areaHa", value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
    setSaved(false);
  }

  function addRow() {
    setRows((prev) => [...prev, blankRow()]);
    setSaved(false);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length === 1 ? [blankRow()] : prev.filter((_, i) => i !== index)));
    setSaved(false);
  }

  async function save() {
    setError(null);
    const filled = rows.filter((r) => r.item.trim() || r.areaHa.trim());
    if (filled.some((r) => !r.item.trim())) {
      setError("Every row needs an item.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/land-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: filled }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h1 className="text-lg font-semibold text-primary">Total Land with KVK</h1>

      <div className="mt-4 space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.id ?? `new-${index}`}
            className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div className="space-y-1.5">
              <Label htmlFor={`land-item-${index}`}>Item:</Label>
              <Input
                id={`land-item-${index}`}
                className="h-10"
                value={row.item}
                onChange={(e) => update(index, "item", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`land-area-${index}`}>In Ha:</Label>
              <Input
                id={`land-area-${index}`}
                className="h-10"
                value={row.areaHa}
                onChange={(e) => update(index, "areaHa", e.target.value)}
              />
            </div>
            {index === 0 ? (
              <Button type="button" onClick={addRow}>
                <Plus className="size-3.5" />
                Add More Item
              </Button>
            ) : (
              <Button type="button" variant="destructive" onClick={() => removeRow(index)}>
                <Trash2 className="size-3.5" />
                Remove Item
              </Button>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      {saved && !error && <p className="mt-4 text-sm font-medium text-primary">Saved.</p>}

      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" onClick={() => router.push(backHref)} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving}>
          <Save className="size-3.5" />
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
