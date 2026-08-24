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
  /** Leaf slug - "technology-week-celebration" gets its own confirmed field set below; every other leaf keeps the generic KVK/Event Date/Details fallback. */
  slug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRow: Record<string, ReactNode> | null;
};

/**
 * Shared Add/Edit form for the Achievement event leaves whose real editors
 * include the General/OBC/SC/ST x Male/Female participant breakdown
 * - reuses DemographicBreakdown
 * rather than duplicating it. Only the demographic block itself and KVK/
 * Event Date are confirmed for most of these leaves; the exact remaining
 * field list per event wasn't captured for them, so they keep one honest
 * generic "Details" field rather than inventing per-event fields.
 * Technology Week Celebration is the one exception - its real "Create
 * Technology Week Celebration" form (AMS User Manual p.22) is fully
 * confirmed, so it gets its own fields instead of the generic fallback.
 */
export function EventDemographicDialog({
  title,
  slug,
  open,
  onOpenChange,
  editingRow,
}: EventDemographicDialogProps) {
  const isTechnologyWeek = slug === "technology-week-celebration";
  const [kvk, setKvk] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeOfActivities, setTypeOfActivities] = useState("");
  const [noOfActivities, setNoOfActivities] = useState("");
  const [relatedCropTechnology, setRelatedCropTechnology] = useState("");
  const [demographics, setDemographics] = useState<DemographicValues>({});

  function handleOpenChange(next: boolean) {
    if (!next) {
      setKvk("");
      setEventDate("");
      setDetails("");
      setStartDate("");
      setEndDate("");
      setTypeOfActivities("");
      setNoOfActivities("");
      setRelatedCropTechnology("");
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
          {isTechnologyWeek ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="event-start-date">Start Date</Label>
                  <Input
                    id="event-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="event-end-date">End Date</Label>
                  <Input
                    id="event-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="event-type-of-activities">
                    Type of Activities
                  </Label>
                  <Input
                    id="event-type-of-activities"
                    value={typeOfActivities}
                    onChange={(e) => setTypeOfActivities(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="event-no-of-activities">
                    No. of Activities
                  </Label>
                  <Input
                    id="event-no-of-activities"
                    value={noOfActivities}
                    onChange={(e) => setNoOfActivities(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-related-crop-technology">
                  Related Crop/Livestock Technology
                </Label>
                <Input
                  id="event-related-crop-technology"
                  value={relatedCropTechnology}
                  onChange={(e) => setRelatedCropTechnology(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary">
                  Farmers Details
                </p>
                <DemographicBreakdown
                  values={demographics}
                  onChange={(key, value) =>
                    setDemographics((p) => ({ ...p, [key]: value }))
                  }
                />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
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
