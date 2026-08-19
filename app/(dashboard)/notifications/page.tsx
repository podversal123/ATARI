"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";
import { useSession } from "@/lib/session";
import { KVKS } from "@/lib/rbac";

const COLUMNS = [
  { key: "title", label: "Title" },
  { key: "recipient", label: "Recipient" },
  { key: "sentOn", label: "Sent On" },
];

const RECIPIENT_ALL = "all-kvks";

/**
 * Per the client's described flow: Super Admin sends a notification to
 * either all KVKs or one specific KVK; a KVK Admin sends to their own
 * KVK's users only (no cross-KVK visibility). No reference screenshot
 * exists for this compose form, so the layout is a minimal, honest
 * implementation of that stated flow rather than an invented design.
 */
export default function NotificationsPage() {
  const session = useSession();
  const isKvk = session.role === "kvk-admin";

  const [recipient, setRecipient] = useState(isKvk ? "own-users" : RECIPIENT_ALL);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div>
      <PageHeader trail={[{ label: "Notifications" }]} title="Notifications" />

      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold tracking-wide text-primary uppercase">
          Send Notification
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Recipient</label>
            {isKvk ? (
              <Input value={session.kvkName ? `${session.kvkName} Users` : "My KVK Users"} disabled className="mt-1" />
            ) : (
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring"
              >
                <option value={RECIPIENT_ALL}>All KVKs</option>
                {KVKS.map((kvk) => (
                  <option key={kvk.name} value={kvk.name}>
                    {kvk.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" className="mt-1" />
          </div>
        </div>
        <div className="mt-3">
          <label className="text-xs font-medium text-muted-foreground">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            rows={3}
            className="mt-1"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" disabled={!title || !message}>
            <Send className="size-3.5" />
            Send
          </Button>
        </div>
      </div>

      <EmptyDataTable
        title={isKvk ? "Sent to My KVK Users" : "Sent Notifications"}
        columns={COLUMNS}
      />
    </div>
  );
}
