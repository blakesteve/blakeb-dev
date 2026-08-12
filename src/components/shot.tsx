import Image, { type StaticImageData } from "next/image";

/**
 * A screenshot, framed as a printed plate.
 *
 * When a shot exists in both production states, both are rendered and CSS
 * picks — no JavaScript, no flash, and the pair swaps in lockstep with the
 * rest of the page. When only one state was captured, the frame reads as a
 * specimen instead: it keeps its own surface, so a dark plate on the press
 * sheet looks deliberate rather than like a hole punched in the paper.
 */
export function Shot({
  press,
  blueline,
  alt,
  caption,
  frame = "full",
  priority = false,
}: {
  press: StaticImageData;
  blueline?: StaticImageData;
  alt: string;
  caption: string;
  frame?: "full" | "phone";
  priority?: boolean;
}) {
  const isPair = Boolean(blueline);
  const sizes = frame === "phone" ? "300px" : "(min-width: 1180px) 700px, 100vw";

  return (
    <figure
      className={
        "my-5 flex flex-col gap-[7px] " + (frame === "phone" ? "max-w-[300px]" : "w-full")
      }
    >
      <div className="overflow-hidden rounded-[3px] border border-rule bg-panel">
        <Image
          src={press}
          alt={alt}
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          className={"h-auto w-full " + (isPair ? "plate-press" : "block")}
        />
        {blueline ? (
          <Image
            src={blueline}
            alt={alt}
            sizes={sizes}
            priority={priority}
            placeholder="blur"
            className="plate-blueline h-auto w-full"
          />
        ) : null}
      </div>

      <figcaption className="u !tracking-[0.12em]">
        {caption}
        {isPair ? (
          <span className="text-[var(--world)]"> · both states</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
