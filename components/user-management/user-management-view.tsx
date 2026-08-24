"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Plus, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * User Management screen. No accounts exist yet in this phase (no backend),
 * so the table always renders its real empty state - same "static/mock"
 * convention as the rest of the app. Create User is a dedicated page (same
 * pattern as Form Management's Add New) rather than a popup, since it's a
 * 7-field form; Reset Password stays a small popup. Edit/Delete per-row
 * actions wire up once real accounts exist (Phase 3).
 */
export function UserManagementView() {
  const [search, setSearch] = useState("");

  const [resetOpen, setResetOpen] = useState(false);
  const [resetForm, setResetForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetError, setResetError] = useState<string | null>(null);

  function openReset() {
    setResetForm({ email: "", newPassword: "", confirmPassword: "" });
    setResetError(null);
    setResetOpen(true);
  }

  function submitReset() {
    if (!resetForm.email.trim()) {
      setResetError("User email is required.");
      return;
    }
    if (
      !resetForm.newPassword ||
      resetForm.newPassword !== resetForm.confirmPassword
    ) {
      setResetError("New password and confirm password do not match.");
      return;
    }
    setResetOpen(false);
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email..."
            className="w-72 pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openReset}>
            <KeyRound className="size-3.5" />
            Reset User Password
          </Button>
          <Link
            href="/user-management/create"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <Plus className="size-3.5" />
            Create User
          </Link>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <TableHead className="px-4 py-3">Name</TableHead>
            <TableHead className="px-4 py-3">Email</TableHead>
            <TableHead className="px-4 py-3">Phone</TableHead>
            <TableHead className="px-4 py-3">Role</TableHead>
            <TableHead className="px-4 py-3">Created</TableHead>
            <TableHead className="px-4 py-3">Last Login</TableHead>
            <TableHead className="w-20 px-4 py-3 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={7}
              className="px-4 py-16 text-center text-muted-foreground"
            >
              No users found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>Showing 0 to 0 of 0 entries</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      {/* Reset User Password - admin-mediated, since there's no email-based
          self-reset per the client's spec. Only valid for a user who hasn't
          already set their own password via Change Password; once they have,
          this must stop working for that account (a real per-user flag the
          backend needs to track - not fakeable without persistence yet). */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Only works before the user has set their own password via Change
              Password - after that, only they can change it.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="reset-email">User Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="name@atariams.org"
                value={resetForm.email}
                onChange={(event) =>
                  setResetForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reset-new-password">New Password</Label>
              <Input
                id="reset-new-password"
                type="password"
                autoComplete="new-password"
                value={resetForm.newPassword}
                onChange={(event) =>
                  setResetForm((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Must contain uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reset-confirm-password">
                Confirm New Password
              </Label>
              <Input
                id="reset-confirm-password"
                type="password"
                autoComplete="new-password"
                value={resetForm.confirmPassword}
                onChange={(event) =>
                  setResetForm((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
              />
            </div>

            {resetError && (
              <p className="text-sm text-destructive">{resetError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReset}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
