/**
 * `liveTeams` / `describeLiveTeam` — the ACROSS-TEAMS presence question.
 *
 * The scope is the whole point. The existing guard (`down`) asks
 * `seatPresence(config.channel, config)` about ONE team, so a stale resolution
 * would let `team use` switch away from a live team and orphan its seats. Both
 * new guards ask about every configured team.
 */

import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { commsSessionPath } from "../comms.ts";
import { type ResolvedProject, resolveProject } from "../config.ts";
import { describeLiveTeam, liveTeams } from "./team-support.ts";

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

describe("liveTeams — which configured teams are actually up", () => {
  const base = mkdtempSync(join(tmpdir(), "anthill-live-"));
  afterAll(() => rmSync(base, { recursive: true, force: true }));

  const SEATS = [
    { handle: "lead-ant", role: "lead", scope: "orchestration" },
    { handle: "worker", role: "engine", scope: "build", spawn: true },
  ];

  /** A two-team project rooted in a real (empty) directory. */
  const project = (name: string): ResolvedProject => {
    const root = resolve(base, name);
    mkdirSync(root, { recursive: true });
    return resolveProject(
      { teams: { dev: { seats: SEATS }, lean: { seats: SEATS } } },
      { projectRoot: root },
    );
  };

  /** Convene, as far as presence is concerned: the session-open record. */
  const openSession = (root: string, teamDir: string, channel: string, spawned: string[]): void => {
    const path = commsSessionPath(resolve(root, teamDir), channel);
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, JSON.stringify({ spawned, openedAt: 1_754_700_000_000 }));
  };

  test("a fresh project with NO session-open record has NO live teams", () => {
    // THE MEASURED BUG, and the empty array is the point. `seatPresence` answers
    // `unknown` for a team with no session-open record — it cannot scope
    // departures without one — and `unknown` counts as live below. Applied to a
    // team that has simply never been convened, that read a brand-new two-team
    // config as BOTH teams live and refused `anthill team use` on the exact repo
    // it exists to serve.
    expect(liveTeams(project("fresh"))).toEqual([]);
  });

  test("a team WITH a session record and an undeparted seat IS live", () => {
    const p = project("convened");
    openSession(p.projectRoot, ".anthill/teams/dev", "dev", ["worker"]);
    const live = liveTeams(p);
    expect(live.map((l) => l.name)).toEqual(["dev"]);
    // `unknown` counts as live, deliberately, and must not be "simplified" away
    // by someone who reads the first test as "absence means idle". The asymmetry:
    // a false "live" costs one `--force`, a false "idle" orphans a working seat.
    expect(live[0]?.presence.state).not.toBe("none");
  });

  test("only the convened team is reported — the other stays absent", () => {
    const p = project("one-of-two");
    openSession(p.projectRoot, ".anthill/teams/lean", "lean", ["worker"]);
    expect(liveTeams(p).map((l) => l.name)).toEqual(["lean"]);
  });
});
