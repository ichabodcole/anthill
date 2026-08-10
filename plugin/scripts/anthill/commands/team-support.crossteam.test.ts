/**
 * The cross-team guard inside `requireConfig`: a `--channel` / `--session` that
 * names a DIFFERENT configured team is refused, pointing at `--team`.
 *
 * Tested against the PURE half. `requireConfig` itself loads from disk and calls
 * `process.exit(1)` on a `ConfigError`, so exercising it here would test the exit
 * path rather than the rule.
 */

import { describe, expect, test } from "bun:test";
import { ConfigError, type ResolvedProject, resolveProject } from "../config.ts";
import { rejectOtherTeam } from "./team-support.ts";

const SEATS = [{ handle: "lead-ant", role: "lead", scope: "orchestration" }];

const project = (): ResolvedProject =>
  resolveProject(
    {
      teams: {
        dev: { seats: SEATS, channel: "anthill" },
        lean: { seats: SEATS, channel: "lean-wire" },
      },
    },
    { projectRoot: "/proj" },
  );

const teamNamed = (name: string) => {
  const found = project().team(name);
  if (!found) throw new Error(`fixture has no team ${name}`);
  return found;
};

describe("rejectOtherTeam", () => {
  test("refuses a --channel belonging to another configured team", () => {
    // The hazard: the command resolved to `dev`, the value points at `lean`, so
    // it would run lean's WIRE against dev's roster, gate and seat docs.
    expect(() => rejectOtherTeam(project(), teamNamed("dev"), { channel: "lean-wire" })).toThrow(
      ConfigError,
    );
    expect(() => rejectOtherTeam(project(), teamNamed("dev"), { channel: "lean-wire" })).toThrow(
      /lean/,
    );
  });

  test("the message points at `--team`, which is the fix", () => {
    let message = "";
    try {
      rejectOtherTeam(project(), teamNamed("dev"), { channel: "lean-wire" });
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toContain("--team lean");
  });

  test("refuses a --session belonging to another team, the same way", () => {
    expect(() => rejectOtherTeam(project(), teamNamed("lean"), { session: "anthill" })).toThrow(
      /dev/,
    );
  });

  test("ALLOWS the resolved team's own channel — passing it is redundant, not wrong", () => {
    expect(() =>
      rejectOtherTeam(project(), teamNamed("dev"), { channel: "anthill" }),
    ).not.toThrow();
  });

  test("ALLOWS a value matching NO configured team — the escape hatch stays open", () => {
    // An ad-hoc session or a channel outside the config is legitimate, and every
    // single-team project that passes one today must keep working.
    expect(() =>
      rejectOtherTeam(project(), teamNamed("dev"), { channel: "some-scratch-channel" }),
    ).not.toThrow();
    expect(() =>
      rejectOtherTeam(project(), teamNamed("dev"), { session: "ad-hoc-session" }),
    ).not.toThrow();
  });

  test("does nothing when neither value is given", () => {
    expect(() => rejectOtherTeam(project(), teamNamed("dev"), {})).not.toThrow();
  });

  test("cannot fire on a single-team project — there is no other team to name", () => {
    const solo = resolveProject({ channel: "solo", seats: SEATS }, { projectRoot: "/proj" });
    const only = solo.teams[0];
    if (!only) throw new Error("fixture has no team");
    expect(() => rejectOtherTeam(solo, only, { channel: "solo" })).not.toThrow();
    expect(() => rejectOtherTeam(solo, only, { channel: "anything-else" })).not.toThrow();
  });
});
