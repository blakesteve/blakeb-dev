import { useId } from "react";

/**
 * Bragging Rocks' carved seal: a vermilion square, a paper inner rim, speckle where
 * the ink didn't take, a slight displacement, a small tilt. That app's `NameSeal`,
 * with its colors and face read from the job. Decorative, so hidden, as Roster's own
 * numbered marker is: a screen reader takes the number from the list.
 */
export function JobSeal({ text, tilt }: { text: string; tilt: number }) {
  // Its own id, so a second seal never borrows this one's filter.
  const id = `seal${useId().replace(/[^\w-]/g, "")}`;
  return (
    <svg
      className="ink-seal"
      width={28}
      height={28}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={4} result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.1"
            result="m"
          />
          <feComposite in="SourceGraphic" in2="m" operator="in" result="i" />
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves={1} seed={9} result="d" />
          <feDisplacementMap in="i" in2="d" scale={1.6} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>
        <rect x="1.5" y="1.5" width="37" height="37" rx="2" fill="var(--br-vermilion)" />
        <rect x="4.5" y="4.5" width="31" height="31" fill="none" stroke="var(--job-ground)" strokeWidth="1.4" />
        <text
          x="20"
          y="21"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--job-ground)"
          style={{ fontFamily: "var(--job-display)", fontWeight: 800, fontSize: 19 }}
        >
          {text}
        </text>
      </g>
    </svg>
  );
}
