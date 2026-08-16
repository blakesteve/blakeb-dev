import { ImageResponse } from "next/og";

/**
 * The share card, generated at build time.
 *
 * Composed rather than typeset: ImageResponse ships no fonts of its own, and
 * pulling Archivo down at build would put a network dependency on the one
 * artifact that has no fallback if the fetch fails. Colour, the process bar,
 * crop marks, and the mark carry the identity instead of the typeface, so this
 * reads as the site even in a system sans.
 *
 * The mark is off register here too, since it cannot snap in a still image and
 * the misalignment is the whole point of it.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Blake Ball — engineer, fluent in designer";

const PAPER = "#e7e8e3";
const INK = "#14150f";
const INK_SOFT = "#54564d";
const SPOT = "#d6006d";
const CYAN = "#0090ce";
const YELLOW = "#f5d400";

/** A crop mark: the corner rules a trimmer cuts to. */
function CropMark({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{ position: "absolute", display: "flex", ...style }}>
      <svg width="26" height="26" viewBox="0 0 26 26">
        <path d="M13 0v26M0 13h26" stroke={INK_SOFT} strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: PAPER,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* The process bar, same order as the site's footer. */}
        <div style={{ display: "flex", height: 12, width: "100%" }}>
          <div style={{ flex: 1, background: CYAN }} />
          <div style={{ flex: 1, background: SPOT }} />
          <div style={{ flex: 1, background: YELLOW }} />
          <div style={{ flex: 1, background: INK }} />
        </div>

        <CropMark style={{ top: 34, left: 34 }} />
        <CropMark style={{ top: 34, right: 34 }} />
        <CropMark style={{ bottom: 34, left: 34 }} />
        <CropMark style={{ bottom: 34, right: 34 }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 92px",
          }}
        >
          {/* Satori ignores `gap`; spacing has to be explicit margin. */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <svg width="62" height="62" viewBox="0 0 24 24" style={{ marginRight: 22 }}>
              <circle
                cx="12.9"
                cy="11.15"
                r="8.3"
                fill="none"
                stroke={SPOT}
                strokeWidth="1.9"
              />
              <circle
                cx="11.25"
                cy="12.7"
                r="8.3"
                fill="none"
                stroke={CYAN}
                strokeWidth="1.9"
              />
              <path d="M12 0v24M0 12h24" stroke={INK} strokeWidth="1.2" />
            </svg>
            <div
              style={{
                fontSize: 21,
                letterSpacing: 5,
                color: INK_SOFT,
                textTransform: "uppercase",
              }}
            >
              Austin, Texas · Est. 2010
            </div>
          </div>

          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: -3.5,
              lineHeight: 1,
              color: INK,
              textTransform: "uppercase",
              marginTop: 34,
              display: "flex",
            }}
          >
            Engineer.
          </div>
          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: -3.5,
              lineHeight: 1,
              textTransform: "uppercase",
              marginTop: 6,
              display: "flex",
            }}
          >
            {/* The word space is a sized box, and it must not be shrinkable.
                This line set as "FLUENT INDESIGNER." because at 118px it
                overflowed the content box, and flexbox took the whole
                shortfall out of the only child that could give: the space.
                Satori ignores `gap`, so a box is the mechanism, and the type
                is sized to fit rather than to be squeezed. */}
            <div style={{ display: "flex", flexShrink: 0, color: INK }}>
              Fluent in
            </div>
            <div style={{ display: "flex", flexShrink: 0, width: 24, height: 1 }} />
            <div style={{ display: "flex", flexShrink: 0, color: SPOT }}>
              designer.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: 52,
              borderTop: `1px solid ${INK_SOFT}`,
              paddingTop: 20,
              fontSize: 22,
              letterSpacing: 3,
              color: INK_SOFT,
              textTransform: "uppercase",
            }}
          >
            <div style={{ display: "flex" }}>Blake Ball</div>
            <div style={{ display: "flex" }}>blakeb.dev</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
