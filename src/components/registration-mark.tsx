import type React from "react";

/**
 * The registration mark, deliberately out of register.
 *
 * On a press, this crosshair is how you check the plates line up; if the cyan
 * and magenta films are off by a hair you see it here first. This one is off by
 * a hair on purpose, which is the only thing that makes a standard printer's
 * symbol into a mark that belongs to this site: the whole place is an argument
 * about noticing the thing that is slightly wrong.
 *
 * Hover it, or anything in a `group` around it, and the plates snap into
 * register. That is the joke completing itself, and it is also the one piece of
 * motion on the site that means something rather than decorating something.
 *
 * The two rings take the two process inks so the misregistration reads as
 * color fringing rather than as a blurry circle. The crosshair stays in ink,
 * sharp, because on a real sheet the crosshair is the reference the plates are
 * measured against — it is never the thing that moves.
 */
export function RegistrationMark({
  size = 14,
  className = "",
  ...props
}: {
  size?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={`reg-mark shrink-0 ${className}`}
      {...props}
    >
      <circle
        className="reg-plate reg-plate-a"
        cx="12"
        cy="12"
        r="8.4"
        fill="none"
        stroke="var(--spot)"
        strokeWidth="1.9"
      />
      <circle
        className="reg-plate reg-plate-b"
        cx="12"
        cy="12"
        r="8.4"
        fill="none"
        stroke="var(--second)"
        strokeWidth="1.9"
      />
      <path d="M12 0v24M0 12h24" stroke="var(--ink)" strokeWidth="1.2" />
    </svg>
  );
}
