import Link from "next/link";

/** Same column set as the full Log History page (KVK Name/Name Of User/Activity/IP Address/Login Time), just without the S.No column the reference's own compact widget drops. */
const COLUMNS = [
  "KVK Name",
  "Name Of User",
  "Activity",
  "IP Address",
  "Login Time",
];

/** Fixed to 450px so this card matches the real rendered height of the OFT/FLD/Training/Extension progress cards above it - this dashboard's other row of content cards - rather than drifting to whatever height its own content happens to need. */
export function RecentLogHistoryCard() {
  return (
    <div className="flex h-[450px] flex-col rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold tracking-wide text-primary uppercase">
          Recent Log History
        </p>
        <Link
          href="/log-history"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="mt-3 min-h-0 flex-1 -mx-5 overflow-y-auto border-t border-border">
        <table className="h-full w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {COLUMNS.map((column) => (
                <th key={column} className="px-5 py-2">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="px-5 py-10 text-center align-middle text-muted-foreground"
              >
                No records found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
