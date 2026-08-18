/**
 * Where Roster's Storybook is deployed.
 *
 * One constant, because there used to be two with different fallbacks: the
 * project link in `projects.ts` fell back to the deployed URL, and the story
 * link builder in `roster-ui.tsx` fell back to an empty string. Locally that
 * difference is invisible, since `.env.local` sets the variable and both agree.
 *
 * `.gitignore` excludes `.env*`, so Vercel never receives it — and production
 * shipped a Roster case study linking out to Storybook while `/system` rendered
 * every component name as plain text and the X-ray panel reported "Storybook
 * not deployed yet" about a Storybook that was, in fact, deployed.
 *
 * Set `NEXT_PUBLIC_STORYBOOK_URL` to aim at a different deployment, or to an
 * empty string to switch the links off deliberately.
 */
export const STORYBOOK_URL =
  process.env.NEXT_PUBLIC_STORYBOOK_URL ?? "https://roster-tan.vercel.app";
