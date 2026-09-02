"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleSelect } from "@/components/ui/simple-select";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { FileUploadField } from "@/components/data-table/file-upload-field";
import type { MasterColumn } from "@/lib/navigation";

const PHOTO_COLUMN: MasterColumn = { key: "photo", label: "Photo", fileKind: "image", uploadKind: "staff-photo" };
const RESUME_COLUMN: MasterColumn = { key: "resume", label: "Resume", fileKind: "document", uploadKind: "staff-resume" };

type EmployeeDetailsAddFormProps = {
  trail: Crumb[];
  backHref: string;
};

/** One real All Masters list per dropdown here - fetched live rather than hardcoded, so these track the real Sanctioned Post/Pay Scale/Job Type/Staff Category master lists instead of drifting out of sync with them (client direction, 2026-09-01). Staff Category's real rows are General/OBC/SC/ST - the same reservation-category taxonomy this form's "Caste Category" field already used, confirmed by reading its actual live data rather than assumed from the master's name alone. */
function useMasterOptions(slug: string) {
  const [options, setOptions] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/master-options?slug=${slug}`)
      .then((res) => (res.ok ? res.json() : { rows: [] }))
      .then((data) => {
        if (!cancelled) setOptions((data.rows ?? []).map((r: Record<string, string>) => r.name));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return options;
}

/**
 * Real field set - confirmed against the client's own "Add Staff" screenshot
 * (AMS User Manual p.6): Sanctioned Post, Name, Mobile, Email, Pay Band, Pay
 * Scale, Discipline, Date of Birth, Date of Joining, Permanent/Temporary,
 * Details of allowances, Caste Category, Photo, Resume. Discipline stays a
 * free-text field rather than a dropdown - the source never showed its full
 * option list, so constraining it would mean guessing values.
 */
export function EmployeeDetailsAddForm({
  trail,
  backHref,
}: EmployeeDetailsAddFormProps) {
  const router = useRouter();
  const sanctionedPosts = useMasterOptions("sanctioned-post");
  const payScales = useMasterOptions("pay-scale");
  const jobTypes = useMasterOptions("job-type");
  const casteCategories = useMasterOptions("staff-category");
  const [sanctionedPost, setSanctionedPost] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [payBand, setPayBand] = useState("");
  const [payScale, setPayScale] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [jobType, setJobType] = useState("");
  const [allowances, setAllowances] = useState("");
  const [casteCategory, setCasteCategory] = useState("");
  const [photo, setPhoto] = useState("");
  const [resume, setResume] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!sanctionedPost || !name || !mobile || !discipline || !dateOfBirth || !dateOfJoining || !casteCategory) {
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
          path: "about-kvk/employee/employee-details",
          values: { sanctionedPost, name, mobile, email, payScale, discipline, dateOfBirth, dateOfJoining, jobType, allowances, casteCategory, photo, resume },
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

  return (
    <div>
      <PageHeader backHref={backHref} trail={trail} title="Add Staff" />

      <div className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-lg border border-border bg-card p-5 duration-300">
        <p className="mb-3 text-sm font-semibold text-primary">
          Staff Position
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="sanctioned-post">
              Sanctioned Post <span className="text-destructive">*</span>
            </Label>
            <SimpleSelect
              id="sanctioned-post"
              value={sanctionedPost}
              onValueChange={setSanctionedPost}
              placeholder="Please Select"
              options={sanctionedPosts.map((post) => ({ value: post, label: post }))}
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="staff-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-mobile">
              Mobile <span className="text-destructive">*</span>
            </Label>
            <Input
              id="staff-mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+91 Mobile number"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="staff-email">Email</Label>
            <Input
              id="staff-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-pay-band">Pay Band</Label>
            <Input
              id="staff-pay-band"
              value={payBand}
              onChange={(e) => setPayBand(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-pay-scale">Pay Scale</Label>
            <SimpleSelect
              id="staff-pay-scale"
              value={payScale}
              onValueChange={setPayScale}
              placeholder="Please Select"
              options={payScales.map((scale) => ({ value: scale, label: scale }))}
              className="h-8"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="staff-discipline">
              Discipline <span className="text-destructive">*</span>
            </Label>
            <Input
              id="staff-discipline"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              placeholder="e.g. Agronomy, Horticulture"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-dob">
              Date of Birth <span className="text-destructive">*</span>
            </Label>
            <Input
              id="staff-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-doj">
              Date of Joining <span className="text-destructive">*</span>
            </Label>
            <Input
              id="staff-doj"
              type="date"
              value={dateOfJoining}
              onChange={(e) => setDateOfJoining(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="staff-job-type">Permanent/Temporary</Label>
            <SimpleSelect
              id="staff-job-type"
              value={jobType}
              onValueChange={setJobType}
              placeholder="Please Select"
              options={jobTypes.map((type) => ({ value: type, label: type }))}
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-allowances">Details of allowances</Label>
            <Input
              id="staff-allowances"
              value={allowances}
              onChange={(e) => setAllowances(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-caste">
              Caste Category <span className="text-destructive">*</span>
            </Label>
            <SimpleSelect
              id="staff-caste"
              value={casteCategory}
              onValueChange={setCasteCategory}
              placeholder="Please Select"
              options={casteCategories.map((category) => ({ value: category, label: category }))}
              className="h-8"
            />
          </div>

          <FileUploadField
            column={PHOTO_COLUMN}
            fieldId="staff-photo"
            value={photo}
            onChange={setPhoto}
          />
          <FileUploadField
            column={RESUME_COLUMN}
            fieldId="staff-resume"
            value={resume}
            onChange={setResume}
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
