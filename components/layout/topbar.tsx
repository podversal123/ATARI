"use client";

import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearSession, useSession } from "@/lib/session";

/**
 * Fixed top bar shown above every dashboard page: zone title on the left,
 * notifications + current user on the right. The signed-in identity comes
 * from the mock session set at login (lib/session.ts) — real auth (Phase
 * 2/3) replaces that mock with an actual authenticated user, but the shape
 * (role decided once, at login) doesn't change.
 */
export function Topbar() {
  const router = useRouter();
  const session = useSession();
  const isKvk = session.role === "kvk-admin";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <p className="text-lg font-semibold text-primary">AMS - ATARI Zone (IV) Patna</p>

      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label="Notifications"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="size-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" className="flex items-center gap-2 outline-none">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="size-4.5" strokeWidth={1.75} />
                </span>
                <span className="flex items-center gap-1 leading-tight">
                  <span className="text-left">
                    <p className="text-sm font-medium">
                      {isKvk ? (session.kvkName ?? "KVK Admin") : "Super Administrator"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isKvk ? "KVK Admin" : "ATARI Super Admin"}
                    </p>
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </span>
              </button>
            }
          />
          <DropdownMenuContent align="end">
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
    </header>
  );
}
