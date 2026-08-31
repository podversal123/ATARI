"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, type Crumb } from "@/components/layout/page-header";

type EmployeeDetailsAddFormProps = {
  trail: Crumb[];
  backHref: string;
};

/** Real Sanctioned Post options, confirmed from the client's own "Add Staff" dropdown and staff table (AMS User Manual p.6) plus the live AAMS staff export. */
const SANCTIONED_POSTS = [
  "Senior Scientist & Head",
  "SMS (Subject Matter Speacilist)",
  "PA (Programme Assistance)",
  "CP (Computer Programmer)",
  "Farm Manager",
  "Assistant",
  "Stenographer",
  "Driver",
];

/** Confirmed from the same taxonomy used everywhere else in this app for demographic reporting (Technical Achievement Summary). */
const CASTE_CATEGORIES = ["General", "OBC", "SC", "ST"];

const JOB_TYPES = ["Permanent", "Temporary"];

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
          values: { sanctionedPost, name, mobile, email, payScale, discipline, dateOfBirth, dateOfJoining, jobType, allowances, casteCategory },
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
            <select
              id="sanctioned-post"
              value={sanctionedPost}
              onChange={(e) => setSanctionedPost(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none hover:border-ring/60 focus-visible:border-ring"
            >
              <option value="">Please Select</option>
              {SANCTIONED_POSTS.map((post) => (
                <option key={post} value={post}>
                  {post}
                </option>
              ))}
            </select>
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
            <Input
              id="staff-pay-scale"
              value={payScale}
              onChange={(e) => setPayScale(e.target.value)}
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
            <select
              id="staff-job-type"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none hover:border-ring/60 focus-visible:border-ring"
            >
              <option value="">Please Select</option>
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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
            <select
              id="staff-caste"
              value={casteCategory}
              onChange={(e) => setCasteCategory(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none hover:border-ring/60 focus-visible:border-ring"
            >
              <option value="">Please Select</option>
              {CASTE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="staff-photo">
              Photo <span className="text-destructive">*</span>
            </Label>
            <input
              id="staff-photo"
              type="file"
              accept="image/*"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none file:mr-2 file:h-full file:rounded-md file:border-0 file:bg-muted file:px-2 file:text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-resume">Resume</Label>
            <input
              id="staff-resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none file:mr-2 file:h-full file:rounded-md file:border-0 file:bg-muted file:px-2 file:text-xs"
            />
          </div>
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
