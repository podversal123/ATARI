"use client";

import { type ReactNode, useEffect, useState } from "react";
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
import {
  DemographicBreakdown,
  type DemographicValues,
} from "./demographic-breakdown";

type EventDemographicDialogProps = {
  title: string;
  /** Leaf slug - only "technology-week-celebration" and "world-soil-day" ever render this dialog (EVENT_DEMOGRAPHIC_SLUGS), each with its own confirmed field set. */
  slug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRow: Record<string, ReactNode> | null;
};

const sum = (values: DemographicValues) =>
  Object.values(values).reduce((total, v) => total + (Number(v) || 0), 0);

/**
 * Add/Edit form for the two Achievement leaves whose real editors include
 * the General/OBC/SC/ST x Male/Female participant breakdown
 * (DemographicBreakdown, shared rather than duplicated). Each leaf gets its
 * own confirmed field set - Technology Week Celebration's from the client's
 * "Create Technology Week Celebration" screenshot (AMS User Manual p.22),
 * World Soil Day's from lib/navigation.ts's own confirmed columns - rather
 * than a generic fallback that would collect fields with no real column to
 * save into. Create only: editing needs a real row id threaded through
 * EmptyDataTable's rows, which no leaf has yet (a broader gap, not specific
 * to this dialog).
 */
export function EventDemographicDialog({
  title,
  slug,
  open,
  onOpenChange,
  editingRow,
}: EventDemographicDialogProps) {
  const router = useRouter();
  const isTechnologyWeek = slug === "technology-week-celebration";
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeOfActivities, setTypeOfActivities] = useState("");
  const [noOfActivities, setNoOfActivities] = useState("");
  const [relatedCropTechnology, setRelatedCropTechnology] = useState("");
  const [demographics, setDemographics] = useState<DemographicValues>({});
  const [reportingYear, setReportingYear] = useState("");
  const [noOfActivitiesConducted, setNoOfActivitiesConducted] = useState("");
  const [soilHealthCardsDistributed, setSoilHealthCardsDistributed] = useState("");
  const [noOfVip, setNoOfVip] = useState("");
  const [vipNames, setVipNames] = useState("");
  const [totalParticipants, setTotalParticipants] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const editingId = typeof editingRow?.id === "string" ? editingRow.id : undefined;

  useEffect(() => {
    if (!open || !editingId || !slug) return;
    function load() {
      setLoading(true);
      fetch(`/api/event-demographic/${editingId}?slug=${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
            return;
          }
          const v = data.values ?? {};
          const demoKeys = [
            "generalMale", "generalFemale", "obcMale", "obcFemale",
            "scMale", "scFemale", "stMale", "stFemale",
          ] as const;
          const loadedDemographics: DemographicValues = {};
          for (const key of demoKeys) loadedDemographics[key] = v[key] ?? "";
          setDemographics(loadedDemographics);
          if (isTechnologyWeek) {
            setStartDate(v.startDate ?? "");
            setEndDate(v.endDate ?? "");
            setTypeOfActivities(v.typeOfActivities ?? "");
            setNoOfActivities(v.noOfActivities ?? "");
            setRelatedCropTechnology(v.relatedCropTechnology ?? "");
          } else {
            setReportingYear(v.reportingYear ?? "");
            setNoOfActivitiesConducted(v.noOfActivitiesConducted ?? "");
            setSoilHealthCardsDistributed(v.soilHealthCardsDistributed ?? "");
            setNoOfVip(v.noOfVip ?? "");
            setVipNames(v.vipNames ?? "");
            setTotalParticipants(v.totalParticipants ?? "");
          }
        })
        .catch(() => setError("Could not load this record."))
        .finally(() => setLoading(false));
    }
    load();
  }, [open, editingId, slug, isTechnologyWeek]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setStartDate("");
      setEndDate("");
      setTypeOfActivities("");
      setNoOfActivities("");
      setRelatedCropTechnology("");
      setDemographics({});
      setReportingYear("");
      setNoOfActivitiesConducted("");
      setSoilHealthCardsDistributed("");
      setNoOfVip("");
      setVipNames("");
      setTotalParticipants("");
      setError(null);
    }
    onOpenChange(next);
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(
        editingId ? `/api/event-demographic/${editingId}` : "/api/event-demographic",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isTechnologyWeek
              ? {
                  slug,
                  values: {
                    startDate,
                    endDate,
                    typeOfActivities,
                    noOfActivities,
                    relatedCropTechnology,
                    numberOfParticipants: String(sum(demographics)),
                    ...demographics,
                  },
                }
              : {
                  slug,
                  values: {
                    reportingYear,
                    noOfActivitiesConducted,
                    soilHealthCardsDistributed,
                    noOfVip,
                    vipNames,
                    totalParticipants,
                    ...demographics,
                  },
                },
          ),
        },
      );
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingRow ? `Edit ${title}` : `Add ${title}`}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <p className="text-sm text-muted-foreground">Loading record…</p>
        )}

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
                <p className="text-lg font-semibold text-primary">
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
                  <Label htmlFor="wsd-reporting-year">Reporting Year</Label>
                  <Input
                    id="wsd-reporting-year"
                    type="number"
                    value={reportingYear}
                    onChange={(e) => setReportingYear(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wsd-activities-conducted">
                    No. of Activity Conducted
                  </Label>
                  <Input
                    id="wsd-activities-conducted"
                    type="number"
                    value={noOfActivitiesConducted}
                    onChange={(e) => setNoOfActivitiesConducted(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="wsd-shc">Soil Health Cards Distributed</Label>
                  <Input
                    id="wsd-shc"
                    type="number"
                    value={soilHealthCardsDistributed}
                    onChange={(e) => setSoilHealthCardsDistributed(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wsd-vip">No. of VIP</Label>
                  <Input
                    id="wsd-vip"
                    type="number"
                    value={noOfVip}
                    onChange={(e) => setNoOfVip(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wsd-total-participants">
                  Total No. of Participants
                </Label>
                <Input
                  id="wsd-total-participants"
                  type="number"
                  value={totalParticipants}
                  onChange={(e) => setTotalParticipants(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wsd-vip-names">
                  Name(s) of VIP(s) Involved if Any
                </Label>
                <Input
                  id="wsd-vip-names"
                  value={vipNames}
                  onChange={(e) => setVipNames(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-primary">
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
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Saving…" : editingRow ? "Save Changes" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
