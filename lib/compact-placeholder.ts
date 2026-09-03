/**
 * Shortens a field label into text that fits a compact ~240-320px input
 * without native single-line placeholder clipping - strips parenthetical
 * units/qualifiers ("(in ha)", "(Rs.)", "(m-Kisan Portal/National Farmers
 * Portal/ SMS Portal)") since those are already shown in the field's own
 * (wrappable) label right above the input, then caps what's left at a word
 * boundary. Client report, 2026-09-04: this app's real reference labels
 * often run long, and a placeholder built straight from the raw label
 * silently overflowed past the input's edge with no visual sign text was
 * missing - every "Enter {label}"/"Select {label}" placeholder across the
 * app is built from this instead of the raw label now.
 */
export function compactPlaceholder(label: string, maxLength = 34): string {
  const stripped = label.replace(/\s*\([^)]*\)/g, "").trim();
  const text = stripped || label;
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated).trim();
}
