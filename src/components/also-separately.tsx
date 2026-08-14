import { REyebrow } from "@/lib/roster-ui";

/**
 * BB's Grove, which sits outside the numbered set on purpose.
 *
 * It is a memorial, not a case study. There is no scale figure, no stack
 * table, and nothing to measure, and putting it in a list beside four projects
 * with metrics would quietly turn it into one. The dashed rule is the whole
 * argument: this belongs on the sheet, but not in the sequence.
 *
 * Shared by the home page and /work so the two cannot end up describing it
 * differently, which is exactly what would happen if it were written twice.
 */
export function AlsoSeparately() {
  return (
    <section className="mt-5 flex flex-col gap-[7px] rounded-[3px] border border-dashed border-rule px-[18px] py-4">
      <REyebrow>Also, and separately</REyebrow>
      <h2 className="m-0 text-[1.1875rem] font-semibold tracking-[-0.01em]">
        BB&rsquo;s Grove
      </h2>
      <p className="m-0 max-w-[62ch] text-sm leading-[1.55] text-ink-soft">
        A memorial for my older brother, where everyone who knew him can share
        memories, photos, and his BBisms. The homepage grows a grove of Texas
        trees, one per story. It is not a case study and there is nothing to
        measure; if you would like to see it, it is at{" "}
        <a
          href="https://who-bb.com"
          className="text-ink underline decoration-rule underline-offset-2 transition-colors hover:decoration-spot"
        >
          who-bb.com
        </a>
        .
      </p>
    </section>
  );
}
