"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FldResultFieldsProps = {
  fldId: string;
  backHref: string;
};

/**
 * Real "Add Result" tab for View FLD - a full page in place, same shape as
 * OftResultFields, not a popup (client direction, 2026-09-02: keep this
 * consistent with how OFT's own Edit Result already works instead of
 * matching the standalone reference recording's compact dialog). %
 * Increase/Net Return/BCR stay server-computed, never edited directly here.
 */
export function FldResultFields({ fldId, backHref }: FldResultFieldsProps) {
  const router = useRouter();
  const [yieldDemoQha, setYieldDemoQha] = useState("");
  const [yieldCheckQha, setYieldCheckQha] = useState("");
  const [grossCostDemo, setGrossCostDemo] = useState("");
  const [grossReturnDemo, setGrossReturnDemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/fld-result/${fldId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        const v = data.values ?? {};
        setYieldDemoQha(v.yieldDemoQha ?? "");
        setYieldCheckQha(v.yieldCheckQha ?? "");
        setGrossCostDemo(v.grossCostDemo ?? "");
        setGrossReturnDemo(v.grossReturnDemo ?? "");
      })
      .catch(() => setError("Could not load this record."))
      .finally(() => setLoading(false));
  }, [fldId]);

  async function submit(markCompleted: boolean) {
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`/api/fld-result/${fldId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: { yieldDemoQha, yieldCheckQha, grossCostDemo, grossReturnDemo },
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

  const demo = Number(yieldDemoQha);
  const check = Number(yieldCheckQha);
  const percentIncrease = yieldDemoQha && check ? (((demo - check) / check) * 100).toFixed(2) : "";
  const cost = Number(grossCostDemo);
  const returnAmt = Number(grossReturnDemo);
  const netReturn = grossCostDemo && grossReturnDemo ? (returnAmt - cost).toFixed(2) : "";
  const bcr = grossCostDemo && cost && grossReturnDemo ? (returnAmt / cost).toFixed(2) : "";

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading record…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-lg font-semibold text-primary">Yield (q/ha)</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,320px))] gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="fld-yield-demo">
              Demo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fld-yield-demo"
              type="number"
              className="h-10"
              value={yieldDemoQha}
              onChange={(e) => setYieldDemoQha(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fld-yield-check">
              Check <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fld-yield-check"
              type="number"
              className="h-10"
              value={yieldCheckQha}
              onChange={(e) => setYieldCheckQha(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5 sm:max-w-[320px]">
          <Label htmlFor="fld-percent-increase">
            % Increase <span className="text-destructive">*</span>
          </Label>
          <Input id="fld-percent-increase" className="h-10" value={percentIncrease} disabled />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold text-primary">Economics of demonstration (Rs./ha)</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,320px))] gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="fld-gross-cost">
              Gross Cost <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fld-gross-cost"
              type="number"
              className="h-10"
              value={grossCostDemo}
              onChange={(e) => setGrossCostDemo(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fld-gross-return">
              Gross Return <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fld-gross-return"
              type="number"
              className="h-10"
              value={grossReturnDemo}
              onChange={(e) => setGrossReturnDemo(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fld-net-return">Net Return</Label>
            <Input id="fld-net-return" className="h-10" value={netReturn} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fld-bcr">BCR</Label>
            <Input id="fld-bcr" className="h-10" value={bcr} disabled />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" onClick={() => router.push(backHref)} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="outline-primary" onClick={() => submit(false)} disabled={submitting}>
          {submitting ? "Saving…" : "Create Result"}
        </Button>
        <Button onClick={() => submit(true)} disabled={submitting}>
          <Save className="size-3.5" />
          {submitting ? "Saving…" : "Mark as Completed"}
        </Button>
      </div>
    </div>
  );
}
