"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { SEARCH_INDEX, KVK_HIDDEN_SLUGS } from "@/lib/navigation";
import { useSession, useSessionReady } from "@/lib/session";

/** The sidebar's "Search... (Ctrl+K)" box - jumps to any page in the app by name. */
export function SidebarSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const sessionReady = useSessionReady();
  /** Fail closed to the smaller index until the real role is known - same rule the sidebar itself uses - so a KVK session never briefly searches into a hidden page. */
  const isSuperAdmin = sessionReady && session.role === "super-admin";

  /** Ctrl+K must not surface pages the sidebar hides for this role (All Masters, Role/User Management for KVK). */
  const searchIndex = useMemo(
    () =>
      isSuperAdmin
        ? SEARCH_INDEX
        : SEARCH_INDEX.filter(
            (item) => !KVK_HIDDEN_SLUGS.has(item.href.split("/")[1] ?? ""),
          ),
    [isSuperAdmin],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchIndex
      .filter((item) => item.label.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, searchIndex]);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-md border border-white/15 bg-black/10 px-3 py-2 text-sm text-white/60 focus-within:border-white/30">
        <Search className="size-4 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search... (Ctrl+K)"
          className="w-full bg-transparent text-white placeholder:text-white/60 outline-none"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute top-full right-0 left-0 z-20 mt-1 max-h-80 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No matching pages.
            </p>
          ) : (
            results.map((result) => (
              <Link
                key={result.href}
                href={result.href}
                onClick={() => {
                  setQuery("");
                  setOpen(false);
                }}
                className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-primary/20"
              >
                <span className="font-medium">{result.label}</span>
                {result.section && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {result.section}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
