import { Bell, UserCircle } from "lucide-react";

/**
 * Fixed top bar shown above every dashboard page: zone title on the left,
 * notifications + current user on the right. The signed-in user shown here
 * is a placeholder until auth (Step 2 of the build) is wired up.
 */
export function Topbar() {
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
        <div className="flex items-center gap-2">
          <UserCircle className="size-8 text-primary" strokeWidth={1.5} />
          <div className="leading-tight">
            <p className="text-sm font-medium">Super Administrator</p>
            <p className="text-xs text-muted-foreground">ATARI Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
