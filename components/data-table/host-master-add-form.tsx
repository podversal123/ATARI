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
  const cascade = useCascadeOptions(true);

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
      {/* Heading slides in from the left as the card (below) slides in from the right (client direction, 2026-09-03) - the two converge toward the middle instead of both entering the same way. */}
      <div className="animate-in fade-in-0 slide-in-from-left-8 ease-out duration-300">
        <PageHeader backHref={backHref} trail={trail} title="Create Host" />
      </div>

      {/* Slide-in-from-the-right entrance (client direction, 2026-09-02) - same motion as every other Add/Edit page's own entrance now. */}
      <div className="animate-in fade-in-0 slide-in-from-right-8 ease-out rounded-lg border border-border bg-card p-6 duration-300">
        {/*
          Compact auto-fit field grid (client direction, 2026-09-02, same
          system now used by every generic All Masters Add form - see
          AddLeafPage/NavLeaf.compactFields) - each field gets a natural
          240-320px width and the grid wraps as many as fit per row on its
          own, instead of the old hand-curated one-field-per-row /
          two-per-row groupings (which predated that direction and were
          never updated to match it). Host Address is the one field that
          still spans the full row (`col-[1/-1]`, works regardless of how
          many columns the auto-fit grid currently has), since a textarea
          reads badly squeezed into a 320px column.
        */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,320px))] gap-5">
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
            <SimpleSelect
              id="host-zone"
              value={zone}
              onValueChange={setZone}
              placeholder="Select"
              options={cascade.zoneOptions.map((z) => ({ value: z, label: z }))}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="host-state">
              State <span className="text-destructive">*</span>
            </Label>
            <SimpleSelect
              id="host-state"
              value={state}
              disabled={!zone}
              onValueChange={(v) => {
                setState(v);
                setDistrict("");
              }}
              placeholder={zone ? "Select State" : "Select Zone first"}
              options={cascade.statesForZone(zone).map((s) => ({ value: s, label: s }))}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="host-district">
              District <span className="text-destructive">*</span>
            </Label>
            <SimpleSelect
              id="host-district"
              value={district}
              disabled={!state}
              onValueChange={setDistrict}
              placeholder={state ? "Select District" : "Select State first"}
              options={cascade.districtsForState(state).map((d) => ({ value: d, label: d }))}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="host-institute">
              Institute <span className="text-destructive">*</span>
            </Label>
            <SimpleSelect
              id="host-institute"
              value={institute}
              onValueChange={setInstitute}
              placeholder="Select Institute"
              options={cascade.instituteOptions.map((i) => ({ value: i, label: i }))}
              className="h-10"
            />
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

          <div className="col-[1/-1] space-y-1.5">
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
