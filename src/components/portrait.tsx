import Image, { type StaticImageData } from "next/image";

/**
 * A photograph printed in one ink.
 *
 * The image is desaturated and a `--spot` layer is composited over it with
 * `mix-blend-mode: color`, which takes hue and saturation from the layer and
 * luminance from the photograph. That is a spot-color print, not a filter: one
 * plate, one ink, tone carried entirely by the halftone.
 *
 * Because `--spot` is a token and the two production states define it
 * differently, the same photograph comes off magenta on the press sheet and
 * cyan on the blueline. Hitting the toggle re-runs the job in the other ink,
 * which is the most literal thing this site does with its own metaphor.
 *
 * The corner marks are registration marks: on a real press they are how you
 * check the plates line up. Here they are decoration and say so.
 */
export function Portrait({
  src,
  alt,
  caption,
}: {
  src: StaticImageData;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="m-0 flex flex-col gap-[9px]">
      <div className="relative isolate overflow-hidden rounded-[3px] border border-rule">
        <Image
          src={src}
          alt={alt}
          sizes="(min-width: 1024px) 380px, 100vw"
          placeholder="blur"
          className="block h-auto w-full grayscale contrast-[1.08] brightness-[1.02]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-spot mix-blend-color"
        />
        {/* A second, very light pass in the same ink, to keep the shadows from
            going flat once the color layer lands. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-spot opacity-[0.09] mix-blend-multiply"
        />

        {[
          "left-[6px] top-[6px]",
          "right-[6px] top-[6px]",
          "left-[6px] bottom-[6px]",
          "right-[6px] bottom-[6px]",
        ].map((position) => (
          <span
            key={position}
            aria-hidden="true"
            className={`pointer-events-none absolute ${position} size-[11px] opacity-70`}
            style={{
              background:
                "linear-gradient(var(--paper),var(--paper)) center/100% 1px no-repeat," +
                "linear-gradient(var(--paper),var(--paper)) center/1px 100% no-repeat",
            }}
          />
        ))}
      </div>

      {caption && (
        <figcaption className="font-[family-name:var(--font-util)] text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
