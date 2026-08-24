"use client";

import { useState } from "react";
import { Send, Bell } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";
import { SelectKvksDropdown } from "@/components/notifications/select-kvks-dropdown";
import { useSession } from "@/lib/session";
import { KVKS } from "@/lib/rbac";

const SENT_COLUMNS = [
  { key: "title", label: "Title" },
  { key: "message", label: "Message" },
  { key: "recipient", label: "Recipient" },
  { key: "sentOn", label: "Sent On" },
];

const RECEIVED_COLUMNS = [
  { key: "title", label: "Title" },
  { key: "message", label: "Message" },
  { key: "from", label: "From" },
  { key: "sentOn", label: "Sent On" },
];

/**
 * Per the client's described flow: Super Admin sends a notification to
 * either all KVKs or one specific KVK; a KVK Admin sends to their own
 * KVK's users only (no cross-KVK visibility). A KVK Admin's sends should
 * also surface to the Super Admin for oversight. No the reference
 * exists for this compose form, so the layout is a minimal, honest
 * implementation of that stated flow rather than an invented design.
 *
 * Send/receive here are UI-only placeholders - actual persistence and
 * delivery come from the backend, not a frontend mock.
 */
export default function NotificationsPage() {
  const session = useSession();
  const isKvk = session.role !== "super-admin";

  const [selectedKvks, setSelectedKvks] = useState<Set<string>>(
    () => new Set(KVKS.map((kvk) => kvk.name)),
  );
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div>
      <PageHeader
        trail={[{ label: "Notifications" }]}
        title="Notifications"
        icon={Bell}
      />

      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold tracking-wide text-primary uppercase">
          Send Notification
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Recipient
            </label>
            {isKvk ? (
              <Input
                value={
                  session.kvkName ? `${session.kvkName} Users` : "My KVK Users"
                }
                disabled
                className="mt-1"
              />
            ) : (
              <SelectKvksDropdown
                selected={selectedKvks}
                onChange={setSelectedKvks}
              />
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="text-xs font-medium text-muted-foreground">
            Message
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            rows={3}
            className="mt-1"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            disabled={!title || !message || (!isKvk && selectedKvks.size === 0)}
          >
            <Send className="size-3.5" />
            Send
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <EmptyDataTable
          title="Received Notifications"
          icon="notifications"
          subtitle={
            isKvk
              ? "Notifications sent to your KVK"
              : "Notifications sent out by KVK Admins to their users"
          }
          columns={RECEIVED_COLUMNS}
          hideAddNew
        />
      </div>

      <EmptyDataTable
        title={isKvk ? "Sent to My KVK Users" : "Sent Notifications"}
        icon="notifications"
        columns={SENT_COLUMNS}
        hideAddNew
      />
    </div>
  );
}
