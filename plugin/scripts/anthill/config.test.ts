import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  CONFIG_REL_PATH,
  ConfigError,
  DEFAULT_GROUNDING,
  DEFAULT_LAUNCH,
  DEFAULT_PATHS,
  findConfigFile,
  loadConfig,
  loadProject,
  resolveConfig,
  resolveProject,
} from "./config.ts";

const ROOT = "/proj";

const FULL_CONFIG = {
  version: 1,
  channel: "myproject",
  lead: "maestro",
  seats: [
    { handle: "maestro", role: "lead", scope: "orchestration", spawn: false },
    { handle: "fathom", role: "engine", scope: "engine / goldens", spawn: true },
    { handle: "mosaic", role: "spine", scope: "wire layer", spawn: true },
    { handle: "loom", role: "surface", scope: "UI", spawn: true },
    { handle: "prism", role: "verify", scope: "integration/E2E", spawn: true },
  ],
  grounding: ["AGENTS.md", "docs/PROJECT-SUMMARY.md"],
  paths: { teamDir: "docs/team", seatDir: "docs/team/dev", seams: "docs/team/dev/seams.md" },
  launch: 'claude "/anthill:join {handle}"',
};

// Minimal config — only channel + seats. Everything else must default.
const MINIMAL_CONFIG = {
  channel: "tiny",
  seats: [
    { handle: "lead-ant", role: "lead", scope: "orchestration" },
    { handle: "worker", role: "engine", scope: "build", spawn: true },
  ],
};

describe("resolveConfig — full fixture", () => {
  const cfg = resolveConfig(FULL_CONFIG, {
    projectRoot: ROOT,
    configPath: `${ROOT}/.anthill/config.json`,
  });

  test("resolves scalars", () => {
    expect(cfg.version).toBe(1);
    expect(cfg.channel).toBe("myproject");
    expect(cfg.lead).toBe("maestro");
    expect(cfg.launch).toBe('claude "/anthill:join {handle}"');
    expect(cfg.configPath).toBe(`${ROOT}/.anthill/config.json`);
  });

  test("roster = seats, in order", () => {
    expect(cfg.roster().map((s) => s.handle)).toEqual([
      "maestro",
      "fathom",
      "mosaic",
      "loom",
      "prism",
    ]);
  });

  test("defaultSpawnSet = spawn:true seats in array order", () => {
    expect(cfg.defaultSpawnSet().map((s) => s.handle)).toEqual([
      "fathom",
      "mosaic",
      "loom",
      "prism",
    ]);
  });

  test("leadSeat + seat lookup", () => {
    expect(cfg.leadSeat()?.handle).toBe("maestro");
    expect(cfg.seat("loom")?.role).toBe("surface");
    expect(cfg.seat("nope")).toBeUndefined();
  });

  test("path resolvers are absolute under projectRoot", () => {
    expect(cfg.teamDirPath()).toBe(resolve(ROOT, "docs/team"));
    expect(cfg.seatDirPath()).toBe(resolve(ROOT, "docs/team/dev"));
    expect(cfg.seamsPath()).toBe(resolve(ROOT, "docs/team/dev/seams.md"));
    expect(cfg.seatDocPath("fathom")).toBe(resolve(ROOT, "docs/team/dev/fathom.md"));
  });
});

describe("resolveConfig — minimal fixture applies defaults", () => {
  const cfg = resolveConfig(MINIMAL_CONFIG, { projectRoot: ROOT });

  test("grounding defaults", () => {
    expect(cfg.grounding).toEqual([...DEFAULT_GROUNDING]);
  });

  test("paths default to .anthill conventions", () => {
    expect(cfg.paths).toEqual({ ...DEFAULT_PATHS });
    expect(cfg.seatDocPath("worker")).toBe(resolve(ROOT, ".anthill/dev/worker.md"));
  });

  test("launch + version default", () => {
    expect(cfg.launch).toBe(DEFAULT_LAUNCH);
    expect(cfg.version).toBe(1);
  });

  test("lead derived from the role:lead seat when no explicit lead", () => {
    expect(cfg.lead).toBe("lead-ant");
  });

  test("configPath empty for a pure (fs-less) resolve", () => {
    expect(cfg.configPath).toBe("");
  });
});

describe("resolveConfig — paths cascade from teamDir", () => {
  // The knobs existed; the derivation did not. Overriding `teamDir` alone left
  // `seatDir`/`seams` pointing at `.anthill/dev/…` — a config that reads as
  // coherent and resolves to two different teams' worth of locations.
  const withPaths = (paths: Record<string, string>) =>
    resolveConfig({ ...MINIMAL_CONFIG, paths }, { projectRoot: ROOT });

  test("no paths block resolves to the .anthill defaults (the back-compat guard)", () => {
    const cfg = resolveConfig(MINIMAL_CONFIG, { projectRoot: ROOT });
    expect(cfg.paths).toEqual({
      teamDir: ".anthill",
      seatDir: ".anthill/dev",
      seams: ".anthill/dev/seams.md",
    });
  });

  test("teamDir alone cascades into seatDir and seams", () => {
    const cfg = withPaths({ teamDir: ".anthill/teams/dev" });
    expect(cfg.paths).toEqual({
      teamDir: ".anthill/teams/dev",
      seatDir: ".anthill/teams/dev/dev",
      seams: ".anthill/teams/dev/dev/seams.md",
    });
  });

  test("an explicit seatDir wins, and seams follows IT — not teamDir", () => {
    const cfg = withPaths({ teamDir: ".anthill/teams/dev", seatDir: ".anthill/roles" });
    expect(cfg.paths.seatDir).toBe(".anthill/roles");
    expect(cfg.paths.seams).toBe(".anthill/roles/seams.md");
  });

  test("an explicit seams wins over the derivation", () => {
    const cfg = withPaths({ teamDir: "docs/team", seams: "docs/team/interfaces.md" });
    expect(cfg.paths.seams).toBe("docs/team/interfaces.md");
    expect(cfg.paths.seatDir).toBe("docs/team/dev");
  });

  test("all three explicit are all honoured verbatim", () => {
    const cfg = resolveConfig(FULL_CONFIG, { projectRoot: ROOT });
    expect(cfg.paths).toEqual({
      teamDir: "docs/team",
      seatDir: "docs/team/dev",
      seams: "docs/team/dev/seams.md",
    });
  });

  test("seatDir moves the seat doc with it", () => {
    const cfg = withPaths({ seatDir: ".anthill/roles" });
    expect(cfg.seatDocPath("worker")).toBe(resolve(ROOT, ".anthill/roles/worker.md"));
    expect(cfg.seamsPath()).toBe(resolve(ROOT, ".anthill/roles/seams.md"));
  });
});

describe("resolveConfig — validation errors", () => {
  test("non-object", () => {
    expect(() => resolveConfig(42, { projectRoot: ROOT })).toThrow(ConfigError);
    expect(() => resolveConfig(null, { projectRoot: ROOT })).toThrow(/JSON object/);
  });

  test("missing channel", () => {
    expect(() => resolveConfig({ seats: MINIMAL_CONFIG.seats }, { projectRoot: ROOT })).toThrow(
      /channel is required/,
    );
  });

  test("missing/empty seats", () => {
    expect(() => resolveConfig({ channel: "x" }, { projectRoot: ROOT })).toThrow(
      /seats is required/,
    );
    expect(() => resolveConfig({ channel: "x", seats: [] }, { projectRoot: ROOT })).toThrow(
      /seats is required/,
    );
  });

  test("seat missing handle", () => {
    expect(() =>
      resolveConfig(
        { channel: "x", seats: [{ role: "engine", scope: "y" }] },
        { projectRoot: ROOT },
      ),
    ).toThrow(/handle is required/);
  });

  test("duplicate seat handles", () => {
    expect(() =>
      resolveConfig(
        {
          channel: "x",
          seats: [
            { handle: "dup", role: "a", scope: "" },
            { handle: "dup", role: "b", scope: "" },
          ],
        },
        { projectRoot: ROOT },
      ),
    ).toThrow(/duplicate seat handle/);
  });
});

describe("findConfigFile + loadConfig — walk up from cwd", () => {
  const base = mkdtempSync(resolve(tmpdir(), "anthill-config-"));
  const projectRoot = resolve(base, "repo");
  const nested = resolve(projectRoot, "a", "b", "c");
  mkdirSync(resolve(projectRoot, CONFIG_REL_PATH, ".."), { recursive: true });
  mkdirSync(nested, { recursive: true });
  writeFileSync(resolve(projectRoot, CONFIG_REL_PATH), JSON.stringify(MINIMAL_CONFIG));

  afterAll(() => rmSync(base, { recursive: true, force: true }));

  test("finds .anthill/config.json walking up from a nested dir", () => {
    const found = findConfigFile(nested);
    expect(found.projectRoot).toBe(projectRoot);
    expect(found.configPath).toBe(resolve(projectRoot, CONFIG_REL_PATH));
  });

  test("loadConfig resolves from a nested cwd, projectRoot = config's dir", () => {
    const cfg = loadConfig(nested);
    expect(cfg.channel).toBe("tiny");
    expect(cfg.projectRoot).toBe(projectRoot);
    expect(cfg.seatDocPath("worker")).toBe(resolve(projectRoot, ".anthill/dev/worker.md"));
  });

  test("missing config -> clear error", () => {
    const orphan = mkdtempSync(resolve(tmpdir(), "anthill-noconfig-"));
    try {
      expect(() => findConfigFile(orphan)).toThrow(/could not find .anthill\/config\.json/);
    } finally {
      rmSync(orphan, { recursive: true, force: true });
    }
  });

  test("malformed JSON -> clear error", () => {
    const bad = mkdtempSync(resolve(tmpdir(), "anthill-badjson-"));
    try {
      mkdirSync(resolve(bad, CONFIG_REL_PATH, ".."), { recursive: true });
      writeFileSync(resolve(bad, CONFIG_REL_PATH), "{ not json ");
      expect(() => loadConfig(bad)).toThrow(/invalid JSON/);
    } finally {
      rmSync(bad, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// resolveProject — the v3 `teams` map, beside the v2 flat shape.
// ---------------------------------------------------------------------------

const V3_TWO_TEAMS = {
  version: 2,
  launch: 'claude "/anthill:join {handle}"',
  grounding: ["AGENTS.md"],
  gate: "bun run check",
  teams: {
    dev: {
      lead: "maestro",
      seats: [
        { handle: "maestro", role: "lead", scope: "orchestration" },
        { handle: "forager", role: "engine", scope: "the CLI", spawn: true },
      ],
      paths: { teamDir: ".anthill" },
    },
    "dev-lean": {
      lead: "boss",
      channel: "anthill-lean",
      seats: [
        { handle: "boss", role: "lead", scope: "orchestration" },
        { handle: "hand", role: "engine", scope: "everything", spawn: true },
      ],
      forkedFrom: "dev",
      forkedAt: "2026-08-09",
    },
  },
};

describe("resolveProject — a v2 flat config is a one-team project", () => {
  const project = resolveProject(MINIMAL_CONFIG, { projectRoot: ROOT });

  test("yields exactly one team, named `default`", () => {
    // Named, not derived from `channel`: AWS/Terraform/Docker all terminate on a
    // NAMED default, and it gives `anthill team use default` something to say.
    expect(project.teams).toHaveLength(1);
    expect(project.teams[0]?.name).toBe("default");
  });

  test("that team resolves IDENTICALLY to resolveConfig — same function, same answer", () => {
    const direct = resolveConfig(MINIMAL_CONFIG, { projectRoot: ROOT });
    const viaProject = project.teams[0];
    expect(viaProject?.channel).toBe(direct.channel);
    expect(viaProject?.paths).toEqual(direct.paths);
    expect(viaProject?.grounding).toEqual(direct.grounding);
    expect(viaProject?.launch).toBe(direct.launch);
    expect(viaProject?.roster()).toEqual(direct.roster());
    expect(viaProject?.seatDocPath("worker")).toBe(direct.seatDocPath("worker"));
  });

  test("teamDir stays `.anthill` — a single-team project sees NO change", () => {
    expect(project.teams[0]?.paths.teamDir).toBe(".anthill");
  });

  test("`team()` mirrors `seat()` — found by name, undefined otherwise", () => {
    expect(project.team("default")?.channel).toBe("tiny");
    expect(project.team("nope")).toBeUndefined();
  });
});

describe("resolveProject — the v3 `teams` map", () => {
  const project = resolveProject(V3_TWO_TEAMS, { projectRoot: ROOT });

  test("maps every entry, in config order", () => {
    expect(project.teams.map((t) => t.name)).toEqual(["dev", "dev-lean"]);
  });

  test("`channel` is OPTIONAL and defaults to the team name", () => {
    // So `{"teams": {"dev": {lead, seats}, "dev-lean": {lead, seats}}}` is a
    // complete two-team config.
    expect(project.team("dev")?.channel).toBe("dev");
    expect(project.team("dev-lean")?.channel).toBe("anthill-lean");
  });

  test("teamDir defaults to `.anthill/teams/<name>`, and an entry override wins", () => {
    // The incumbent team carries an explicit `.anthill` so its existing docs are
    // not orphaned by the new default — zero file moves.
    expect(project.team("dev")?.paths.teamDir).toBe(".anthill");
    expect(project.team("dev-lean")?.paths.teamDir).toBe(".anthill/teams/dev-lean");
    expect(project.team("dev-lean")?.paths.seatDir).toBe(".anthill/teams/dev-lean/dev");
  });

  test("project-level version / launch / grounding / gate cascade into every team", () => {
    for (const team of project.teams) {
      expect(team.version).toBe(2);
      expect(team.launch).toBe('claude "/anthill:join {handle}"');
      expect(team.grounding).toEqual(["AGENTS.md"]);
      expect(team.gate).toBe("bun run check");
    }
  });

  test("an entry overrides what it names, and inherits the rest", () => {
    const p = resolveProject(
      {
        gate: "bun run check",
        grounding: ["AGENTS.md"],
        teams: {
          a: { seats: MINIMAL_CONFIG.seats },
          b: { seats: MINIMAL_CONFIG.seats, gate: "bun test", grounding: ["README.md"] },
        },
      },
      { projectRoot: ROOT },
    );
    expect(p.team("a")?.gate).toBe("bun run check");
    expect(p.team("b")?.gate).toBe("bun test");
    expect(p.team("b")?.grounding).toEqual(["README.md"]);
  });

  test("lineage is carried through for `anthill team ls`", () => {
    expect(project.team("dev-lean")?.forkedFrom).toBe("dev");
    expect(project.team("dev-lean")?.forkedAt).toBe("2026-08-09");
    expect(project.team("dev")?.forkedFrom).toBeUndefined();
  });

  test("NO version is stamped — the shape is detected structurally", () => {
    // `version` means FOOTPRINT LAYOUT (`migrate.ts:14-17`). Overloading it with
    // schema shape would make `team-migrate` report "already at v3" while
    // CURRENT_VERSION is 2 — reading as "ahead of the plugin" when nothing moved
    // on disk. AWS has carried `[default]` beside `[profile foo]` for a decade
    // with no version field at all.
    expect(project.teams.every((t) => t.version === 2)).toBe(true);
  });
});

describe("resolveProject — shape validation", () => {
  test("an empty `teams` map is an error, not a project with no teams", () => {
    expect(() => resolveProject({ teams: {} }, { projectRoot: ROOT })).toThrow(/at least one team/);
  });

  test("`teams` beside top-level `seats`/`channel` throws, naming both", () => {
    // The conversion hazard: someone adds `teams` and forgets to delete the flat
    // keys. Silently ignoring them makes the incumbent team VANISH — and an
    // empty/missing team is the one outcome this project must never produce.
    expect(() =>
      resolveProject(
        { ...MINIMAL_CONFIG, teams: { dev: { seats: MINIMAL_CONFIG.seats } } },
        {
          projectRoot: ROOT,
        },
      ),
    ).toThrow(/both.*teams.*channel|channel.*teams/is);
  });

  test("a team entry must still be a valid team", () => {
    expect(() => resolveProject({ teams: { dev: { seats: [] } } }, { projectRoot: ROOT })).toThrow(
      /seats is required/,
    );
  });

  test("the error names WHICH team failed", () => {
    expect(() =>
      resolveProject(
        { teams: { ok: { seats: MINIMAL_CONFIG.seats }, bad: {} } },
        {
          projectRoot: ROOT,
        },
      ),
    ).toThrow(/bad/);
  });
});

describe("loadProject — the fs entrypoint, beside loadConfig", () => {
  const base = mkdtempSync(resolve(tmpdir(), "anthill-project-"));
  afterAll(() => rmSync(base, { recursive: true, force: true }));

  const write = (dir: string, config: unknown): string => {
    const root = resolve(base, dir);
    mkdirSync(resolve(root, CONFIG_REL_PATH, ".."), { recursive: true });
    writeFileSync(resolve(root, CONFIG_REL_PATH), JSON.stringify(config));
    return root;
  };

  test("a v2 flat config on disk loads as a one-team project", () => {
    const root = write("flat", MINIMAL_CONFIG);
    const project = loadProject(root);
    expect(project.teams.map((t) => t.name)).toEqual(["default"]);
    expect(project.projectRoot).toBe(root);
    expect(project.configPath).toBe(resolve(root, CONFIG_REL_PATH));
    // Byte-for-byte the same team `loadConfig` returns.
    expect(project.teams[0]?.seatDocPath("worker")).toBe(loadConfig(root).seatDocPath("worker"));
  });

  test("a v3 config loads every team, with paths anchored at the project root", () => {
    const root = write("multi", V3_TWO_TEAMS);
    const project = loadProject(root);
    expect(project.teams.map((t) => t.name)).toEqual(["dev", "dev-lean"]);
    expect(project.team("dev")?.teamDirPath()).toBe(resolve(root, ".anthill"));
    expect(project.team("dev-lean")?.teamDirPath()).toBe(resolve(root, ".anthill/teams/dev-lean"));
  });

  test("walks up from a nested cwd, exactly as loadConfig does", () => {
    const root = write("nested", V3_TWO_TEAMS);
    const deep = resolve(root, "packages", "app", "src");
    mkdirSync(deep, { recursive: true });
    expect(loadProject(deep).projectRoot).toBe(root);
  });
});

describe("resolveProject — cross-team validation (the checks one team cannot need)", () => {
  const twoTeams = (a: Record<string, unknown>, b: Record<string, unknown>) =>
    resolveProject(
      {
        teams: {
          alpha: { seats: MINIMAL_CONFIG.seats, ...a },
          beta: { seats: MINIMAL_CONFIG.seats, ...b },
        },
      },
      { projectRoot: ROOT },
    );

  test("a team name must be shell-safe — it becomes a session key prefix", () => {
    // `SAFE_SESSION_KEY` in team-spawn.ts: the name reaches a shell prefix.
    expect(() =>
      resolveProject(
        { teams: { "dev; rm -rf /": { seats: MINIMAL_CONFIG.seats } } },
        {
          projectRoot: ROOT,
        },
      ),
    ).toThrow(/dev; rm -rf \//);
    expect(() =>
      resolveProject(
        { teams: { "sane-name_1.2": { seats: MINIMAL_CONFIG.seats } } },
        {
          projectRoot: ROOT,
        },
      ),
    ).not.toThrow();
  });

  test("two teams cannot share a channel — it is the log's filename", () => {
    expect(() => twoTeams({ channel: "same" }, { channel: "same" })).toThrow(/beta/);
    expect(() => twoTeams({ channel: "same" }, { channel: "same" })).toThrow(/channel/i);
  });

  test("channels must be PREFIX-FREE, which is stricter than merely unique", () => {
    // `relatedSessions` (team-attach.ts) treats `<channel>-<suffix>` as the SAME
    // team's sibling session, so `anthill-dev` + `anthill-dev-lean` would put a
    // fork's panes in its parent's attach menu.
    expect(() => twoTeams({ channel: "anthill-dev" }, { channel: "anthill-dev-lean" })).toThrow(
      /prefix/i,
    );
    // The reverse order is the same defect and must also throw.
    expect(() => twoTeams({ channel: "anthill-dev-lean" }, { channel: "anthill-dev" })).toThrow(
      /prefix/i,
    );
    // A shared prefix that is not a SEGMENT boundary is fine — `relatedSessions`
    // only folds on `<base>-`.
    expect(() => twoTeams({ channel: "devteam" }, { channel: "devlean" })).not.toThrow();
  });

  test("each cross-team error names the offending team", () => {
    expect(() => twoTeams({ channel: "x" }, { channel: "x" })).toThrow(/alpha|beta/);
  });

  test("a single team is never subject to a cross-team check", () => {
    // Criterion 1: a single-team project sees zero change. A lone team cannot
    // collide with itself, and nothing here may fire on the v2 flat path.
    expect(() => resolveProject(MINIMAL_CONFIG, { projectRoot: ROOT })).not.toThrow();
    expect(() => resolveProject(FULL_CONFIG, { projectRoot: ROOT })).not.toThrow();
  });
});

describe("resolveProject — two teams may not share a living-docs directory", () => {
  const seats = MINIMAL_CONFIG.seats;

  test("A: two explicit teamDirs that are identical", () => {
    // The directory is where the DURABLE knowledge lives, and the default
    // `.anthill/teams/<name>` is distinct by construction — so the one team that
    // must escape it, the incumbent carrying an explicit `.anthill`, is the one
    // nothing checked. Both teams' seat docs, seams and comms land on each other.
    expect(() =>
      resolveProject(
        {
          teams: {
            dev: { seats, paths: { teamDir: ".anthill" } },
            lean: { seats, paths: { teamDir: ".anthill" } },
          },
        },
        { projectRoot: ROOT },
      ),
    ).toThrow(/lean|dev/);
    expect(() =>
      resolveProject(
        {
          teams: {
            dev: { seats, paths: { teamDir: ".anthill" } },
            lean: { seats, paths: { teamDir: ".anthill" } },
          },
        },
        { projectRoot: ROOT },
      ),
    ).toThrow(/director(y|ies)|teamDir/i);
  });

  test("A': a collision only in seatDir or seams is equally fatal", () => {
    // Distinct teamDirs are not enough — the seat layer is separately overridable.
    expect(() =>
      resolveProject(
        {
          teams: {
            dev: { seats, paths: { teamDir: ".anthill/a", seatDir: ".anthill/shared" } },
            lean: { seats, paths: { teamDir: ".anthill/b", seatDir: ".anthill/shared" } },
          },
        },
        { projectRoot: ROOT },
      ),
    ).toThrow(/seatDir/i);
  });

  test("B: `..` is a legal SAFE_TEAM_NAME and a directory traversal", () => {
    // The regex was inherited from SAFE_SESSION_KEY, which guards a tmux session
    // key — `.` and `..` are unremarkable there and load-bearing in a path.
    // `..` resolves seatDir to `.anthill/teams/../dev` = `.anthill/dev`, the
    // incumbent's seat dir — and it does NOT collide with any OTHER configured
    // team, so the equality check above cannot catch it.
    expect(() => resolveProject({ teams: { "..": { seats } } }, { projectRoot: ROOT })).toThrow(
      /\.\./,
    );
    expect(() => resolveProject({ teams: { ".": { seats } } }, { projectRoot: ROOT })).toThrow(
      ConfigError,
    );
  });

  test("a dot INSIDE a name stays legal — only the traversal segments are refused", () => {
    expect(() =>
      resolveProject(
        { teams: { "v1.2": { seats }, "dev.lean": { seats } } },
        { projectRoot: ROOT },
      ),
    ).not.toThrow();
  });

  test("the INTENDED nesting is not rejected — equality, never prefix-free", () => {
    // The opposite of the channel rule. Teams nest by design: the incumbent sits
    // at `.anthill` and every other team at `.anthill/teams/<name>`, so `.anthill`
    // is a prefix of all of them. Reusing 1.2's prefix check here would reject the
    // layout the design requires.
    expect(() =>
      resolveProject(
        { teams: { dev: { seats, paths: { teamDir: ".anthill" } }, lean: { seats } } },
        { projectRoot: ROOT },
      ),
    ).not.toThrow();
  });
});
