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
  resolveConfig,
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
  const cfg = resolveConfig(FULL_CONFIG, { projectRoot: ROOT, configPath: `${ROOT}/.team/config.json` });

  test("resolves scalars", () => {
    expect(cfg.version).toBe(1);
    expect(cfg.channel).toBe("myproject");
    expect(cfg.lead).toBe("maestro");
    expect(cfg.launch).toBe('claude "/anthill:join {handle}"');
    expect(cfg.configPath).toBe(`${ROOT}/.team/config.json`);
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
    expect(cfg.defaultSpawnSet().map((s) => s.handle)).toEqual(["fathom", "mosaic", "loom", "prism"]);
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

  test("paths default to docs/team conventions", () => {
    expect(cfg.paths).toEqual({ ...DEFAULT_PATHS });
    expect(cfg.seatDocPath("worker")).toBe(resolve(ROOT, "docs/team/dev/worker.md"));
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
    expect(() => resolveConfig({ channel: "x" }, { projectRoot: ROOT })).toThrow(/seats is required/);
    expect(() => resolveConfig({ channel: "x", seats: [] }, { projectRoot: ROOT })).toThrow(
      /seats is required/,
    );
  });

  test("seat missing handle", () => {
    expect(() =>
      resolveConfig({ channel: "x", seats: [{ role: "engine", scope: "y" }] }, { projectRoot: ROOT }),
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

  test("finds .team/config.json walking up from a nested dir", () => {
    const found = findConfigFile(nested);
    expect(found.projectRoot).toBe(projectRoot);
    expect(found.configPath).toBe(resolve(projectRoot, CONFIG_REL_PATH));
  });

  test("loadConfig resolves from a nested cwd, projectRoot = config's dir", () => {
    const cfg = loadConfig(nested);
    expect(cfg.channel).toBe("tiny");
    expect(cfg.projectRoot).toBe(projectRoot);
    expect(cfg.seatDocPath("worker")).toBe(resolve(projectRoot, "docs/team/dev/worker.md"));
  });

  test("missing config -> clear error", () => {
    const orphan = mkdtempSync(resolve(tmpdir(), "anthill-noconfig-"));
    try {
      expect(() => findConfigFile(orphan)).toThrow(/could not find .team\/config\.json/);
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
