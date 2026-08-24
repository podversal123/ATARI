"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, type Crumb } from "@/components/layout/page-header";
import { HOST_MASTER_ROWS } from "@/lib/masters";

type ViewKvksAddFormProps = {
  trail: Crumb[];
  backHref: string;
};

/**
 * Real shape: a KVK Address field, then a Host Organization Details block
 * that fills in once a Host is picked. Mobile/E-mail/Host Address now
 * auto-populate from the real contact details in `HOST_MASTER_ROWS` (the
 * client's live AAMS host-organization export); Landline/Fax stay editable
 * but blank, since that export doesn't break phone numbers down that way.
 */
export function ViewKvksAddForm({ trail, backHref }: ViewKvksAddFormProps) {
  const router = useRouter();
  const [kvkAddress, setKvkAddress] = useState("");
  const [hostName, setHostName] = useState("");
  const [mobile, setMobile] = useState("");
  const [landline, setLandline] = useState("");
  const [fax, setFax] = useState("");
  const [email, setEmail] = useState("");
  const [hostAddress, setHostAddress] = useState("");

  const hostSelected = hostName !== "";

  function handleHostChange(name: string) {
    setHostName(name);
    const host = HOST_MASTER_ROWS.find((row) => row.hostName === name);
    setMobile(host?.phone ?? "");
    setEmail(host?.email ?? "");
    setHostAddress(host?.address ?? "");
  }

  return (
    <div>
      <PageHeader backHref={backHref} trail={trail} title="Add View KVKs" />

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="space-y-4">
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

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-sm font-semibold text-primary">
              Host Organization Details
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="host-name">
                Host Organization Name <span className="text-destructive">*</span>
              </Label>
              <select
                id="host-name"
                value={hostName}
                onChange={(e) => handleHostChange(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
              >
                <option value="">Select Host</option>
                {HOST_MASTER_ROWS.map((row) => (
                  <option key={row.hostName} value={row.hostName}>
                    {row.hostName}
                  </option>
                ))}
              </select>
              {!hostSelected && (
                <p className="text-xs text-muted-foreground">
                  Select Host to populate host details
                </p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="host-mobile">Mobile Number</Label>
                <Input
                  id="host-mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={!hostSelected}
                  placeholder="+91"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="host-landline">Landline</Label>
                <Input
                  id="host-landline"
                  value={landline}
                  onChange={(e) => setLandline(e.target.value)}
                  disabled={!hostSelected}
                  placeholder="Enter landline"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="host-fax">Fax</Label>
                <Input
                  id="host-fax"
                  value={fax}
                  onChange={(e) => setFax(e.target.value)}
                  disabled={!hostSelected}
                  placeholder="Enter fax"
                />
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <Label htmlFor="host-email">E-mail</Label>
              <Input
                id="host-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!hostSelected}
                placeholder="Enter email address"
              />
            </div>

            <div className="mt-4 space-y-1.5">
              <Label htmlFor="host-address">Host Address</Label>
              <Textarea
                id="host-address"
                value={hostAddress}
                onChange={(e) => setHostAddress(e.target.value)}
                disabled={!hostSelected}
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
