"use client";

import { useEffect, useRef, useState } from "react";
import {
  ActionBar,
  Button,
  Countdown,
  Dialog,
  Footer,
  ModerationQueue,
  Navbar,
  Sheet,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@blakesteve/roster";
import type { FrameName } from "./frames";
import { CONTROL, LOGO, Note, Opener, wait, type FrameSpec } from "./kit";

/* Relative to now, so it's set once, when the frame first renders.

   A clock that ticks every second is moving content (WCAG 2.2.2), and Roster's
   runs on a timer that `animation-play-state` can't reach. So on the sheet it
   rests on Roster's own finished state and runs while its frame has the pointer
   or focus, like the sheet's animations. In the loupe it runs freely. */
const DONE = new Date(0);

function CountdownFrame() {
  const box = useRef<HTMLDivElement>(null);
  const [target] = useState(() => new Date(Date.now() + 3 * 864e5 + 5 * 36e5));
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = box.current;
    const frame = el?.closest(".cs-frame");
    if (!el || el.closest(".loupe-stage") || !frame) {
      queueMicrotask(() => setRunning(true));
      return;
    }
    /* From the events themselves: Firefox hasn't updated :hover yet when
       pointerenter fires, so asking it ran the clock backwards there. A finger
       leaves as it lifts, so a tap holds, as touch :hover does, until a press
       lands somewhere else. */
    let hovered = false;
    let focused = false;
    const sync = (event: Event) => {
      if (event.type === "pointerenter") hovered = true;
      else if (event.type === "pointerleave") hovered = (event as PointerEvent).pointerType === "touch" && hovered;
      else if (event.type === "pointerdown") hovered = frame.contains(event.target as Node);
      else if (event.type === "focusin") focused = true;
      else focused = frame.contains((event as FocusEvent).relatedTarget as Node | null);
      setRunning(hovered || focused);
    };
    const events = ["pointerenter", "pointerleave", "focusin", "focusout"] as const;
    for (const type of events) frame.addEventListener(type, sync);
    document.addEventListener("pointerdown", sync);
    return () => {
      for (const type of events) frame.removeEventListener(type, sync);
      document.removeEventListener("pointerdown", sync);
    };
  }, []);

  return (
    <div ref={box}>
      <Countdown
        targetDate={running ? target : DONE}
        title="Press check"
        completionText="Point here to start the clock"
      />
    </div>
  );
}

const PROOF = { id: "1", title: "A proof for the fall catalog", by: "Sent by the bindery" };

/* One decision empties the queue, so a reset puts the proof back and hands
   focus to it, where the queue itself puts focus after a decision. */
function ModerationQueueFrame() {
  const box = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState([PROOF]);
  const restoring = useRef(false);

  useEffect(() => {
    if (!restoring.current) return;
    restoring.current = false;
    box.current?.querySelector<HTMLElement>("[data-queue-item]")?.focus();
  }, [items]);

  return (
    <div ref={box} className="w-full">
      <ModerationQueue
        label="Review"
        hideLabel
        density="compact"
        items={items}
        getKey={(item) => item.id}
        itemLabel={(item) => item.title}
        renderContent={(item) => <span className="cs-body">{item.by}</span>}
        empty={{ title: "Queue clear" }}
        actions={[
          {
            id: "ok",
            label: "Approve",
            tone: "success",
            done: "Approved",
            run: async (item) => {
              await wait(300);
              setItems((all) => all.filter((x) => x.id !== item.id));
            },
          },
        ]}
        footer={
          items.length === 0 && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="neutral"
              className={CONTROL}
              onClick={() => {
                restoring.current = true;
                setItems([PROOF]);
              }}
            >
              Reset the queue
            </Button>
          )
        }
        className="w-full"
      />
    </div>
  );
}

export const ORGANISMS = {
  ActionBar: {
    C: () => (
      <ActionBar
        title="3 plates selected"
        position="static"
        variant="soft"
        actions={
          <Button size="xs" className={CONTROL}>
            Burn
          </Button>
        }
        className="w-full"
      />
    ),
  },
  Countdown: { C: CountdownFrame },
  DataTable: {
    C: () => (
      <Note>
        Not live here. It ships from its own entry and needs @tanstack/react-table, which this site
        doesn&rsquo;t install.
      </Note>
    ),
  },
  Dialog: {
    C: () => (
      <Opener label="Open the dialog">
        {(open, setOpen) => (
          <Dialog
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Send this job to press?"
            description="Plates can't be changed after this."
          >
            <div className="flex justify-end gap-2 pt-3">
              <Button size="sm" variant="ghost" colorScheme="neutral" className={CONTROL} onClick={() => setOpen(false)}>
                Not yet
              </Button>
              <Button size="sm" className={CONTROL} onClick={() => setOpen(false)}>
                Run it
              </Button>
            </div>
          </Dialog>
        )}
      </Opener>
    ),
  },
  Footer: {
    C: () => (
      <Footer
        companyName="Blake Ball"
        links={[
          { label: "GitHub", href: "https://github.com/blakesteve" },
          { label: "npm", href: "https://www.npmjs.com/package/@blakesteve/roster" },
        ]}
        className="w-full"
      />
    ),
  },
  ModerationQueue: { C: ModerationQueueFrame },
  Navbar: {
    C: () => (
      <div className="cs-nav">
        <Navbar
          logoSrc={LOGO}
          brandName="Blake Ball"
          items={[
            { label: "Work", path: "/work" },
            { label: "Writing", path: "/writing" },
          ]}
          activePath="/work"
          themeMode="auto"
        />
      </div>
    ),
  },
  Sheet: {
    C: () => (
      <Opener label="Open the sheet">
        {(open, setOpen) => (
          <Sheet
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Job ticket"
            description="Drag it down to dismiss."
            dragToDismiss
          >
            <p className="cs-body m-0">2,500 sheets on uncoated 100#, four inks, one varnish.</p>
          </Sheet>
        )}
      </Opener>
    ),
  },
  Table: {
    C: () => (
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Plate</TableHead>
            <TableHead>Ink</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
            <TableCell>Cyan</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>2</TableCell>
            <TableCell>Magenta</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
  },
} satisfies Record<FrameName<"organisms">, FrameSpec>;
