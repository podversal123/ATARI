"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleSelect } from "@/components/ui/simple-select";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import {
  ZONE_MASTER_ROWS,
  INSTITUTE_MASTER_ROWS,
  HOST_MASTER_ROWS,
} from "@/lib/masters";
import { STATES, DISTRICTS, JHARKHAND_DISTRICTS } from "@/lib/rbac";
import { hostOrgsForState } from "@/lib/reports";

type KvkMasterAddFormProps = {
  trail: Crumb[];
  backHref: string;
  /** "About KVK -> View KVKs" reaches this exact same real form under a different title ("Create View KVKs" - confirmed identical field-for-field against the reference, 2026-08-28) - see ViewKvksAddForm's re-export below. */
  title?: string;
};

const SANCTION_YEARS = Array.from({ length: 50 }, (_, index) =>
  String(new Date().getFullYear() - index),
);

/**
 * Real 2-section field set confirmed against the client's own "Create KVK"
 * screenshots from atariams.org (2026-08-24): "KVK General Information"
 * (Name of KVK, Year of Sanction, E-mail, Mobile Number, Fax, Landline,
 * Zone->State->District cascade, Institute, Host, KVK Address), then a
 * "Host Organization Details" section that auto-populates (Mobile/Landline/
 * Fax/E-mail/Host Address are shown as "Populated from host" in the real
 * form) once a Host is picked - reusing the real contact details now in
 * HOST_MASTER_ROWS, same approach as ViewKvksAddForm.
 */
export function KvkMasterAddForm({ trail, backHref, title = "Create KVK" }: KvkMasterAddFormProps) {
  const router = useRouter();
  const [kvkName, setKvkName] = useState("");
  const [sanctionYear, setSanctionYear] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [fax, setFax] = useState("");
  const [landline, setLandline] = useState("");
  const [zone, setZone] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [institute, setInstitute] = useState("");
  const [host, setHost] = useState("");
  const [kvkAddress, setKvkAddress] = useState("");

  const [hostMobile, setHostMobile] = useState("");
  const [hostLandline, setHostLandline] = useState("");
  const [hostFax, setHostFax] = useState("");
  const [hostEmail, setHostEmail] = useState("");
  const [hostAddress, setHostAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setError(null);
    if (!kvkName || !sanctionYear || !email || !mobile || !state || !district || !institute || !host || !kvkAddress) {
      setError("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/kvks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: kvkName,
          sanctionYear,
          email,
          mobile,
          fax,
          stateName: state,
          districtName: district,
          instituteName: institute,
          hostOrgName: host,
          address: kvkAddress,
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

  const districtOptions =
    state === "Bihar" ? DISTRICTS : state === "Jharkhand" ? JHARKHAND_DISTRICTS : [];
  const hostOptions = state ? hostOrgsForState(state) : [];

  function handleHostChange(name: string) {
    setHost(name);
    const row = HOST_MASTER_ROWS.find((r) => r.hostName === name);
    setHostMobile(row?.phone ?? "");
    setHostEmail(row?.email ?? "");
    setHostAddress(row?.address ?? "");
    setHostLandline("");
    setHostFax("");
  }

  return (
    <div>
      <PageHeader backHref={backHref} trail={trail} title={title} />

      {/* Fade/slide-in on mount (client report, 2026-08-31) - same animate-in vocabulary the app's own dialogs/dropdowns already use. */}
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-lg border border-border bg-card p-6 duration-300">
        <p className="mb-3 text-sm font-semibold text-primary">
          KVK General Information
        </p>
        {/*
          Real reference row groupings (client screenshots, 2026-08-31):
          Name+Year, E-mail+Mobile, Fax+Landline, Zone+State+District,
          Institute+Host, then KVK Address alone full width - each its own
          grid rather than one big auto-flowing grid, so the pairing can't
          drift if a field is ever added/removed.
        */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="kvk-name">
                Name of KVK <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-10"
                id="kvk-name"
                value={kvkName}
                onChange={(e) => setKvkName(e.target.value)}
                placeholder="Enter KVK name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kvk-sanction-year">
                Year of Sanction <span className="text-destructive">*</span>
              </Label>
              <SimpleSelect
                id="kvk-sanction-year"
                value={sanctionYear}
                onValueChange={setSanctionYear}
                placeholder="Select year"
                options={SANCTION_YEARS.map((year) => ({ value: year, label: year }))}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="kvk-email">
                E-mail <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-10"
                id="kvk-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kvk-mobile">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-10"
                id="kvk-mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="kvk-fax">Fax</Label>
              <Input
                className="h-10"
                id="kvk-fax"
                value={fax}
                onChange={(e) => setFax(e.target.value)}
                placeholder="Enter fax"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kvk-landline">Landline</Label>
              <Input
                className="h-10"
                id="kvk-landline"
                value={landline}
                onChange={(e) => setLandline(e.target.value)}
                placeholder="Enter landline"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="kvk-zone">
                Zone <span className="text-destructive">*</span>
              </Label>
              <SimpleSelect
                id="kvk-zone"
                value={zone}
                onValueChange={setZone}
                placeholder="Select"
                options={ZONE_MASTER_ROWS.map((row) => ({ value: row.zoneName, label: row.zoneName }))}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kvk-state">
                State <span className="text-destructive">*</span>
              </Label>
              <SimpleSelect
                id="kvk-state"
                value={state}
                disabled={!zone}
                onValueChange={(v) => {
                  setState(v);
                  setDistrict("");
                  setHost("");
                }}
                placeholder="Select State"
                options={STATES.map((s) => ({ value: s, label: s }))}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kvk-district">
                District <span className="text-destructive">*</span>
              </Label>
              <SimpleSelect
                id="kvk-district"
                value={district}
                disabled={!state}
                onValueChange={setDistrict}
                placeholder="Select District"
                options={districtOptions.map((d) => ({ value: d, label: d }))}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="kvk-institute">
                Institute <span className="text-destructive">*</span>
              </Label>
              <SimpleSelect
                id="kvk-institute"
                value={institute}
                onValueChange={setInstitute}
                placeholder="Select Institute"
                options={INSTITUTE_MASTER_ROWS.map((row) => ({ value: row.instituteName, label: row.instituteName }))}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kvk-host">
                Host <span className="text-destructive">*</span>
              </Label>
              <SimpleSelect
                id="kvk-host"
                value={host}
                disabled={!state}
                onValueChange={handleHostChange}
                placeholder="Select Host"
                options={hostOptions.map((h) => ({ value: h, label: h }))}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kvk-address">
              KVK Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="kvk-address"
              value={kvkAddress}
              onChange={(e) => setKvkAddress(e.target.value)}
              placeholder="Enter complete address"
            />
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-3 text-sm font-semibold text-primary">
            Host Organization Details
          </p>
          {/*
            Real reference row groupings for this section too: Host
            Organization Name alone, then Mobile+Landline+Fax three-per-row,
            then E-mail alone, then Host Address alone (client screenshots,
            2026-08-31).
          */}
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="kvk-host-name">
                Host Organization Name <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-10"
                id="kvk-host-name"
                value={host}
                disabled
                placeholder="Populated from host (host organisation)"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="kvk-host-mobile">Mobile Number</Label>
                <Input
                  className="h-10"
                  id="kvk-host-mobile"
                  value={hostMobile}
                  disabled={!host}
                  placeholder="+91"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kvk-host-landline">Landline</Label>
                <Input
                  className="h-10"
                  id="kvk-host-landline"
                  value={hostLandline}
                  disabled={!host}
                  placeholder="Enter landline"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kvk-host-fax">Fax</Label>
                <Input
                  className="h-10"
                  id="kvk-host-fax"
                  value={hostFax}
                  disabled={!host}
                  placeholder="Enter fax"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kvk-host-email">E-mail</Label>
              <Input
                className="h-10"
                id="kvk-host-email"
                value={hostEmail}
                disabled={!host}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kvk-host-address">Host Address</Label>
              <Textarea
                id="kvk-host-address"
                value={hostAddress}
                disabled={!host}
                placeholder="Enter complete address"
              />
            </div>
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
