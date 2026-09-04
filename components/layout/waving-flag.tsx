import { cn } from "@/lib/utils";

const CX = 25;
const CY = 14.5;
const R = 3;

/**
 * The Indian national flag on a pole - the topbar mark on every dashboard
 * page. The cloth is a real tricolour (three bands + a 24-spoke Ashoka
 * Chakra) clipped to a shape whose free edges ripple: a travelling wave
 * morphs the top / right / bottom edges through a few phases while the pole
 * edge stays pinned, so it reads as cloth caught in the wind, not a flat
 * graphic tilting. Inline SVG + SMIL, no image asset, no CSS.
 */
export function WavingFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 46 42"
      role="img"
      aria-label="Flag of India"
      className={cn("h-9 w-12 shrink-0", className)}
    >
      <defs>
        <clipPath id="ams-flag-cloth">
          <path d="M9,5 C16,4 25,8 41,4 L41,25 C25,29 16,21 9,25 Z">
            <animate
              attributeName="d"
              dur="1.5s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.25; 0.5; 0.75; 1"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
              values="
                M9,5 C16,4 25,8 41,4 L41,25 C25,29 16,21 9,25 Z;
                M9,5 C16,8 25,1 41,9 L41,30 C25,20 16,31 9,25 Z;
                M9,5 C16,3 25,9 41,2 L41,22 C25,31 16,19 9,25 Z;
                M9,5 C16,9 25,1 41,8 L41,29 C25,21 16,30 9,25 Z;
                M9,5 C16,4 25,8 41,4 L41,25 C25,29 16,21 9,25 Z
              "
            />
          </path>
        </clipPath>
      </defs>

      <line x1="6" y1="41" x2="9" y2="1" stroke="#9b9b9b" strokeWidth="1.8" strokeLinecap="round" />

      <g clipPath="url(#ams-flag-cloth)">
        {/* Bands over-fill the clip's y-range so every ripple crest stays coloured; the clip defines the real edges. */}
        <rect x="5" y="0" width="40" height="10.5" fill="#ff9933" />
        <rect x="5" y="10.5" width="40" height="9" fill="#ffffff" />
        <rect x="5" y="19.5" width="40" height="16" fill="#138808" />
        <g stroke="#0a3a8f" strokeWidth="0.45">
          <circle cx={CX} cy={CY} r={R} fill="none" strokeWidth="0.7" />
          {Array.from({ length: 24 }, (_, i) => (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={CX}
              y2={CY - R}
              transform={`rotate(${i * 15} ${CX} ${CY})`}
            />
          ))}
        </g>
        <circle cx={CX} cy={CY} r="0.7" fill="#0a3a8f" />
      </g>
    </svg>
  );
}
