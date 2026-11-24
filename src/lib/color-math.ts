/**
 * Color arithmetic for the tests that hold this site's palette: WCAG contrast,
 * OKLab mixing as CSS does it, and how two colors look apart to a reader with
 * normal, deutan or protan vision. Nothing the site ships imports it.
 */

export type Rgb = [number, number, number];

export const rgb = (hex: string): Rgb => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`not a six-digit hex: ${hex}`);
  return [0, 2, 4].map((at) => parseInt(m[1].slice(at, at + 2), 16)) as Rgb;
};

const linear = (v: number) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
const gamma = (v: number) => {
  const c = Math.min(1, Math.max(0, v));
  return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
};

const lum = (c: Rgb) => {
  const [r, g, b] = c.map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const ratio = (a: Rgb, b: Rgb) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** `fg` at `alpha` laid over `bg`, as `bg-[var(--cta)]/10` paints it. */
export const wash = (fg: Rgb, alpha: number, bg: Rgb): Rgb => fg.map((v, i) => v * alpha + bg[i] * (1 - alpha)) as Rgb;

const toLab = (c: Rgb) => {
  const [r, g, b] = c.map(linear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const fromLab = ([L, a, b]: number[]): Rgb => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.round(gamma(v))) as Rgb;
};

/** `color-mix(in oklab, fg share%, bg)`, as the case-study header paints it. */
export const mixLab = (fg: Rgb, share: number, bg: Rgb): Rgb => {
  const [a, b] = [toLab(fg), toLab(bg)];
  return fromLab(a.map((v, i) => v * share + b[i] * (1 - share)));
};

/* Machado, Oliveira and Fernandes 2009, severity 1.0, on linear light. */
const VISION: Record<string, number[][] | null> = {
  normal: null,
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
};

const seen = (c: Rgb, matrix: number[][] | null): Rgb => {
  if (!matrix) return c;
  const l = c.map(linear);
  return matrix.map((row) => gamma(row[0] * l[0] + row[1] * l[1] + row[2] * l[2])) as Rgb;
};

/**
 * How far apart two colors are, as OKLab distance times 100, in whichever of
 * normal, deutan and protan vision has them closest. 2 is just noticeable on a
 * large patch.
 */
export const apart = (a: string, b: string): number =>
  Math.min(
    ...Object.values(VISION).map((matrix) => {
      const [x, y] = [toLab(seen(rgb(a), matrix)), toLab(seen(rgb(b), matrix))];
      return 100 * Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
    }),
  );
