"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, ChevronDown, KeyRound, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearSession, useSession } from "@/lib/session";
import { ChangePasswordDialog } from "./change-password-dialog";

/**
 * Fixed top bar shown above every dashboard page: zone title on the left,
 * notifications + current user on the right. The signed-in identity comes
 * from the mock session set at login (lib/session.ts) - real auth (Phase
 * 2/3) replaces that mock with an actual authenticated user, but the shape
 * (role decided once, at login) doesn't change.
 */
export function Topbar() {
  const router = useRouter();
  const session = useSession();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const displayName =
    session.role === "super-admin"
      ? "Super Administrator"
      : (session.kvkName ?? "KVK Admin");
  const roleLabel =
    session.role === "super-admin"
      ? "ATARI Super Admin"
      : session.role === "kvk-admin"
        ? "KVK Admin"
        : "KVK User";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <p className="text-xl font-semibold text-primary">
        AMS - ATARI Zone (IV) Patna
      </p>

      <div className="flex items-center gap-5">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Notifications"
                className="text-muted-foreground transition-colors outline-none hover:text-foreground"
              >
                <Bell className="size-5" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-72 min-w-0">
            <p className="px-1.5 py-1.5 text-sm font-medium text-foreground">Notifications</p>
            <DropdownMenuSeparator />
            <p className="px-1.5 py-3 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/notifications")}>
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 outline-none"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="size-4.5" strokeWidth={1.75} />
                </span>
                <span className="flex items-center gap-1 leading-tight">
                  <span className="text-left">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{roleLabel}</p>
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </span>
              </button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
              <KeyRound className="size-3.5" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                clearSession();
                router.push("/login");
              }}
            >
              <LogOut className="size-3.5" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </header>
  );
}
