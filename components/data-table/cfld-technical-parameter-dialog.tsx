"use client";

import { type ReactNode, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { DISTRICTS } from "@/lib/rbac";
import {
  DemographicBreakdown,
  type DemographicValues,
} from "./demographic-breakdown";

const TABS = [
  "Technical Parameter",
  "Economic Parameters",
  "Socio Economic Parameters",
  "Farmers Perception",
] as const;
type TabName = (typeof TABS)[number];

/** Standard CFLD economic-parameter set used across ICAR CFLD reporting (Demonstration vs Farmers' Practice comparison) - not itself confirmed from a the reference, unlike the other 3 tabs, since no Economic Parameters screen was captured in the reference set. */
const ECONOMIC_FIELDS = [
  { key: "costDemo", label: "Cost of Cultivation - Demonstration (₹/ha)" },
  {
    key: "costFarmer",
    label: "Cost of Cultivation - Farmers' Practice (₹/ha)",
  },
  { key: "grossReturnDemo", label: "Gross Return - Demonstration (₹/ha)" },
  {
    key: "grossReturnFarmer",
    label: "Gross Return - Farmers' Practice (₹/ha)",
  },
  { key: "netReturnDemo", label: "Net Return - Demonstration (₹/ha)" },
  { key: "netReturnFarmer", label: "Net Return - Farmers' Practice (₹/ha)" },
  { key: "bcRatioDemo", label: "B:C Ratio - Demonstration" },
  { key: "bcRatioFarmer", label: "B:C Ratio - Farmers' Practice" },
];

/** Real field names confirmed live. */
const PERCEPTION_FIELDS = [
  { key: "suitability", label: "Suitability to Farming System" },
  { key: "likingsPreference", label: "Likings / Preference" },
  { key: "affordability", label: "Affordability" },
  { key: "negativeEffect", label: "Any Negative Effect" },
  {
    key: "acceptableToAll",
    label: "Is Technology Acceptable to All in Group/Village",
  },
  { key: "suggestions", label: "Suggestions for Change/Improvement" },
  { key: "farmerFeedback", label: "Farmer Feedback" },
];

type CfldTechnicalParameterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRow: Record<string, ReactNode> | null;
};

/**
 * CFLD Technical Parameter's real Add/Edit form isn't a flat field list -
 * it's a 4-tab wizard (Technical / Economic / Socio-Economic / Farmers
 * Perception) with a caste/gender demographic breakdown and separate
 * "Update" vs "Mark as Completed" actions (the real reference shows a
 * yellow banner requiring Technical + Economic + Socio-Economic + Farmers
 * Perception all filled in before a record can be marked completed). Built
 * as its own dialog rather than forced into the generic per-column form
 * every other leaf uses, since the shape is genuinely different.
 */
export function CfldTechnicalParameterDialog({
  open,
  onOpenChange,
  editingRow,
}: CfldTechnicalParameterDialogProps) {
  const [activeTab, setActiveTab] = useState<TabName>("Technical Parameter");
  const [technical, setTechnical] = useState<Record<string, string>>({});
  const [economic, setEconomic] = useState<Record<string, string>>({});
  const [demographics, setDemographics] = useState<DemographicValues>({});
  const [perception, setPerception] = useState<Record<string, string>>({});

  function handleOpenChange(next: boolean) {
    if (!next) {
      setActiveTab("Technical Parameter");
      setTechnical({});
      setEconomic({});
      setDemographics({});
      setPerception({});
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingRow
              ? "Edit CFLD Technical Parameter"
              : "Add CFLD Technical Parameter"}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-md bg-accent px-3 py-2.5 text-xs text-accent-foreground">
          Mark this record as completed only after Technical, Economic,
          Socio-Economic, and Farmers Perception details have all been added.
        </div>

        <div className="flex flex-wrap gap-1 rounded-lg bg-muted/50 p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="max-h-[50vh] space-y-4 overflow-y-auto">
          {activeTab === "Technical Parameter" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cfld-year">Reporting Year</Label>
                <Input
                  id="cfld-year"
                  value={technical.reportingYear ?? ""}
                  onChange={(e) =>
                    setTechnical((p) => ({
                      ...p,
                      reportingYear: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfld-crop">Crop</Label>
                <Input
                  id="cfld-crop"
                  value={technical.crop ?? ""}
                  onChange={(e) =>
                    setTechnical((p) => ({ ...p, crop: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cfld-tech">Technology Demonstrated</Label>
                <Input
                  id="cfld-tech"
                  value={technical.technologyDemonstrated ?? ""}
                  onChange={(e) =>
                    setTechnical((p) => ({
                      ...p,
                      technologyDemonstrated: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfld-area">Area (Ha)</Label>
                <Input
                  id="cfld-area"
                  type="number"
                  min="0"
                  value={technical.areaHa ?? ""}
                  onChange={(e) =>
                    setTechnical((p) => ({ ...p, areaHa: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfld-farmers">Number of Farmers</Label>
                <Input
                  id="cfld-farmers"
                  type="number"
                  min="0"
                  value={technical.numberOfFarmers ?? ""}
                  onChange={(e) =>
                    setTechnical((p) => ({
                      ...p,
                      numberOfFarmers: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfld-district">District</Label>
                <select
                  id="cfld-district"
                  value={technical.district ?? ""}
                  onChange={(e) =>
                    setTechnical((p) => ({ ...p, district: e.target.value }))
                  }
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
                >
                  <option value="" disabled>
                    Select District
                  </option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === "Economic Parameters" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {ECONOMIC_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`cfld-econ-${field.key}`}>
                    {field.label}
                  </Label>
                  <Input
                    id={`cfld-econ-${field.key}`}
                    type="number"
                    value={economic[field.key] ?? ""}
                    onChange={(e) =>
                      setEconomic((p) => ({
                        ...p,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "Socio Economic Parameters" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Number of farmer beneficiaries by category and gender.
              </p>
              <DemographicBreakdown
                values={demographics}
                onChange={(key, value) =>
                  setDemographics((p) => ({ ...p, [key]: value }))
                }
              />
            </div>
          )}

          {activeTab === "Farmers Perception" && (
            <div className="space-y-4">
              {PERCEPTION_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`cfld-perception-${field.key}`}>
                    {field.label}
                  </Label>
                  <Textarea
                    id={`cfld-perception-${field.key}`}
                    rows={2}
                    value={perception[field.key] ?? ""}
                    onChange={(e) =>
                      setPerception((p) => ({
                        ...p,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Update
          </Button>
          <Button onClick={() => handleOpenChange(false)}>
            <CheckCircle2 className="size-3.5" />
            Mark as Completed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
