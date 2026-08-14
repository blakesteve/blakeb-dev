"use client";

import { RCta } from "@/lib/roster-ui";

/**
 * The browser's own print dialog is the PDF export. Chrome, Safari, and Firefox
 * all offer "Save as PDF" there, which means the downloadable résumé and the
 * page are the same artifact and cannot drift apart.
 */
export function PrintButton() {
  return (
    <RCta as="button" type="button" onClick={() => window.print()} className="print:hidden">
      Print / save as PDF
    </RCta>
  );
}
