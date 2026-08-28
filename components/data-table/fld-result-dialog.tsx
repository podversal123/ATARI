"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FldResultDialogProps = {
  fldId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Real "Add Result" tab for View FLD, confirmed live 2026-08-15 ("project
 * over" reference) - was a fake single-textarea dialog before this (see
 * app/api/fld-result/[id]/route.ts's own comment). % Increase/Net
 * Return/BCR are server-computed (same auto-calc convention as CFLD's
 * Economic Parameters), never edited directly here.
 */
export function FldResultDialog({ fldId, open, onOpenChange }: FldResultDialogProps) {
  const router = useRouter();
  const [yieldDemoQha, setYieldDemoQha] = useState("");
  const [yieldCheckQha, setYieldCheckQha] = useState("");
  const [grossCostDemo, setGrossCostDemo] = useState("");
  const [grossReturnDemo, setGrossReturnDemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !fldId) return;
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
  }, [open, fldId]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setYieldDemoQha("");
      setYieldCheckQha("");
      setGrossCostDemo("");
      setGrossReturnDemo("");
      setError(null);
    }
    onOpenChange(next);
  }

  async function submit(markCompleted: boolean) {
    if (!fldId) return;
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
      handleOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create FLD Result</DialogTitle>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Loading record…</p>}

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">Yield (q/ha)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fld-yield-demo">Demo</Label>
                <Input
                  id="fld-yield-demo"
                  type="number"
                  value={yieldDemoQha}
                  onChange={(e) => setYieldDemoQha(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fld-yield-check">Check</Label>
                <Input
                  id="fld-yield-check"
                  type="number"
                  value={yieldCheckQha}
                  onChange={(e) => setYieldCheckQha(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fld-percent-increase">% Increase</Label>
              <Input id="fld-percent-increase" value={percentIncrease} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">Economics of demonstration (Rs./ha)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fld-gross-cost">Gross Cost</Label>
                <Input
                  id="fld-gross-cost"
                  type="number"
                  value={grossCostDemo}
                  onChange={(e) => setGrossCostDemo(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fld-gross-return">Gross Return</Label>
                <Input
                  id="fld-gross-return"
                  type="number"
                  value={grossReturnDemo}
                  onChange={(e) => setGrossReturnDemo(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fld-net-return">Net Return</Label>
                <Input id="fld-net-return" value={netReturn} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fld-bcr">BCR</Label>
                <Input id="fld-bcr" value={bcr} disabled />
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="outline-primary" onClick={() => submit(false)} disabled={submitting}>
            {submitting ? "Saving…" : "Create Result"}
          </Button>
          <Button onClick={() => submit(true)} disabled={submitting}>
            {submitting ? "Saving…" : "Mark as Completed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
