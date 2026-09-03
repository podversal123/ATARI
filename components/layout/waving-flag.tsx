import { cn } from "@/lib/utils";

const CX = 25;
const CY = 13.4;
const R = 2.6;

/**
 * The Indian national flag on a slanted pole - the topbar mark shown on
 * every dashboard page for every role. Inline SVG (no image asset, crisp at
 * any DPI): a proper equal-band tricolour with a 24-spoke Ashoka Chakra, so
 * it reads unmistakably as the flag, waved via composed SMIL transforms (a
 * slow swing from the pole plus a faster shear of the cloth). SMIL runs with
 * no external CSS, so a stylesheet or a reduced-motion setting can't stop it.
 */
export function WavingFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 34"
      role="img"
      aria-label="Flag of India"
      className={cn("h-9 w-12 shrink-0", className)}
    >
      <line x1="4" y1="33" x2="10" y2="3" stroke="#6b5636" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="10.3" cy="2.4" r="2.4" fill="#e8b93a" stroke="#a9820f" strokeWidth="0.6" />

      {/* whole cloth swings from the pole top (10, 4) */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          dur="1.3s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0; 0.25; 0.5; 0.75; 1"
          values="-3 10 4; 3 10 4; -3 10 4; 3 10 4; -3 10 4"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
        />
        {/* the cloth itself flutters (vertical shear), faster and out of phase */}
        <g>
          <animateTransform
            attributeName="transform"
            type="skewY"
            additive="sum"
            dur="0.9s"
            repeatCount="indefinite"
            calcMode="spline"
            keyTimes="0; 0.25; 0.5; 0.75; 1"
            values="0; 8; 0; -8; 0"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
          />
          <rect x="10" y="4" width="30" height="6.33" fill="#ff9933" />
          <rect x="10" y="10.33" width="30" height="6.33" fill="#ffffff" />
          <rect x="10" y="16.66" width="30" height="6.34" fill="#138808" />
          <rect x="10" y="4" width="30" height="19" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="0.4" />

          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#0a3a8f" strokeWidth="0.55" />
          <circle cx={CX} cy={CY} r="0.55" fill="#0a3a8f" />
          {Array.from({ length: 24 }, (_, i) => (
            <line
              key={i}
              x1={CX}
              y1={CY - 0.5}
              x2={CX}
              y2={CY - R + 0.2}
              stroke="#0a3a8f"
              strokeWidth="0.3"
              transform={`rotate(${i * 15} ${CX} ${CY})`}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
