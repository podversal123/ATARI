"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import {
  DemographicBreakdown,
  type DemographicValues,
} from "./demographic-breakdown";

type OftAddFormProps = {
  trail: Crumb[];
  backHref: string;
};

/** Real discipline headings the report groups each OFT under (section "1.2.A KVK Wise OFT Details" of the real ATARI AMS Report). */
const DISCIPLINES = [
  "OFT (Agricultural Extension)",
  "OFT (Agronomy)",
  "OFT (Animal Science)",
  "OFT (Fisheries)",
  "OFT (Home Science)",
];
const SOURCES = ["ICAR", "AICRP", "SAU", "Other"];
const STATUSES = ["Ongoing", "Completed"];

const currentYear = new Date().getFullYear();
const REPORTING_YEARS = Array.from({ length: 6 }, (_, i) => String(currentYear - i));

/**
 * Real field set from the ATARI AMS Report's own OFT detail block - richer
 * than the list view's 6 columns (which stay list-only, matching the app's
 * existing pattern of a fuller Add form behind a shorter list). The
 * per-technology-option table and Proposed/Actual results table from that
 * same report section aren't collected here yet - those are a nested
 * repeating sub-form left for a follow-up pass, not guessed at here.
 */
export function OftAddForm({ trail, backHref }: OftAddFormProps) {
  const router = useRouter();
  const [reportingYear, setReportingYear] = useState(String(currentYear));
  const [discipline, setDiscipline] = useState("");
  const [staff, setStaff] = useState("");
  const [thematicArea, setThematicArea] = useState("");
  const [trialOnForm, setTrialOnForm] = useState("");
  const [problemDiagnosed, setProblemDiagnosed] = useState("");
  const [sourceOfTechnology, setSourceOfTechnology] = useState("");
  const [productionSystem, setProductionSystem] = useState("");
  const [performanceIndicators, setPerformanceIndicators] = useState("");
  const [finalRecommendation, setFinalRecommendation] = useState("");
  const [constraintsIdentified, setConstraintsIdentified] = useState("");
  const [farmersParticipationProcess, setFarmersParticipationProcess] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [noOfTrialReplicationFarmer, setNoOfTrialReplicationFarmer] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [criticalInput, setCriticalInput] = useState("");
  const [costOfOft, setCostOfOft] = useState("");
  const [fundingAgency, setFundingAgency] = useState("");
  const [status, setStatus] = useState("");
  const [demographics, setDemographics] = useState<DemographicValues>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!discipline || !staff || !thematicArea || !trialOnForm || !status) {
      setError("Please fill all required fields.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/leaf-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "achievements/oft",
          values: {
            reportingYear,
            discipline,
            staff,
            thematicArea,
            trialOnForm,
            problemDiagnosed,
            sourceOfTechnology,
            productionSystem,
            performanceIndicators,
            finalRecommendation,
            constraintsIdentified,
            farmersParticipationProcess,
            quantity,
            unit,
            noOfTrialReplicationFarmer,
            startMonth,
            endMonth,
            criticalInput,
            costOfOft,
            fundingAgency,
            status,
            ...demographics,
          },
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

  function selectField(
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: string[],
    required?: boolean,
  ) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none hover:border-ring/60 focus-visible:border-ring"
        >
          <option value="">Please Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function textField(
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    required?: boolean,
    placeholder?: string,
  ) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader backHref={backHref} trail={trail} title="Add OFT" />

      <div className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-lg border border-border bg-card p-5 duration-300">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {selectField("oft-year", "Reporting Year", reportingYear, setReportingYear, REPORTING_YEARS, true)}
          {selectField("oft-discipline", "Discipline", discipline, setDiscipline, DISCIPLINES, true)}
          {textField("oft-staff", "Staff", staff, setStaff, true)}
          {textField("oft-thematic-area", "Thematic Area", thematicArea, setThematicArea, true)}
          {textField("oft-title", "Title of On Farm Trial", trialOnForm, setTrialOnForm, true)}
          {selectField("oft-status", "Ongoing/Completed", status, setStatus, STATUSES, true)}
          {selectField("oft-source", "Source of Technology (ICAR/ SAU/Other, please specify)", sourceOfTechnology, setSourceOfTechnology, SOURCES)}
          {textField("oft-production-system", "Production System", productionSystem, setProductionSystem)}
          {textField("oft-quantity", "Quantity", quantity, setQuantity)}
          {textField("oft-unit", "Unit", unit, setUnit, false, "e.g. ha, Kg")}
          {textField("oft-trials", "No. of Trial/Replication", noOfTrialReplicationFarmer, setNoOfTrialReplicationFarmer)}
          {textField("oft-critical-input", "Critical Input", criticalInput, setCriticalInput)}
          {textField("oft-cost", "Cost of OFT", costOfOft, setCostOfOft)}
          {textField("oft-funding-agency", "Funding Agency", fundingAgency, setFundingAgency)}
          <div className="space-y-1.5">
            <Label htmlFor="oft-start-month">OFT Start on</Label>
            <Input id="oft-start-month" type="date" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oft-end-month">OFT End on</Label>
            <Input id="oft-end-month" type="date" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="oft-problem">Problem Diagnosed</Label>
            <Textarea id="oft-problem" value={problemDiagnosed} onChange={(e) => setProblemDiagnosed(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oft-performance-indicators">Performance Indicators of the Technology</Label>
            <Textarea id="oft-performance-indicators" value={performanceIndicators} onChange={(e) => setPerformanceIndicators(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oft-final-recommendation">Final Recommendation for Micro Level Situation</Label>
            <Textarea id="oft-final-recommendation" value={finalRecommendation} onChange={(e) => setFinalRecommendation(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oft-constraints">Constraints Identified and Feedback for Research</Label>
            <Textarea id="oft-constraints" value={constraintsIdentified} onChange={(e) => setConstraintsIdentified(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oft-farmers-participation">Process of Farmers Participation and Their Reaction</Label>
            <Textarea id="oft-farmers-participation" value={farmersParticipationProcess} onChange={(e) => setFarmersParticipationProcess(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-4">
          <p className="text-sm font-semibold text-primary">Farmers Details</p>
          <DemographicBreakdown
            values={demographics}
            onChange={(key, value) => setDemographics((p) => ({ ...p, [key]: value }))}
          />
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
          <Button onClick={submit} disabled={submitting}>
            <Save className="size-3.5" />
            {submitting ? "Saving…" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
