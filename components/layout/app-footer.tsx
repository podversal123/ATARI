/**
 * Slim, centered app-wide footer pinned below the scrolling content on every
 * dashboard page. Wording is fixed to the client's reference ("2025 © Atari
 * AMS."); bump the version string here on each release.
 */
export function AppFooter() {
  return (
    <footer className="shrink-0 border-t border-border bg-card px-6 py-2.5 text-center text-xs font-medium text-foreground/75">
      2025 &copy; <span className="font-semibold text-foreground">Atari AMS</span>.
      &nbsp;&middot;&nbsp; Version 1.1
    </footer>
  );
}
