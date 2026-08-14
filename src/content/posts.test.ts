import { describe, expect, it } from "vitest";

import { formatPostDate, getPost, posts, postsByDate } from "./posts";

/**
 * Posts are hand-authored data that routing depends on. A duplicated slug, a
 * date typed `2026-8-14`, or a missing field does not fail the build — it fails
 * quietly, as a 404 or a date that reads "14 undefined 2026". These are the
 * checks the type system cannot make.
 */

describe("formatPostDate", () => {
  it("renders a long-form date", () => {
    expect(formatPostDate("2026-08-14")).toBe("14 August 2026");
  });

  it("does not zero-pad the day", () => {
    expect(formatPostDate("2026-03-01")).toBe("1 March 2026");
  });

  it("handles both ends of the year", () => {
    expect(formatPostDate("2026-01-31")).toBe("31 January 2026");
    expect(formatPostDate("2026-12-25")).toBe("25 December 2026");
  });

  // Off-by-one on the month index is the classic failure here, and it produces
  // "undefined" rather than throwing.
  it("never emits undefined for a valid month", () => {
    for (let month = 1; month <= 12; month += 1) {
      const mark = `2026-${String(month).padStart(2, "0")}-01`;
      expect(formatPostDate(mark)).not.toContain("undefined");
    }
  });
});

describe("getPost", () => {
  it("finds a post by slug", () => {
    const first = posts[0];
    expect(getPost(first.slug)).toBe(first);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getPost("not-a-post")).toBeUndefined();
  });
});

describe("postsByDate", () => {
  it("includes every post", () => {
    expect(postsByDate).toHaveLength(posts.length);
  });

  it("runs newest first", () => {
    const dates = postsByDate.map((post) => post.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("does not reorder the source array", () => {
    const before = posts.map((post) => post.slug);
    void postsByDate;
    expect(posts.map((post) => post.slug)).toEqual(before);
  });
});

describe("post data", () => {
  it("has no duplicate slugs", () => {
    const slugs = posts.map((post) => post.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(posts.map((post) => [post.slug, post] as const))(
    "%s is complete and well formed",
    (_slug, post) => {
      // Anything else breaks the route without breaking the build.
      expect(post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(post.date))).toBe(false);

      expect(post.title.trim()).not.toBe("");
      expect(post.dek.trim()).not.toBe("");
      expect(post.tags.length).toBeGreaterThan(0);
      expect(post.tags.every((tag) => tag.trim() !== "")).toBe(true);
      expect(post.body).toBeTruthy();
    },
  );

  // The dek is the meta description and the index standfirst. Google truncates
  // around 160; longer than that is a sentence nobody sees the end of.
  it.each(posts.map((post) => [post.slug, post.dek] as const))(
    "%s has a dek short enough to be a meta description",
    (_slug, dek) => {
      expect(dek.length).toBeLessThanOrEqual(180);
    },
  );
});
