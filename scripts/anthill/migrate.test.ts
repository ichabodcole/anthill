import { describe, expect, test } from "bun:test";
import {
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

describe("planV1ToV2 — paths override (escape hatch)", () => {
  const plan = planV1ToV2({ ...V1_DEFAULT, pathsExplicit: true });

  test("moves only the config dir — living docs are left in place", () => {
    expect(plan.ops).toEqual([
      { kind: "git-mv", from: ".team/config.json", to: ".anthill/config.json" },
      { kind: "gitignore", remove: ".team/scratch/", add: ".anthill/scratch/" },
      { kind: "rm", path: ".team" },
      { kind: "stamp-version", file: ".anthill/config.json", version: 2 },
    ]);
  });

  test("no op touches the living-docs dir", () => {
    const touchesDocs = (o: MigrationOp) =>
      (o.kind === "git-mv" && o.from.startsWith("docs/team")) ||
      (o.kind === "rm" && o.path === "docs/team");
    expect(plan.ops.some(touchesDocs)).toBe(false);
  });

  test("a note explains the override was respected", () => {
    expect(plan.notes.some((n) => /paths override/.test(n))).toBe(true);
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
