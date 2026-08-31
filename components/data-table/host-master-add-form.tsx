"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { ZONE_MASTER_ROWS, INSTITUTE_MASTER_ROWS } from "@/lib/masters";
import { STATES, DISTRICTS, JHARKHAND_DISTRICTS } from "@/lib/rbac";

type HostMasterAddFormProps = {
  trail: Crumb[];
  backHref: string;
};

/**
 * Real field set + Zone->State->District cascade confirmed against the
 * client's own "Create Host" screenshots from atariams.org (2026-08-24):
 * Host Name, Zone, State, District, Institute, Mobile Number, Landline,
 * Fax, E-mail, Host Address. Replaces the earlier plain field list (which
 * only had Host Name/Address/Phone/Email, no location cascade) generated
 * from the generic per-column form.
 */
export function HostMasterAddForm({ trail, backHref }: HostMasterAddFormProps) {
  const router = useRouter();
  const [hostName, setHostName] = useState("");
  const [directorExtension, setDirectorExtension] = useState("");
  const [zone, setZone] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [institute, setInstitute] = useState("");
  const [mobile, setMobile] = useState("");
  const [landline, setLandline] = useState("");
  const [fax, setFax] = useState("");
  const [email, setEmail] = useState("");
  const [hostAddress, setHostAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const districtOptions =
    state === "Bihar" ? DISTRICTS : state === "Jharkhand" ? JHARKHAND_DISTRICTS : [];

  async function submit() {
    setError(null);
    if (!hostName || !zone || !state || !district || !institute) {
      setError("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/host-orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName, directorExtension, mobile, landline, fax, email, hostAddress }),
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
      <PageHeader backHref={backHref} trail={trail} title="Create Host" />

      {/* Fade/slide-in on mount (client report, 2026-08-31) - same animate-in vocabulary the app's own dialogs/dropdowns already use. */}
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-lg border border-border bg-card p-6 duration-300">
        {/*
          Real reference layout (client screenshots, 2026-08-31): Host
          Name/Zone/State/District/Institute each get their own full-width
          row (never packed side by side), then Mobile+Landline and
          Fax+E-mail pair up two-per-row, then Host Address spans full
          width again. Each row group is its own grid rather than relying
          on a single auto-flowing grid, so the pairing can't drift if a
          field is ever added/removed.
        */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="host-name">
              Host Name <span className="text-destructive">*</span>
            </Label>
            <Input
              className="h-10"
              id="host-name"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Enter host name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="host-zone">
              Zone <span className="text-destructive">*</span>
            </Label>
            <select
              id="host-zone"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none hover:border-ring/60 focus-visible:border-ring"
            >
              <option value="">Select</option>
              {ZONE_MASTER_ROWS.map((row) => (
                <option key={row.zoneName} value={row.zoneName}>
                  {row.zoneName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="host-state">
              State <span className="text-destructive">*</span>
            </Label>
            <select
              id="host-state"
              value={state}
              disabled={!zone}
              onChange={(e) => {
                setState(e.target.value);
                setDistrict("");
              }}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none hover:border-ring/60 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input"
            >
              <option value="">{zone ? "Select State" : "Select Zone first"}</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="host-district">
              District <span className="text-destructive">*</span>
            </Label>
            <select
              id="host-district"
              value={district}
              disabled={!state}
              onChange={(e) => setDistrict(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none hover:border-ring/60 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input"
            >
              <option value="">{state ? "Select District" : "Select State first"}</option>
              {districtOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="host-institute">
              Institute <span className="text-destructive">*</span>
            </Label>
            <select
              id="host-institute"
              value={institute}
              onChange={(e) => setInstitute(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none hover:border-ring/60 focus-visible:border-ring"
            >
              <option value="">Select Institute</option>
              {INSTITUTE_MASTER_ROWS.map((row) => (
                <option key={row.instituteName} value={row.instituteName}>
                  {row.instituteName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="host-director-extension">Director Extension</Label>
            <Input
              className="h-10"
              id="host-director-extension"
              value={directorExtension}
              onChange={(e) => setDirectorExtension(e.target.value)}
              placeholder="Enter director extension name"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="host-mobile">Mobile Number</Label>
              <Input
                className="h-10"
                id="host-mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="host-landline">Landline</Label>
              <Input
                className="h-10"
                id="host-landline"
                value={landline}
                onChange={(e) => setLandline(e.target.value)}
                placeholder="Enter landline number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="host-fax">Fax</Label>
              <Input
                className="h-10"
                id="host-fax"
                value={fax}
                onChange={(e) => setFax(e.target.value)}
                placeholder="Enter fax number"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="host-email">E-mail</Label>
              <Input
                className="h-10"
                id="host-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="host-address">Host Address</Label>
            <Textarea
              id="host-address"
              value={hostAddress}
              onChange={(e) => setHostAddress(e.target.value)}
              placeholder="Enter host address"
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
