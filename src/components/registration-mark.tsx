/**
 * The registration mark a printer uses to check that each ink plate lines up.
 * Here it does the same job the whole design does: proof that someone set this
 * page on purpose. Crosshair takes the ink, ring takes the spot color.
 */
export function RegistrationMark({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <circle
        cx="7"
        cy="7"
        r="5.2"
        fill="none"
        stroke="var(--spot)"
        strokeWidth="1"
      />
      <path d="M7 0v14M0 7h14" stroke="var(--ink)" strokeWidth="0.75" />
    </svg>
  );
}
