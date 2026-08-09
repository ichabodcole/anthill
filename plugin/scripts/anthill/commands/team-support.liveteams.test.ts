/**
 * `liveTeams` / `describeLiveTeam` — the ACROSS-TEAMS presence question.
 *
 * The scope is the whole point. The existing guard (`down`) asks
 * `seatPresence(config.channel, config)` about ONE team, so a stale resolution
 * would let `team use` switch away from a live team and orphan its seats. Both
 * new guards ask about every configured team.
 */

import { describe, expect, test } from "bun:test";
import { describeLiveTeam } from "./team-support.ts";

describe("describeLiveTeam", () => {
  test("names who is present, so the refusal is actionable", () => {
    expect(
      describeLiveTeam({
        name: "dev",
        presence: { state: "present", seats: ["forager", "weaver"] },
      }),
    ).toBe('"dev" (seats present: forager, weaver)');
  });

  test("an UNKNOWN presence says so, and carries its reason", () => {
    // `unknown` counts as live — same asymmetry `shouldBlockTeardown` uses: a
    // false "live" costs one `--force`, a false "idle" orphans a working seat.
    // But the refusal must not claim seats were observed, because a reader who
    // cannot tell "someone is there" from "I could not look" cannot tell whether
    // `--force` is safe.
    const described = describeLiveTeam({
      name: "lean",
      presence: { state: "unknown", reason: "comms wire not consulted — no config" },
    });
    expect(described).toContain("could not confirm it is idle");
    expect(described).toContain("comms wire not consulted");
    expect(described).not.toContain("seats present");
  });
});
