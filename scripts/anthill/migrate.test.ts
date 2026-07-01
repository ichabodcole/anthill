import { describe, expect, test } from "bun:test";
import {
  isRedundantDefaultPaths,
  type MigrationOp,
  migrationsBetween,
  pendingMigrations,
  planV1ToV2,
  type RepoScan,
} from "./migrate.ts";

const V1_DEFAULT: RepoScan = {
  version: 1,
  pathsExplicit: false,
  teamDir: "docs/team",
  docsEntries: ["README.md", "paper-cuts.md", "dev"],
  configDir: ".team",
  gitignore: "node_modules\n.team/scratch/\n",
  keepPaths: false,
};

describe("planV1ToV2 — default layout (no paths override)", () => {
  const plan = planV1ToV2(V1_DEFAULT);

  test("declares the v1 → v2 transition", () => {
    expect(plan.from).toBe(1);
    expect(plan.to).toBe(2);
  });

  test("relocates config + every docs entry, swaps gitignore, removes vacated dirs, stamps", () => {
    expect(plan.ops).toEqual([
      { kind: "git-mv", from: ".team/config.json", to: ".anthill/config.json" },
      { kind: "git-mv", from: "docs/team/README.md", to: ".anthill/README.md" },
      { kind: "git-mv", from: "docs/team/paper-cuts.md", to: ".anthill/paper-cuts.md" },
      { kind: "git-mv", from: "docs/team/dev", to: ".anthill/dev" },
      { kind: "rm", path: "docs/team" },
      { kind: "gitignore", remove: ".team/scratch/", add: ".anthill/scratch/" },
      { kind: "rm", path: ".team" },
      { kind: "stamp-version", file: ".anthill/config.json", version: 2 },
    ]);
  });

  test("notes summarize the moves, including the entry count", () => {
    expect(plan.notes.some((n) => n.includes("3 entries"))).toBe(true);
    expect(plan.notes.some((n) => n.includes("stamped version → 2"))).toBe(true);
  });
});

describe("planV1ToV2 — bespoke paths override (genuine escape hatch)", () => {
  // A NON-default location the team deliberately chose → honored, docs left in place.
  const plan = planV1ToV2({ ...V1_DEFAULT, pathsExplicit: true, teamDir: "team-docs" });

  test("moves only the config dir — living docs stay put", () => {
    expect(plan.ops).toEqual([
      { kind: "git-mv", from: ".team/config.json", to: ".anthill/config.json" },
      { kind: "gitignore", remove: ".team/scratch/", add: ".anthill/scratch/" },
      { kind: "rm", path: ".team" },
      { kind: "stamp-version", file: ".anthill/config.json", version: 2 },
    ]);
  });

  test("no op touches the living-docs dir; a note explains the override was honored", () => {
    const touchesDocs = (o: MigrationOp) =>
      (o.kind === "git-mv" && o.from.startsWith("team-docs")) ||
      (o.kind === "rm" && o.path === "team-docs");
    expect(plan.ops.some(touchesDocs)).toBe(false);
    expect(plan.notes.some((n) => /bespoke location/.test(n))).toBe(true);
  });
});

describe("planV1ToV2 — redundant-default paths override (the media-buffet trap)", () => {
  // `paths` is set, but it just spells out the v1 default `docs/team` — non-deliberate.
  const scan: RepoScan = { ...V1_DEFAULT, pathsExplicit: true, teamDir: "docs/team" };

  test("consolidates the docs anyway AND drops the redundant override", () => {
    const plan = planV1ToV2(scan);
    expect(plan.ops).toEqual([
      { kind: "git-mv", from: ".team/config.json", to: ".anthill/config.json" },
      { kind: "git-mv", from: "docs/team/README.md", to: ".anthill/README.md" },
      { kind: "git-mv", from: "docs/team/paper-cuts.md", to: ".anthill/paper-cuts.md" },
      { kind: "git-mv", from: "docs/team/dev", to: ".anthill/dev" },
      { kind: "rm", path: "docs/team" },
      { kind: "config-drop-paths", file: ".anthill/config.json" },
      { kind: "gitignore", remove: ".team/scratch/", add: ".anthill/scratch/" },
      { kind: "rm", path: ".team" },
      { kind: "stamp-version", file: ".anthill/config.json", version: 2 },
    ]);
    expect(plan.notes.some((n) => /just spelled out the v1 default/.test(n))).toBe(true);
    expect(plan.notes.some((n) => /--keep-paths/.test(n))).toBe(true);
  });

  test("--keep-paths honors it — docs stay, no drop-paths op", () => {
    const plan = planV1ToV2({ ...scan, keepPaths: true });
    expect(plan.ops.some((o) => o.kind === "config-drop-paths")).toBe(false);
    expect(plan.ops.some((o) => o.kind === "git-mv" && o.from.startsWith("docs/team"))).toBe(false);
    expect(plan.notes.some((n) => /kept per --keep-paths/.test(n))).toBe(true);
  });
});

describe("planV1ToV2 — already migrated", () => {
  test("a v2 scan is a clean no-op", () => {
    const plan = planV1ToV2({ ...V1_DEFAULT, version: 2 });
    expect(plan.ops).toEqual([]);
    expect(plan.from).toBe(2);
    expect(plan.to).toBe(2);
    expect(plan.notes[0]).toMatch(/already at v2/);
  });
});

describe("isRedundantDefaultPaths", () => {
  test("true only for the v1 default team dir", () => {
    expect(isRedundantDefaultPaths("docs/team")).toBe(true);
    expect(isRedundantDefaultPaths("team-docs")).toBe(false);
    expect(isRedundantDefaultPaths(".anthill")).toBe(false);
  });
});

describe("migration registry", () => {
  test("migrationsBetween chains in order and never skips", () => {
    expect(migrationsBetween(1, 2).map((m) => [m.from, m.to])).toEqual([[1, 2]]);
    expect(migrationsBetween(2, 2)).toEqual([]);
    // No 2→3 migration exists yet → the chain stops at the gap rather than skipping.
    expect(migrationsBetween(1, 3).map((m) => [m.from, m.to])).toEqual([[1, 2]]);
  });

  test("pendingMigrations targets the plugin's CURRENT_VERSION", () => {
    expect(pendingMigrations(1).map((m) => [m.from, m.to])).toEqual([[1, 2]]);
    expect(pendingMigrations(2)).toEqual([]);
  });
});
