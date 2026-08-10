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

/** The same project a session or two later: `lean` pinned, `research` just added. */
const THREE_TEAMS = {
  ...TWO_TEAMS,
  teams: {
    ...TWO_TEAMS.teams,
    research: {
      lead: "scout",
      seats: [
        { handle: "scout", role: "lead", scope: "orchestration" },
        { handle: "reader", role: "analyst", scope: "the literature", spawn: true },
      ],
    },
  },
};

function repo(name: string, config: unknown = TWO_TEAMS, pin?: string): string {
  const dir = join(ROOT, name);
  mkdirSync(join(dir, ".anthill"), { recursive: true });
  writeFileSync(join(dir, ".anthill/config.json"), JSON.stringify(config, null, 2));
  if (pin) writeFileSync(join(dir, ".anthill/current-team"), `${pin}\n`);
  return dir;
}

function init(cwd: string, ...args: string[]): { code: number; json: Record<string, unknown> };
function init(
  opts: { cwd: string; env?: Record<string, string> },
  ...args: string[]
): { code: number; json: Record<string, unknown> };
function init(
  target: string | { cwd: string; env?: Record<string, string> },
  ...args: string[]
): { code: number; json: Record<string, unknown> } {
  const { cwd, env } = typeof target === "string" ? { cwd: target, env: undefined } : target;
  const r = Bun.spawnSync(["bun", CLI, "init", "--format", "json", ...args], {
    cwd,
    // A stray ANTHILL_TEAM in the runner's env is rung 2, so it must be cleared
    // rather than inherited — otherwise the tests that assert it does NOT narrow
    // would be indistinguishable from tests that never set it.
    env: { ...process.env, ANTHILL_TEAM: "", ...env },
  });
  // Errors go to stderr, successes to stdout — read both, or a refusal reads as
  // empty output and the assertion fails for the wrong reason.
  const out = `${r.stdout.toString()}${r.stderr.toString()}`.trim();
  return { code: r.exitCode ?? -1, json: JSON.parse(out.split("\n").at(-1) as string) };
}

/** What `anthill team ls` says is configured — the CONFIG's answer, not init's. */
function teamLs(cwd: string): Array<{ name: string; teamDir: string }> {
  const r = Bun.spawnSync(["bun", CLI, "team", "ls", "--format", "json"], {
    cwd,
    env: { ...process.env, ANTHILL_TEAM: "" },
  });
  const json = JSON.parse(
    `${r.stdout.toString()}${r.stderr.toString()}`.trim().split("\n").at(-1) as string,
  );
  return (json.data as { teams: Array<{ name: string; teamDir: string }> }).teams;
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

describe("the AMBIENT rungs do not narrow — only an explicit --team does", () => {
  // 4.1 rescued the ambiguous case and left the pin in place, so the §0a route
  // worked exactly once: a repo that has ever run `anthill team use` has a pin
  // forever after, and every LATER add-a-team lands here instead. The observed
  // failure is not a refusal — it is `ok: true`, `written: []`, and a configured
  // team with no living docs at all, which is what `convene` then hands its seats.
  test("a pinned repo still renders a newly added team's docs", () => {
    const dir = repo("pinned", THREE_TEAMS, "lean");
    const { code, json } = init(dir);
    expect({ code, ok: json.ok }).toEqual({ code: 0, ok: true });

    const data = json.data as { teams: Array<{ name: string }>; written: string[] };
    expect(data.teams.map((t) => t.name)).toEqual(["dev", "lean", "research"]);
    expect(existsSync(join(dir, ".anthill/teams/research/dev/reader.md"))).toBe(true);
  });

  test("ANTHILL_TEAM does not narrow either", () => {
    // Rung 2 answers "which team am I operating AS" — it is exported into a
    // spawned seat's pane. `init` does not operate as a team.
    const dir = repo("env", THREE_TEAMS);
    const { json } = init({ cwd: dir, env: { ANTHILL_TEAM: "lean" } });
    const data = json.data as { teams: Array<{ name: string }> };
    expect(data.teams.map((t) => t.name)).toEqual(["dev", "lean", "research"]);
  });

  test("every team `team ls` shows appears in written-or-skipped, on both runs", () => {
    // The verification §0a now tells a human to do, asserted as a property: a
    // team that is rendered nowhere is exactly the empty-footprint outcome.
    //
    // ⚠ THE EXPECTED SET COMES FROM `team ls`, NOT FROM `init`'s OWN OUTPUT, and
    // that is the entire point. `init.data.teams` lists what it rendered, so
    // checking coverage against it is vacuous — the pinned bug satisfies it
    // perfectly, reporting one team and rendering that one team. `ls` reads the
    // CONFIG, which is the thing the rendering is supposed to cover.
    //
    // Checked on the SECOND run too, where every path lands in `skipped` — the run
    // that reports no writes is the one whose emptiness reads as fine.
    const dir = repo("covered", THREE_TEAMS, "lean");
    const configured = teamLs(dir);
    expect(configured.map((t) => t.name)).toEqual(["dev", "lean", "research"]);

    for (const run of [1, 2]) {
      const data = init(dir).json.data as { written: string[]; skipped: string[] };
      const touched = [...data.written, ...data.skipped];
      for (const t of configured) {
        expect({
          run,
          team: t.name,
          rendered: touched.some((p) => p === t.teamDir || p.startsWith(`${t.teamDir}/`)),
        }).toEqual({ run, team: t.name, rendered: true });
      }
    }
  });
});

describe("criterion 1 — a single-team project sees no change", () => {
  // "Render every team unless --team narrows" and "render the sole team" are the
  // same sentence when there is one team, which is what makes this safe. Asserted
  // rather than reasoned, because it is the claim the whole project rests on.
  const FLAT = {
    version: 2,
    channel: "myproject",
    lead: "maestro",
    grounding: ["AGENTS.md"],
    gate: "bun run check",
    seats: [
      { handle: "maestro", role: "lead", scope: "orchestration" },
      { handle: "forager", role: "engine", scope: "the CLI", spawn: true },
    ],
  };

  test("renders `.anthill/` and reports one team named `default`", () => {
    const dir = repo("flat", FLAT);
    const { code, json } = init(dir);
    expect({ code, ok: json.ok }).toEqual({ code: 0, ok: true });

    const data = json.data as {
      teams: Array<{ name: string; teamDir: string }>;
      written: string[];
    };
    expect(data.teams).toEqual([{ name: "default", teamDir: ".anthill" }]);
    expect(existsSync(join(dir, ".anthill/dev/forager.md"))).toBe(true);
    expect(existsSync(join(dir, ".anthill/teams"))).toBe(false);

    // The pre-multi-team gitignore set, exactly — nothing gained, nothing moved.
    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toBe(
      ".anthill/scratch/\n.anthill/comms\n.bounty-session\n.anthill/current-team\n",
    );
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
