import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

import { describe, expect, it } from "vitest";

import Image, { size } from "./opengraph-image";

/** The card's pixels, decoded by hand: a Satori PNG is 8-bit RGBA, not interlaced. */
function rgba(png: Buffer) {
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  /* Bit depth 8, color type 6 (RGBA), no interlace, or the stride below is wrong
     and the colors with it. */
  if (png[24] !== 8 || png[25] !== 6 || png[28] !== 0) throw new Error("not an 8-bit RGBA PNG");
  const chunks: Buffer[] = [];
  for (let at = 8; at < png.length; ) {
    const length = png.readUInt32BE(at);
    if (png.toString("ascii", at + 4, at + 8) === "IDAT") chunks.push(png.subarray(at + 8, at + 8 + length));
    at += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  const out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const byte = raw[y * (stride + 1) + 1 + x];
      const left = x >= 4 ? out[y * stride + x - 4] : 0;
      const up = y > 0 ? out[(y - 1) * stride + x] : 0;
      const corner = x >= 4 && y > 0 ? out[(y - 1) * stride + x - 4] : 0;
      const paeth = () => {
        const p = left + up - corner;
        const [a, b, c] = [Math.abs(p - left), Math.abs(p - up), Math.abs(p - corner)];
        return a <= b && a <= c ? left : b <= c ? up : corner;
      };
      const add = [0, left, up, (left + up) >> 1, paeth()][filter];
      out[y * stride + x] = (byte + add) & 0xff;
    }
  }
  return { width, height, at: (x: number, y: number) => [...out.subarray((y * width + x) * 4, (y * width + x) * 4 + 3)] };
}

describe("the share card", () => {
  it("sets in the site's faces, from files in the repo, with no fetch", () => {
    const source = readFileSync("src/app/opengraph-image.tsx", "utf8");
    expect(source).toContain('"archivo-latin-800-normal.woff"');
    expect(source).toContain('"ibm-plex-mono-latin-400-normal.woff"');
    expect(source).not.toMatch(/\bfetch\(/);
  });

  /* "Designer." ran off the card once it had a real heavy face to draw with:
     at 104px it measured 122px past the margin. The content box ends 92px
     from the edge. */
  it("keeps the headline inside the margin", async () => {
    const card = rgba(Buffer.from(await (await Image()).arrayBuffer()));
    expect([card.width, card.height]).toEqual([size.width, size.height]);

    let right = 0;
    for (let y = 20; y < card.height; y++) {
      for (let x = 0; x < card.width; x++) {
        const [r, g, b] = card.at(x, y);
        if (r > 180 && g < 60 && b > 70 && b < 150) right = Math.max(right, x);
      }
    }
    expect(right).toBeGreaterThan(900);
    expect(right).toBeLessThan(size.width - 92);
  }, 20000);
});
