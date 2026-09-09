import "server-only";
import { prisma } from "@/lib/prisma";

/** 12 months x 6 quarters, matching the reference grid exactly. */
export const STAFF_QUARTER_COLUMNS = 6;

export type OccupancyCell = { month: number; quarter: number; occupied: boolean };

type ParsedBody = {
  dateOfCompletion: Date | null;
  whetherCompleted: boolean | null;
  numberOfQuarters: number;
  occupancyDetails: string | null;
  remark: string | null;
  occupancy: OccupancyCell[];
};

/** Shared shape check for POST /api/staff-quarters and PATCH /api/staff-quarters/[id]. */
export function parseStaffQuartersBody(body: unknown): ParsedBody | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  const rawDate = typeof b.dateOfCompletion === "string" ? b.dateOfCompletion.trim() : "";
  if (!rawDate) return { error: "Date of Completion is required." };
  const dateOfCompletion = new Date(rawDate);
  if (Number.isNaN(dateOfCompletion.getTime())) return { error: "Date of Completion is not a valid date." };

  const whetherRaw = typeof b.whetherCompleted === "string" ? b.whetherCompleted.trim().toLowerCase() : "";
  if (whetherRaw !== "yes" && whetherRaw !== "no") {
    return { error: "Select whether staff quarters have been completed." };
  }
  const whetherCompleted = whetherRaw === "yes";

  const numberOfQuarters = Number.parseInt(String(b.numberOfQuarters ?? ""), 10);
  if (!Number.isFinite(numberOfQuarters) || numberOfQuarters < 0) {
    return { error: "No. of Staff Quarters must be a number." };
  }

  const occupancyDetails = typeof b.occupancyDetails === "string" ? b.occupancyDetails.trim() : "";
  if (!occupancyDetails) return { error: "Occupancy Details is required." };

  const remark = typeof b.remark === "string" ? b.remark.trim() : "";
  if (!remark) return { error: "Remark is required." };

  const occupancy: OccupancyCell[] = [];
  const rawCells = Array.isArray(b.occupancy) ? b.occupancy : [];
  for (const cell of rawCells) {
    if (!cell || typeof cell !== "object") continue;
    const c = cell as Record<string, unknown>;
    const month = Number(c.month);
    const quarter = Number(c.quarter);
    const value = typeof c.value === "string" ? c.value.trim().toLowerCase() : "";
    if (month < 1 || month > 12 || quarter < 1 || quarter > STAFF_QUARTER_COLUMNS) continue;
    if (value !== "yes" && value !== "no") continue; // blank cell -> not stored
    occupancy.push({ month, quarter, occupied: value === "yes" });
  }

  return { dateOfCompletion, whetherCompleted, numberOfQuarters, occupancyDetails, remark, occupancy };
}

/** Replace a record's whole occupancy grid with the given cells. */
export async function writeOccupancy(staffQuartersId: string, cells: OccupancyCell[]) {
  await prisma.$transaction([
    prisma.staffQuarterOccupancy.deleteMany({ where: { staffQuartersId } }),
    ...(cells.length
      ? [
          prisma.staffQuarterOccupancy.createMany({
            data: cells.map((c) => ({
              staffQuartersId,
              quarterNumber: c.quarter,
              month: c.month,
              occupied: c.occupied,
            })),
          }),
        ]
      : []),
  ]);
}
