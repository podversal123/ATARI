"use client";

import { useSyncExternalStore } from "react";

export type SessionRole = "super-admin" | "kvk-admin";

export type Session = {
  role: SessionRole;
  kvkName?: string;
};

const DEFAULT_SESSION: Session = { role: "super-admin" };
const STORAGE_KEY = "atari-ams-session";

/**
 * Real login/RBAC doesn't exist yet (Phase 2/3 — see project RBAC spec),
 * but the *shape* of the real flow is already known: one login page, role
 * decided once at login, never switched from inside the app. This mock
 * keeps that shape — resolveSessionFromUsername() runs only on the login
 * form, and every other page just reads whatever role was decided there.
 * There is no real backend yet, so this offers no actual security (anyone
 * could edit localStorage), but it isn't meant to — it exists so the real
 * per-role UI differences (sidebar, Reports screen) can be reviewed now.
 */
export function resolveSessionFromUsername(username: string): Session {
  const normalized = username.trim().toLowerCase();
  const match = normalized.match(/^kvk\s*([a-z]+)/);
  if (match) {
    const name = match[1];
    return { role: "kvk-admin", kvkName: `KVK ${name.charAt(0).toUpperCase()}${name.slice(1)}` };
  }
  return { role: "super-admin" };
}

export function persistSession(session: Session) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("atari-ams-session-change"));
}

export function clearSession() {
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("atari-ams-session-change"));
}

/**
 * sessionStorage, not localStorage — deliberately per-tab, not shared
 * across the whole browser. Multiple people can share one machine/browser
 * (e.g. a Super Admin's tab open next to someone else testing a KVK login
 * in another tab); localStorage would leak one tab's login into every
 * other open tab the instant it changed, silently "logging out" whoever
 * else was mid-session elsewhere. sessionStorage keeps each tab isolated.
 */
function subscribe(callback: () => void) {
  window.addEventListener("atari-ams-session-change", callback);
  return () => window.removeEventListener("atari-ams-session-change", callback);
}

let cachedRaw: string | null = null;
let cachedSnapshot: Session = DEFAULT_SESSION;

/**
 * useSyncExternalStore requires getSnapshot to return a stable (Object.is-equal)
 * reference when nothing changed. Re-parsing sessionStorage on every call would
 * hand back a new object each render, so React would treat that as a store
 * change every time and re-render forever. Caching the parsed value against
 * the raw string it came from keeps the reference stable across calls.
 */
function getSnapshot(): Session {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;

  cachedRaw = raw;
  if (!raw) {
    cachedSnapshot = DEFAULT_SESSION;
    return cachedSnapshot;
  }
  try {
    cachedSnapshot = JSON.parse(raw) as Session;
  } catch {
    cachedSnapshot = DEFAULT_SESSION;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): Session {
  return DEFAULT_SESSION;
}

/** Reads the mock session set at login — same value everywhere, no provider needed (backed by localStorage via useSyncExternalStore). */
export function useSession(): Session {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
