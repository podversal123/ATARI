"use client";

import { useEffect, useState } from "react";
import { Send, Bell } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { EmptyDataTable } from "@/components/data-table/empty-data-table";
import { SelectKvksDropdown } from "@/components/notifications/select-kvks-dropdown";
import { useSession } from "@/lib/session";
import { KVKS } from "@/lib/rbac";

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  recipient: string;
  from: string;
  sentOn: string;
};

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
 * Real backend (2026-08-29) - Send persists via POST /api/notifications;
 * Received/Sent below are real rows from GET /api/notifications, not a
 * frontend mock. A KVK_USER never sees the compose panel (only Super Admin
 * and KVK Admin can send, per the flow documented above).
 */
export default function NotificationsPage() {
  const session = useSession();
  const isKvk = session.role !== "super-admin";
  const canSend = session.role === "super-admin" || session.role === "kvk-admin";

  const [selectedKvks, setSelectedKvks] = useState<Set<string>>(
    () => new Set(KVKS.map((kvk) => kvk.name)),
  );
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState<NotificationRow[]>([]);
  const [received, setReceived] = useState<NotificationRow[]>([]);

  function loadRows() {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { sent: NotificationRow[]; received: NotificationRow[] } | null) => {
        if (data) {
          setSent(data.sent);
          setReceived(data.received);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadRows();
  }, []);

  async function handleSend() {
    setSendError(null);
    setSending(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          kvkNames: !isKvk ? Array.from(selectedKvks) : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSendError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setTitle("");
      setMessage("");
      loadRows();
    } catch {
      setSendError("Could not reach the server. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <PageHeader
        trail={[{ label: "Notifications" }]}
        title="Notifications"
        icon={Bell}
      />

      {canSend && (
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
          {sendError && (
            <p role="alert" className="mt-2 text-sm font-medium text-destructive">
              {sendError}
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              onClick={handleSend}
              disabled={sending || !title || !message || (!isKvk && selectedKvks.size === 0)}
            >
              <Send className="size-3.5" />
              {sending ? "Sending…" : "Send"}
            </Button>
          </div>
        </div>
      )}

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
          rows={received}
          hideAddNew
          recordPath={isKvk ? undefined : "notifications"}
          recordKind="notification"
          editableColumnKeys={["title", "message"]}
          onMutated={loadRows}
        />
      </div>

      <EmptyDataTable
        title={isKvk ? "Sent to My KVK Users" : "Sent Notifications"}
        icon="notifications"
        columns={SENT_COLUMNS}
        rows={sent}
        hideAddNew
        recordPath={isKvk ? undefined : "notifications"}
        recordKind="notification"
        editableColumnKeys={["title", "message"]}
        onMutated={loadRows}
      />
    </div>
  );
}
