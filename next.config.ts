import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Roster's type declarations, forced into the serverless bundle.
   *
   * `lib/roster.ts` counts the library's components by parsing
   * `dist/index.d.ts` and `dist/data-table.d.ts` with `readFileSync`. Nothing
   * imports those files, so Next's tracer cannot see the dependency and strips
   * them — a build trace of this app included 19 files from the package,
   * `tokens.css` and `package.json` among them, and not one `.d.ts`.
   *
   * That was invisible until a page revalidated. The count is correct at build
   * time, when the real `node_modules` is on disk; on any later ISR render the
   * read throws inside the lambda and the home page printed "0 components"
   * under the words "tokens read live". `/system` escaped only because it is
   * fully static and had not regenerated in three days.
   *
   * The glob is deliberately narrow. Tracing the whole package would drag the
   * compiled bundles into every route for no reason; these two files are the
   * only ones read that the tracer cannot infer.
   */
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/@blakesteve/roster/dist/*.d.ts"],
  },
};

export default nextConfig;
