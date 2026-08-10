/**
 * `anthill init` ON A MULTI-TEAM PROJECT — the CLI level, because that is the
 * only level where the defect lived.
 *
 * `renderTemplates`/`templateDestination` are pure and were already green while
 * the command REFUSED TO RUN AT ALL: `init` routed through `requireConfig`, so a
 * two-team repo with no pin exited 1 before a template was ever read. That is
 * the whole bug — the render was never wrong, it never happened — and no test
 * over the pure half can see it. Found by executing `bootstrap` §0a literally
 * against a real repo; pinned here so the route stays executable.
 *
 * CLEANUP: one module-level `mkdtempSync` + `afterAll(rmSync)` (see
 * `tmpleak.guard.test.ts`).
 */

import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const CLI = resolve(import.meta.dir, "..", "cli.ts");
const ROOT = mkdtempSync(join(tmpdir(), "anthill-init-multi-"));
afterAll(() => rmSync(ROOT, { recursive: true, force: true }));

/** The shape `bootstrap` §0a tells a human to convert an existing repo INTO. */
const TWO_TEAMS = {
  version: 2,
  launch: 'claude "/anthill:join {handle}"',
  grounding: ["AGENTS.md"],
  gate: "bun run check",
  teams: {
    dev: {
      channel: "myproject",
      lead: "maestro",
      seats: [
        { handle: "maestro", role: "lead", scope: "orchestration" },
        { handle: "forager", role: "engine", scope: "the CLI", spawn: true },
      ],
      // The incumbent keeps the flat layout it was bootstrapped with.
      paths: { teamDir: ".anthill" },
    },
    // No `channel`: it defaults to the team name, which is what §0a tells the
    // human to leave alone. ("myproject-lean" would be REFUSED — channels must be
    // prefix-free, and `anthill attach` is why.)
    lean: {
      lead: "boss",
      seats: [
        { handle: "boss", role: "lead", scope: "orchestration" },
        { handle: "hand", role: "engine", scope: "everything", spawn: true },
      ],
    },
  },
};

function repo(name: string): string {
  const dir = join(ROOT, name);
  mkdirSync(join(dir, ".anthill"), { recursive: true });
  writeFileSync(join(dir, ".anthill/config.json"), JSON.stringify(TWO_TEAMS, null, 2));
  return dir;
}

function init(cwd: string, ...args: string[]): { code: number; json: Record<string, unknown> } {
  const r = Bun.spawnSync(["bun", CLI, "init", "--format", "json", ...args], {
    cwd,
    // A stray ANTHILL_TEAM in the runner's env is rung 2 and would silently make
    // every "nothing selected one" case a one-team case.
    env: { ...process.env, ANTHILL_TEAM: "" },
  });
  // Errors go to stderr, successes to stdout — read both, or a refusal reads as
  // empty output and the assertion fails for the wrong reason.
  const out = `${r.stdout.toString()}${r.stderr.toString()}`.trim();
  return { code: r.exitCode ?? -1, json: JSON.parse(out.split("\n").at(-1) as string) };
}

describe("`anthill init` with nothing selecting a team", () => {
  test("renders EVERY configured team rather than refusing", () => {
    const dir = repo("all");
    const { code, json } = init(dir);
    expect({ code, ok: json.ok }).toEqual({ code: 0, ok: true });

    const data = json.data as { teams: Array<{ name: string; teamDir: string }> };
    expect(data.teams).toEqual([
      { name: "dev", teamDir: ".anthill" },
      { name: "lean", teamDir: ".anthill/teams/lean" },
    ]);

    // Each team's seats, under its own dir — the point of the route.
    expect(existsSync(join(dir, ".anthill/dev/forager.md"))).toBe(true);
    expect(existsSync(join(dir, ".anthill/teams/lean/dev/hand.md"))).toBe(true);
  });

  test("ignores BOTH teams' local state — the second team's log is not covered by the first's", () => {
    const dir = repo("ignore");
    init(dir);
    const ignore = readFileSync(join(dir, ".gitignore"), "utf8").split("\n");
    for (const line of [
      ".anthill/scratch/",
      ".anthill/comms",
      ".anthill/teams/lean/scratch/",
      ".anthill/teams/lean/comms",
      ".bounty-session",
      ".anthill/current-team",
    ]) {
      expect({ line, ignored: ignore.includes(line) }).toEqual({ line, ignored: true });
    }
  });

  test("does not clobber the incumbent team's accumulated docs", () => {
    const dir = repo("incumbent");
    init(dir);
    const seat = join(dir, ".anthill/dev/forager.md");
    writeFileSync(seat, "HARD-WON KNOWLEDGE");
    const { json } = init(dir);
    expect(readFileSync(seat, "utf8")).toBe("HARD-WON KNOWLEDGE");
    expect((json.data as { written: string[] }).written).toEqual([]);
  });
});

describe("a selector still narrows", () => {
  test("`--team lean` renders only lean", () => {
    const dir = repo("narrow");
    const { json } = init(dir, "--team", "lean");
    const data = json.data as { teams: Array<{ name: string }>; written: string[] };
    expect(data.teams.map((t) => t.name)).toEqual(["lean"]);
    expect(data.written.every((p) => p.startsWith(".anthill/teams/lean/"))).toBe(true);
    expect(existsSync(join(dir, ".anthill/dev/forager.md"))).toBe(false);
  });

  test("a --team that names no configured team still HARD-ERRORS", () => {
    // The rescue is scoped to ambiguity alone. A named-but-absent team is the
    // ladder's other failure and must not be widened into "render everything".
    const dir = repo("bogus");
    const { code, json } = init(dir, "--team", "nope");
    expect({ code, ok: json.ok }).toEqual({ code: 1, ok: false });
    expect(String(json.error)).toContain("not configured");
    expect(existsSync(join(dir, ".anthill/dev"))).toBe(false);
  });
});
