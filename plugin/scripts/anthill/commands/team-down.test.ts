import { describe, expect, it } from "bun:test";
import { shouldBlockTeardown } from "./team-down.ts";
import type { SeatPresence } from "./team-support.ts";

const present = (...seats: string[]): SeatPresence => ({ state: "present", seats });
const none: SeatPresence = { state: "none" };
const unknown: SeatPresence = { state: "unknown", reason: "grapevine daemon not running" };

// PURE guard. `down` kills tmux panes, so the guard's failure directions are not
// symmetric: refusing a teardown that should have proceeded costs one `--force`,
// while permitting one that should have been refused kills seats mid-build.
describe("shouldBlockTeardown", () => {
  it("blocks when seats are present and not forced", () => {
    expect(shouldBlockTeardown(present("loom", "mosaic"), false)).toBe(true);
  });

  it("allows when seats are present but forced", () => {
    expect(shouldBlockTeardown(present("loom", "mosaic"), true)).toBe(false);
  });

  it("allows when the channel positively reports nobody, and not forced", () => {
    expect(shouldBlockTeardown(none, false)).toBe(false);
  });

  // THE INVERSION. This is the assertion the card exists for.
  //
  // `presentSeats` used to return `[]` on every failure path — dead daemon,
  // unresolved CLI, unparseable payload — so the guard could not tell "the team
  // has stood down" from "I have no idea who is on this channel", and it chose
  // the reading that lets a destructive command through. Under a sole-wire
  // migration that stops being a rare failure: when grapevine is gone, EVERY
  // teardown reads as unknown, so the guard would pass 100% of the time while
  // looking exactly as it does today.
  it("BLOCKS when presence is unknown and not forced — ignorance is not consent", () => {
    expect(shouldBlockTeardown(unknown, false)).toBe(true);
  });

  it("still allows an unknown teardown when explicitly forced", () => {
    // The escape hatch has to survive, or a broken vine wedges teardown forever
    // — which is the real concern the original fail-open was defending. `--force`
    // is where that belongs: a human saying so, not a guard guessing.
    expect(shouldBlockTeardown(unknown, true)).toBe(false);
  });

  // Set-assertion: the guard must actually DISCRIMINATE, not merely return true
  // often enough to pass the cases above. A guard hardcoded to `!force` passes
  // every unforced test here; it fails this one.
  it("distinguishes none from unknown at the same force setting", () => {
    expect(shouldBlockTeardown(none, false)).toBe(false);
    expect(shouldBlockTeardown(unknown, false)).toBe(true);
  });
});
