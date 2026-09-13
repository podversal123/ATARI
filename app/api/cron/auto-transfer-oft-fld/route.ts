import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Automatic version of /api/leaf-record/transfer's own manual "Transfer"
 * action (client spec, "Pointers for super admin 24 aug.pdf" - the same
 * state machine that route already implements by hand: the original row
 * stays visible under its real year marked Transferred, a new Ongoing copy
 * opens under reportingYear+1). Client direction, 2026-09-13: an Ongoing
 * OFT/FLD must carry forward on its own once its reporting year is in the
 * past, without a KVK Admin having to click Transfer themselves - this
 * route is that automation, meant to run on a schedule (see vercel.json's
 * cron entry) rather than from a button.
 *
 * Only ever advances a record by exactly one year per run (reportingYear ->
 * reportingYear + 1), same as the manual action - never jumps straight to
 * the current year - so a trial left Ongoing for several years catches up
 * one year per run instead of silently skipping the years in between.
 * Naturally idempotent: a transferred row's status is no longer ONGOING, so
 * a record already processed can never be selected again, on this run or a
 * later one - safe to run as often as the schedule likes.
 *
 * Real incident, 2026-09-13: an early version had no batch limit at all and
 * processed every stale-Ongoing row across the whole zone in one request -
 * one manual test run took 4.3 minutes for ~900 rows (this DB's real scale
 * is in the hundreds per model), which would time out a real Vercel
 * invocation outright. BATCH_LIMIT caps how many rows each model processes
 * per run; a backlog bigger than that just needs a few more days of the
 * same daily cron to fully catch up - never a reason to raise the limit
 * instead of letting it run again.
 */
const BATCH_LIMIT = 25;

async function transferStaleOngoing(currentYear: number) {
  let oftDone = 0;
  let fldDone = 0;

  const staleOfts = await prisma.oft.findMany({
    where: { status: "ONGOING", reportingYear: { lt: currentYear } },
    take: BATCH_LIMIT,
  });
  for (const original of staleOfts) {
    const { id, reportingYear, status: _status, createdAt: _c, updatedAt: _u, ...rest } = original;
    await prisma.$transaction([
      prisma.oft.update({ where: { id }, data: { status: "TRANSFERRED" } }),
      prisma.oft.create({ data: { ...rest, reportingYear: reportingYear + 1, status: "ONGOING" } }),
    ]);
    oftDone++;
  }

  const staleFlds = await prisma.fld.findMany({
    where: { status: "ONGOING", reportingYear: { lt: currentYear } },
    take: BATCH_LIMIT,
  });
  for (const original of staleFlds) {
    const { id, reportingYear, status: _status, createdAt: _c, updatedAt: _u, ...rest } = original;
    await prisma.$transaction([
      prisma.fld.update({ where: { id }, data: { status: "TRANSFERRED" } }),
      prisma.fld.create({ data: { ...rest, reportingYear: reportingYear + 1, status: "ONGOING" } }),
    ]);
    fldDone++;
  }

  // Remaining backlog after this batch, so it's visible in the response
  // whether the next scheduled run still has catching up to do.
  const [oftRemaining, fldRemaining] = await Promise.all([
    prisma.oft.count({ where: { status: "ONGOING", reportingYear: { lt: currentYear } } }),
    prisma.fld.count({ where: { status: "ONGOING", reportingYear: { lt: currentYear } } }),
  ]);

  return { oftTransferred: oftDone, fldTransferred: fldDone, oftRemaining, fldRemaining };
}

export async function GET(request: Request) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` on the real
  // scheduled call (see vercel.json) - this is the standard way to keep a
  // cron route from being triggered by anyone who finds the URL. Only
  // enforced when CRON_SECRET is actually set, so local/dev testing without
  // it configured still works.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await transferStaleOngoing(new Date().getFullYear());
  return NextResponse.json({ ok: true, ...result });
}
