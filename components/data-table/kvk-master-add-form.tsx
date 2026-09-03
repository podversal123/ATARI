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
import { useCascadeOptions } from "./use-cascade-options";

type KvkMasterAddFormProps = {
  trail: Crumb[];
  backHref: string;
  /** "About KVK -> View KVKs" reaches this exact same real form under a different title ("Create KVKs" - client direction, 2026-09-03: "Create View KVKs" read strangely with "View" in the middle) - see ViewKvksAddForm's re-export below. */
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
  const cascade = useCascadeOptions(true);

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

  const districtOptions = cascade.districtsForState(state);
  const hostOptions = state ? cascade.hostOrgsForState(state) : [];

  function handleHostChange(name: string) {
    setHost(name);
    const row = cascade.hostOrgDetails.find((r) => r.hostName === name);
    setHostMobile(row?.phone ?? "");
    setHostEmail(row?.email ?? "");
    setHostAddress(row?.address ?? "");
    setHostLandline("");
    setHostFax("");
  }

  return (
    <div>
      {/* Heading slides in from the left as the card (below) slides in from the right (client direction, 2026-09-03) - the two converge toward the middle instead of both entering the same way. */}
      <div className="animate-in fade-in-0 slide-in-from-left-8 ease-out duration-300">
        <PageHeader backHref={backHref} trail={trail} title={title} />
      </div>

      {/* Slide-in-from-the-right entrance (client direction, 2026-09-02) - same motion as every other Add/Edit page's own entrance now. */}
      <div className="animate-in fade-in-0 slide-in-from-right-8 ease-out rounded-lg border border-border bg-card p-6 duration-300">
        <p className="mb-3 text-lg font-semibold text-primary">
          KVK General Information
        </p>
        {/*
          Compact auto-fit field grid (client direction, 2026-09-02, same
          system now used by every generic All Masters Add form - see
          AddLeafPage/NavLeaf.compactFields) - each field gets a natural
          240-320px width and the grid wraps as many as fit per row on its
          own, instead of the old hand-curated Name+Year / E-mail+Mobile /
          Fax+Landline / Zone+State+District / Institute+Host row groupings
          (which predated that direction and were never updated to match
          it). KVK Address is the one field that still spans the full row
          (`col-[1/-1]`, works regardless of how many columns the auto-fit
          grid currently has), since a textarea reads badly squeezed into a
          320px column.
        */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,320px))] gap-5">
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

          <div className="space-y-1.5">
            <Label htmlFor="kvk-zone">
              Zone <span className="text-destructive">*</span>
            </Label>
            <SimpleSelect
              id="kvk-zone"
              value={zone}
              onValueChange={setZone}
              placeholder="Select"
              options={cascade.zoneOptions.map((z) => ({ value: z, label: z }))}
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
              options={cascade.statesForZone(zone).map((s) => ({ value: s, label: s }))}
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

          <div className="space-y-1.5">
            <Label htmlFor="kvk-institute">
              Institute <span className="text-destructive">*</span>
            </Label>
            <SimpleSelect
              id="kvk-institute"
              value={institute}
              onValueChange={setInstitute}
              placeholder="Select Institute"
              options={cascade.instituteOptions.map((i) => ({ value: i, label: i }))}
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

          <div className="col-[1/-1] space-y-1.5">
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
          <p className="mb-3 text-lg font-semibold text-primary">
            Host Organization Details
          </p>
          {/* Same compact auto-fit field grid as the section above - see that section's comment. */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,320px))] gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="kvk-host-name">
                Host Organization Name <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-10"
                id="kvk-host-name"
                value={host}
                disabled
                readOnly
                placeholder="Populated from host (host organisation)"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kvk-host-mobile">Mobile Number</Label>
              <Input
                className="h-10"
                id="kvk-host-mobile"
                value={hostMobile}
                disabled={!host}
                readOnly
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
                readOnly
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
                readOnly
                placeholder="Enter fax"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kvk-host-email">E-mail</Label>
              <Input
                className="h-10"
                id="kvk-host-email"
                value={hostEmail}
                disabled={!host}
                readOnly
                placeholder="Enter email address"
              />
            </div>

            <div className="col-[1/-1] space-y-1.5">
              <Label htmlFor="kvk-host-address">Host Address</Label>
              <Textarea
                id="kvk-host-address"
                value={hostAddress}
                disabled={!host}
                readOnly
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
