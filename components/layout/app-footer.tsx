/**
 * Slim, centered app-wide footer pinned below the scrolling content on every
 * dashboard page. Copyright year is intentionally fixed (client-specified
 * text); bump the version string here on each release.
 */
export function AppFooter() {
  return (
    <footer className="shrink-0 border-t border-border bg-card px-6 py-2.5 text-center text-xs font-medium text-foreground/75">
      &copy; 2025 <span className="font-semibold text-foreground">Atari AMS</span>
      &nbsp;&middot;&nbsp; Version 1.1
    </footer>
  );
}
