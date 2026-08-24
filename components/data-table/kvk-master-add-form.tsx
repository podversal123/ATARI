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
  ZONE_MASTER_ROWS,
  INSTITUTE_MASTER_ROWS,
  HOST_MASTER_ROWS,
} from "@/lib/masters";
import { STATES, DISTRICTS, JHARKHAND_DISTRICTS } from "@/lib/rbac";
import { hostOrgsForState } from "@/lib/reports";

type KvkMasterAddFormProps = {
  trail: Crumb[];
  backHref: string;
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
export function KvkMasterAddForm({ trail, backHref }: KvkMasterAddFormProps) {
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
      <PageHeader backHref={backHref} trail={trail} title="Create KVK" />

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="mb-3 text-sm font-semibold text-primary">
          KVK General Information
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="kvk-name">
              Name of KVK <span className="text-destructive">*</span>
            </Label>
            <Input
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
            <select
              id="kvk-sanction-year"
              value={sanctionYear}
              onChange={(e) => setSanctionYear(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
            >
              <option value="">Select year</option>
              {SANCTION_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kvk-email">
              E-mail <span className="text-destructive">*</span>
            </Label>
            <Input
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
              id="kvk-mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit mobile"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kvk-fax">Fax</Label>
            <Input
              id="kvk-fax"
              value={fax}
              onChange={(e) => setFax(e.target.value)}
              placeholder="Enter fax"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kvk-landline">Landline</Label>
            <Input
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
            <select
              id="kvk-zone"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
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
            <Label htmlFor="kvk-state">
              State <span className="text-destructive">*</span>
            </Label>
            <select
              id="kvk-state"
              value={state}
              disabled={!zone}
              onChange={(e) => {
                setState(e.target.value);
                setDistrict("");
                setHost("");
              }}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select State</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kvk-district">
              District <span className="text-destructive">*</span>
            </Label>
            <select
              id="kvk-district"
              value={district}
              disabled={!state}
              onChange={(e) => setDistrict(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select District</option>
              {districtOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kvk-institute">
              Institute <span className="text-destructive">*</span>
            </Label>
            <select
              id="kvk-institute"
              value={institute}
              onChange={(e) => setInstitute(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
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
            <Label htmlFor="kvk-host">
              Host <span className="text-destructive">*</span>
            </Label>
            <select
              id="kvk-host"
              value={host}
              disabled={!state}
              onChange={(e) => handleHostChange(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Host</option>
              {hostOptions.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <Label htmlFor="kvk-host-name">
                Host Organization Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="kvk-host-name"
                value={host}
                disabled
                placeholder="Populated from host (host organisation)"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kvk-host-mobile">Mobile Number</Label>
              <Input
                id="kvk-host-mobile"
                value={hostMobile}
                disabled={!host}
                placeholder="+91"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kvk-host-landline">Landline</Label>
              <Input
                id="kvk-host-landline"
                value={hostLandline}
                disabled={!host}
                placeholder="Enter landline"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kvk-host-fax">Fax</Label>
              <Input
                id="kvk-host-fax"
                value={hostFax}
                disabled={!host}
                placeholder="Enter fax"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kvk-host-email">E-mail</Label>
              <Input
                id="kvk-host-email"
                value={hostEmail}
                disabled={!host}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
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

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => router.push(backHref)}>
            Cancel
          </Button>
          <Button onClick={() => router.push(backHref)}>
            <Save className="size-3.5" />
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
