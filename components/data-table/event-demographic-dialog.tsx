"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KVKS } from "@/lib/rbac";
import {
  DemographicBreakdown,
  type DemographicValues,
} from "./demographic-breakdown";

type EventDemographicDialogProps = {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRow: Record<string, ReactNode> | null;
};

/**
 * Shared Add/Edit form for the Achievement event leaves whose real editors
 * include the General/OBC/SC/ST x Male/Female participant breakdown
 * - reuses DemographicBreakdown
 * rather than duplicating it. Only the demographic block itself and KVK/
 * Event Date are confirmed; the exact remaining field list per event wasn't
 * captured, so this keeps everything else to one honest generic "Details"
 * field rather than inventing per-event fields.
 */
export function EventDemographicDialog({
  title,
  open,
  onOpenChange,
  editingRow,
}: EventDemographicDialogProps) {
  const [kvk, setKvk] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [details, setDetails] = useState("");
  const [demographics, setDemographics] = useState<DemographicValues>({});

  function handleOpenChange(next: boolean) {
    if (!next) {
      setKvk("");
      setEventDate("");
      setDetails("");
      setDemographics({});
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingRow ? `Edit ${title}` : `Add ${title}`}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="event-kvk">KVK</Label>
              <select
                id="event-kvk"
                value={kvk}
                onChange={(e) => setKvk(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
              >
                <option value="" disabled>
                  Select KVK
                </option>
                {KVKS.map((k) => (
                  <option key={k.name} value={k.name}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-date">Event Date</Label>
              <Input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-details">Details</Label>
            <Textarea
              id="event-details"
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Participant breakdown by category and gender.
            </p>
            <DemographicBreakdown
              values={demographics}
              onChange={(key, value) =>
                setDemographics((p) => ({ ...p, [key]: value }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleOpenChange(false)}>
            {editingRow ? "Save Changes" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
