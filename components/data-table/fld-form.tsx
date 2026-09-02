"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleSelect } from "@/components/ui/simple-select";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import { DemographicGrid, type DemographicValues } from "./demographic-breakdown";
import { FormPhotosField, type FormPhoto } from "./form-photos-field";
import { FldResultFields } from "./fld-result-fields";

type FldFormProps = {
  trail: Crumb[];
  backHref: string;
  /** Present in Edit mode (fetches the existing record); absent in Add mode (starts blank, status always "Ongoing" - same "no status selector on the main form" shape as OftForm, real status changes go through Mark Completed/Add Result instead). */
  id?: string;
  /** Which pill is active on load - the list page's own "Add Result" row action jumps straight to "result" via ?tab=result, same query-param convention OftForm's own toggle uses. */
  initialView?: "fld" | "result";
};

const currentYear = new Date().getFullYear();

/** Dedupes and drops blank values before handing a list to SimpleSelect - real bug found 2026-09-01: mapping master rows straight to option strings let a blank/duplicate field value through as a literal "" option, crashing React with "two children with the same key ''" (see the identical fix in oft-form.tsx). */
function uniqueNonEmpty(values: (string | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v?.trim()))));
}
const REPORTING_YEARS = Array.from({ length: 6 }, (_, i) => String(currentYear - i));

type NamedRow = Record<string, string>;

/**
 * Real field set confirmed against the reference (atari-client.vercel.app,
 * 2026-08-15 screenshots) - Staff/Season/Sector/Thematic Area/Crop-Animal-
 * Enterprise/No. of demonstration/Unit/Quantity/Farmers Details were
 * missing entirely before (real schema gaps, now added). Sector -> Category
 * -> Sub Category -> Crop/Animal/Enterprise reuses the exact same cascading
 * masters All Masters' own Sector/Category/Sub-category/Crop pages already
 * manage - no new master infrastructure needed, just wiring it in here.
 */
export function FldForm({ trail, backHref, id, initialView }: FldFormProps) {
  const router = useRouter();
  const [activeView, setActiveView] = useState<"fld" | "result">(initialView ?? "fld");
  const [sectorRows, setSectorRows] = useState<NamedRow[]>([]);
  const [categoryRows, setCategoryRows] = useState<NamedRow[]>([]);
  const [subCategoryRows, setSubCategoryRows] = useState<NamedRow[]>([]);
  const [cropRows, setCropRows] = useState<NamedRow[]>([]);
  const [thematicAreaRows, setThematicAreaRows] = useState<NamedRow[]>([]);
  const [staffOptions, setStaffOptions] = useState<string[]>([]);
  const [seasonOptions, setSeasonOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    const fetchRows = (slug: string, setter: (rows: NamedRow[]) => void) =>
      fetch(`/api/master-options?slug=${slug}`)
        .then((res) => (res.ok ? res.json() : { rows: [] }))
        .then((data) => setter(data.rows ?? []))
        .catch(() => {});
    fetchRows("sector", setSectorRows);
    fetchRows("category", setCategoryRows);
    fetchRows("sub-category", setSubCategoryRows);
    fetchRows("crop", setCropRows);
    fetchRows("fld-thematic-area", setThematicAreaRows);
    fetch("/api/staff-options")
      .then((res) => (res.ok ? res.json() : { rows: [] }))
      .then((data) => setStaffOptions(uniqueNonEmpty((data.rows ?? []).map((r: NamedRow) => r.name))))
      .catch(() => {});
    /** Real Season Master (audit finding, 2026-09-02 - the hardcoded Kharif/Rabi/Zaid list didn't match the real master's actual values, Kharif/Rabi/Summer). */
    fetch("/api/master-options?slug=season")
      .then((res) => (res.ok ? res.json() : { rows: [] }))
      .then((data) => setSeasonOptions(uniqueNonEmpty((data.rows ?? []).map((r: NamedRow) => r.name))))
      .catch(() => {});
  }, []);

  const [reportingYear, setReportingYear] = useState(String(currentYear));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [staff, setStaff] = useState("");
  const [season, setSeason] = useState("");
  const [sector, setSector] = useState("");
  const [thematicArea, setThematicArea] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [cropAnimalEnterprise, setCropAnimalEnterprise] = useState("");
  const [technologyDemonstrated, setTechnologyDemonstrated] = useState("");
  const [noOfDemonstration, setNoOfDemonstration] = useState("");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState("Ongoing");
  const [demographics, setDemographics] = useState<DemographicValues>({});
  const [moduleImages, setModuleImages] = useState<FormPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sectorOptions = useMemo(() => uniqueNonEmpty(sectorRows.map((r) => r.sectorName)).sort(), [sectorRows]);
  const thematicAreaOptions = useMemo(
    () =>
      uniqueNonEmpty(
        thematicAreaRows.filter((r) => !sector || r.sectorName === sector).map((r) => r.thematicAreaName),
      ).sort(),
    [thematicAreaRows, sector],
  );
  const categoryOptions = useMemo(
    () => uniqueNonEmpty(categoryRows.filter((r) => !sector || r.sectorName === sector).map((r) => r.categoryName)).sort(),
    [categoryRows, sector],
  );
  const subCategoryOptions = useMemo(
    () =>
      uniqueNonEmpty(
        subCategoryRows
          .filter((r) => (!sector || r.sectorName === sector) && (!category || r.categoryName === category))
          .map((r) => r.subCategoryName),
      ).sort(),
    [subCategoryRows, sector, category],
  );
  const cropOptions = useMemo(
    () =>
      uniqueNonEmpty(
        cropRows
          .filter(
            (r) =>
              (!sector || r.sectorName === sector) &&
              (!category || r.category === category) &&
              (!subCategory || r.subCategoryName === subCategory),
          )
          .map((r) => r.cropName),
      ).sort(),
    [cropRows, sector, category, subCategory],
  );

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/fld/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setReportingYear(data.reportingYear || String(currentYear));
        setStartDate(data.startDate ?? "");
        setEndDate(data.endDate ?? "");
        setStaff(data.staff ?? "");
        setSeason(data.season ?? "");
        setSector(data.sector ?? "");
        setThematicArea(data.thematicArea ?? "");
        setCategory(data.category ?? "");
        setSubCategory(data.subCategory ?? "");
        setCropAnimalEnterprise(data.cropAnimalEnterprise ?? "");
        setTechnologyDemonstrated(data.technologyDemonstrated ?? "");
        setNoOfDemonstration(data.noOfDemonstration ?? "");
        setUnit(data.unit ?? "");
        setQuantity(data.quantity ?? "");
        setStatus(data.status ?? "Ongoing");
        setDemographics({
          generalMale: data.generalMale ?? "",
          generalFemale: data.generalFemale ?? "",
          obcMale: data.obcMale ?? "",
          obcFemale: data.obcFemale ?? "",
          scMale: data.scMale ?? "",
          scFemale: data.scFemale ?? "",
          stMale: data.stMale ?? "",
          stFemale: data.stFemale ?? "",
        });
        setModuleImages(Array.isArray(data.moduleImages) ? data.moduleImages : []);
      })
      .catch(() => setError("Could not load this record."))
      .finally(() => setLoading(false));
  }, [id]);

  async function submit() {
    if (!category || !subCategory || !technologyDemonstrated) {
      setError("Please fill all required fields.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const values = {
        reportingYear,
        startDate,
        endDate,
        staff,
        season,
        sector,
        thematicArea,
        category,
        subCategory,
        cropAnimalEnterprise,
        technologyDemonstrated,
        noOfDemonstration,
        unit,
        quantity,
        status: id ? status : "Ongoing",
        ...demographics,
        moduleImages: JSON.stringify(moduleImages),
      };
      const path = "achievements/front-line-demonstration/view-fld";
      const response = await fetch(
        id ? "/api/leaf-record/update" : "/api/leaf-record",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(id ? { path, id, values } : { path, values }),
        },
      );
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
    idAttr: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: string[],
    required?: boolean,
  ) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={idAttr}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <SimpleSelect
          id={idAttr}
          value={value}
          onValueChange={onChange}
          placeholder="Please Select"
          options={options.map((option) => ({ value: option, label: option }))}
        />
      </div>
    );
  }

  function textField(
    idAttr: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    required?: boolean,
    type: "text" | "number" | "date" = "text",
  ) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={idAttr}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id={idAttr}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={type === "text" ? `Enter ${label.toLowerCase()}` : undefined}
        />
      </div>
    );
  }

  return (
    <div>
      {/* "Edit/Add FLD / Add Result" tab pill - shown on both Add and Edit (client direction, 2026-09-02: "add new pe bhi same flow hona chahiye jo action mein hai"), same pattern as OftForm's own toggle. Add Result switches this same page in place (client direction, 2026-09-02: keep it consistent with OFT's own full-page Edit Result instead of a popup) and stays disabled until the record actually exists - a result belongs to a saved trial, there's no fldId to attach it to yet on a blank Add page. */}
      <div className="mb-4 flex w-fit overflow-hidden rounded-full bg-primary p-1">
        <button
          type="button"
          onClick={() => setActiveView("fld")}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors",
            activeView === "fld" ? "bg-card text-foreground shadow-sm" : "text-primary-foreground hover:bg-white/10",
          )}
        >
          {id ? "Edit FLD" : "Add FLD"}
        </button>
        <button
          type="button"
          onClick={() => setActiveView("result")}
          disabled={!id}
          title={id ? undefined : "Save the FLD first to add a result."}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
            activeView === "result" ? "bg-card text-foreground shadow-sm" : "text-primary-foreground hover:bg-white/10",
          )}
        >
          Add Result
        </button>
      </div>

      {/* Full page heading (as opposed to the short "Edit FLD"/"Add FLD" tab-pill label above) - real reference (2026-09-02) spells it out as "Edit Front Line Demonstrations (FLD)". */}
      <PageHeader
        backHref={backHref}
        trail={trail}
        title={
          activeView === "result"
            ? "Add FLD Result"
            : id
              ? "Edit Front Line Demonstrations (FLD)"
              : "Add Front Line Demonstrations (FLD)"
        }
      />

      {activeView === "result" && id ? (
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-lg border border-border bg-card p-5 duration-300">
          <FldResultFields fldId={id} backHref={backHref} />
        </div>
      ) : (
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-lg border border-border bg-card p-5 duration-300">
        {loading && <p className="mb-4 text-sm text-muted-foreground">Loading record…</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {textField("fld-start-date", "Start Date", startDate, setStartDate, true, "date")}
          {textField("fld-end-date", "Expected Completion Date", endDate, setEndDate, true, "date")}
          {selectField("fld-staff", "Name of SMS/KVK Head", staff, setStaff, staffOptions, true)}
          {selectField("fld-season", "Season", season, setSeason, seasonOptions, true)}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {selectField("fld-sector", "Sector", sector, setSector, sectorOptions, true)}
          {selectField("fld-thematic-area", "Thematic Area", thematicArea, setThematicArea, thematicAreaOptions, true)}
          {selectField("fld-category", "Category", category, setCategory, categoryOptions, true)}
          {selectField("fld-sub-category", "Sub Category", subCategory, setSubCategory, subCategoryOptions, true)}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {selectField("fld-crop", "Crop/Animal/Enterprise", cropAnimalEnterprise, setCropAnimalEnterprise, cropOptions, true)}
          {textField("fld-technology", "Name of Technology Demonstrated (FLD Name)", technologyDemonstrated, setTechnologyDemonstrated, true)}
          {textField("fld-no-of-demo", "No of demonstration", noOfDemonstration, setNoOfDemonstration, true, "number")}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {textField("fld-unit", "Unit", unit, setUnit, false)}
          {textField("fld-quantity", "Quantity", quantity, setQuantity, false, "number")}
        </div>

        {id && (
          <div className="mt-4 sm:max-w-xs">
            {selectField("fld-status", "Ongoing/Completed", status, setStatus, ["Ongoing", "Completed"], true)}
          </div>
        )}

        <div className="mt-5 space-y-2 border-t border-border pt-4">
          <p className="text-sm font-semibold text-primary">Farmers Details</p>
          <DemographicGrid
            values={demographics}
            onChange={(key, value) => setDemographics((p) => ({ ...p, [key]: value }))}
          />
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <FormPhotosField value={moduleImages} onChange={setModuleImages} />
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
      )}
    </div>
  );
}
