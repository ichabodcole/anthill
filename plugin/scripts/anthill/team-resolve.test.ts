import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { ConfigError, type ResolvedProject, resolveProject } from "./config.ts";
import {
  AmbiguousTeamError,
  PIN_REL_PATH,
  readPin,
  resolveTeam,
  writePin,
} from "./team-resolve.ts";

const ROOT = "/proj";
const SEATS = [
  { handle: "lead-ant", role: "lead", scope: "orchestration" },
  { handle: "worker", role: "engine", scope: "build", spawn: true },
];

const oneTeam = (): ResolvedProject =>
  resolveProject({ channel: "solo", seats: SEATS }, { projectRoot: ROOT });

const twoTeams = (): ResolvedProject =>
  resolveProject(
    { teams: { dev: { seats: SEATS }, lean: { seats: SEATS } } },
    { projectRoot: ROOT },
  );

describe("resolveTeam — rung 1: the --team flag", () => {
  test("selects the named team", () => {
    expect(resolveTeam(twoTeams(), { team: "lean" }).team.name).toBe("lean");
  });

  test("THROWS on a name that is not configured — never falls through", () => {
    // No fallback at any rung. The alternative to throwing is an empty
    // roster/board/channel, and an empty team is what a lead is trained to read
    // as "my seats are missing".
    expect(() => resolveTeam(twoTeams(), { team: "nope" })).toThrow(ConfigError);
    expect(() => resolveTeam(twoTeams(), { team: "nope" })).toThrow(/nope/);
  });

  test("outranks the env and the pin", () => {
    const project = twoTeams();
    expect(
      resolveTeam(project, { team: "lean", env: { ANTHILL_TEAM: "dev" }, pin: "dev" }).team.name,
    ).toBe("lean");
  });
});

describe("resolveTeam — rung 2: ANTHILL_TEAM", () => {
  test("selects the named team", () => {
    expect(resolveTeam(twoTeams(), { env: { ANTHILL_TEAM: "lean" } }).team.name).toBe("lean");
  });

  test("THROWS on a name that is not configured", () => {
    expect(() => resolveTeam(twoTeams(), { env: { ANTHILL_TEAM: "ghost" } })).toThrow(/ghost/);
  });

  test("outranks the pin", () => {
    expect(resolveTeam(twoTeams(), { env: { ANTHILL_TEAM: "lean" }, pin: "dev" }).team.name).toBe(
      "lean",
    );
  });

  test("an empty or whitespace value is treated as unset, not as a team named ''", () => {
    // An exported-but-empty env var is the shell's normal way of saying "not
    // set"; reading it as a name would throw on a config that is otherwise fine.
    expect(resolveTeam(twoTeams(), { env: { ANTHILL_TEAM: "" }, pin: "dev" }).team.name).toBe(
      "dev",
    );
    expect(resolveTeam(twoTeams(), { env: { ANTHILL_TEAM: "  " }, pin: "dev" }).team.name).toBe(
      "dev",
    );
  });
});

describe("resolveTeam — rung 3: the pin", () => {
  test("selects the pinned team", () => {
    expect(resolveTeam(twoTeams(), { pin: "lean" }).team.name).toBe("lean");
  });

  test("THROWS on a stale pin — never silently retargets", () => {
    // kubectl's semantics, and correct: a found pin is never second-guessed.
    // The config enumerates every legal team, so a stale or copied pin fails the
    // same registry lookup.
    expect(() => resolveTeam(twoTeams(), { pin: "deleted-team" })).toThrow(/deleted-team/);
  });

  test("a stale pin throws even when exactly one team is configured", () => {
    // The single-team fast path is rung 4 — BELOW the pin. Letting it rescue a
    // stale pin would make the pin advisory, and "the pin is sometimes obeyed" is
    // worse than either always or never.
    expect(() => resolveTeam(oneTeam(), { pin: "ghost" })).toThrow(/ghost/);
  });
});

describe("resolveTeam — rung 4: the single-team fast path", () => {
  test("one configured team resolves with nothing set — this is criterion 1", () => {
    const { team } = resolveTeam(oneTeam(), {});
    expect(team.name).toBe("default");
    expect(team.channel).toBe("solo");
  });

  test("an empty env object and a bare call agree", () => {
    expect(resolveTeam(oneTeam(), { env: {} }).team.name).toBe("default");
  });
});

describe("resolveTeam — rung 5: ambiguity is a HARD ERROR", () => {
  test("two teams and nothing set THROWS, and the message lists every team", () => {
    // The test that matters most. The alternative — picking one, or returning an
    // empty team — is the failure this whole layer exists to prevent.
    expect(() => resolveTeam(twoTeams(), {})).toThrow(ConfigError);
    const message = (() => {
      try {
        resolveTeam(twoTeams(), {});
        return "";
      } catch (err) {
        return (err as Error).message;
      }
    })();
    expect(message).toContain("dev");
    expect(message).toContain("lean");
  });

  test("the message names how to choose, not just that you must", () => {
    const message = (() => {
      try {
        resolveTeam(twoTeams(), {});
        return "";
      } catch (err) {
        return (err as Error).message;
      }
    })();
    expect(message).toMatch(/--team|anthill team use/);
  });
});

describe("resolveTeam — which rung answered", () => {
  test("reports the rung, so a wrong ambient binding is visible rather than silent", () => {
    expect(resolveTeam(twoTeams(), { team: "dev" }).via).toBe("flag");
    expect(resolveTeam(twoTeams(), { env: { ANTHILL_TEAM: "dev" } }).via).toBe("env");
    expect(resolveTeam(twoTeams(), { pin: "dev" }).via).toBe("pin");
    expect(resolveTeam(oneTeam(), {}).via).toBe("sole");
  });
});

describe("the pin file", () => {
  const base = mkdtempSync(join(tmpdir(), "anthill-pin-"));
  afterAll(() => rmSync(base, { recursive: true, force: true }));

  const freshRoot = (name: string): string => {
    const root = resolve(base, name);
    mkdirSync(join(root, ".anthill"), { recursive: true });
    return root;
  };

  test("lives beside config.json, NOT under any teamDir", () => {
    // A file that SELECTS between teamDirs cannot live inside one.
    expect(PIN_REL_PATH).toBe(".anthill/current-team");
  });

  test("round-trips: one line, the team name, trailing newline", () => {
    const root = freshRoot("roundtrip");
    writePin(root, "lean");
    expect(readFileSync(join(root, PIN_REL_PATH), "utf8")).toBe("lean\n");
    expect(readPin(root)).toBe("lean");
  });

  test("absent pin reads as undefined, not as an error or an empty name", () => {
    expect(readPin(freshRoot("nopin"))).toBeUndefined();
  });

  test("a blank or whitespace-only pin file reads as undefined", () => {
    const root = freshRoot("blank");
    writeFileSync(join(root, PIN_REL_PATH), "\n");
    expect(readPin(root)).toBeUndefined();
  });

  test("trailing whitespace in a hand-edited pin is tolerated", () => {
    const root = freshRoot("handedited");
    writeFileSync(join(root, PIN_REL_PATH), "  lean  \n\n");
    expect(readPin(root)).toBe("lean");
  });

  test("writePin creates .anthill/ if a bare repo somehow lacks it", () => {
    const root = resolve(base, "bare");
    mkdirSync(root, { recursive: true });
    writePin(root, "dev");
    expect(existsSync(join(root, PIN_REL_PATH))).toBe(true);
  });

  test("writePin overwrites rather than appending", () => {
    const root = freshRoot("overwrite");
    writePin(root, "dev");
    writePin(root, "lean");
    expect(readFileSync(join(root, PIN_REL_PATH), "utf8")).toBe("lean\n");
  });
});

describe("ambiguity is a TYPE, not a message", () => {
  // `anthill team ls` renders the team list on rung 5 and exits on every other
  // failure. That branch was written as `/nothing selected one/.test(message)`,
  // and the coupling was MEASURED: rewording the sentence left the whole suite at
  // 0 fail while `team ls` started refusing to list a two-team repo. These
  // assertions are what makes the sentence free to change again.

  test("rung 5 throws AmbiguousTeamError", () => {
    expect(() => resolveTeam(twoTeams(), {})).toThrow(AmbiguousTeamError);
  });

  test("a BAD name at any rung is NOT ambiguity — it is a typo to report", () => {
    // The distinction the branch depends on. If these ever became
    // `AmbiguousTeamError`, `ls` would silently render a list instead of naming
    // the bad flag, which is the same class of wrong answer in the other
    // direction.
    for (const sel of [
      { team: "nope" },
      { env: { ANTHILL_TEAM: "ghost" } },
      { pin: "deleted-team" },
    ]) {
      expect(() => resolveTeam(twoTeams(), sel)).toThrow(ConfigError);
      expect(() => resolveTeam(twoTeams(), sel)).not.toThrow(AmbiguousTeamError);
    }
  });

  test("it is still a ConfigError, so every existing catch keeps working", () => {
    expect(() => resolveTeam(twoTeams(), {})).toThrow(ConfigError);
  });
});
