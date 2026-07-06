import { describe, expect, it } from "bun:test";
import { resolveSpawnHandles } from "./team-spawn.ts";

// Config-driven: roster + defaultSpawn + lead come from config.ts now, not a
// hardcoded constant. The layered-app defaults: lead=maestro, build seats spawn.
const ROSTER = ["fathom", "loom", "maestro", "mosaic", "prism"];
const DEFAULT_SPAWN = ["fathom", "mosaic", "loom"];
const OPTS = { roster: ROSTER, defaultSpawn: DEFAULT_SPAWN, lead: "maestro" };

describe("resolveSpawnHandles", () => {
  it("defaults to the config spawn set when none requested (never the lead)", () => {
    expect(resolveSpawnHandles([], OPTS)).toEqual({ handles: DEFAULT_SPAWN });
    expect(DEFAULT_SPAWN).not.toContain("maestro");
  });

  it("resolves explicit handles, preserving request order", () => {
    expect(resolveSpawnHandles(["loom", "fathom"], OPTS)).toEqual({ handles: ["loom", "fathom"] });
  });

  it("dedupes repeated handles", () => {
    expect(resolveSpawnHandles(["loom", "loom"], OPTS)).toEqual({ handles: ["loom"] });
  });

  it("errors when the lead is explicitly requested", () => {
    const result = resolveSpawnHandles(["loom", "maestro"], OPTS);
    expect(result).toHaveProperty("error");
    if ("error" in result) expect(result.error).toMatch(/maestro/);
  });

  it("errors on an unknown handle, listing the valid (spawnable) roster", () => {
    const result = resolveSpawnHandles(["bogus"], OPTS);
    expect(result).toHaveProperty("error");
    if ("error" in result) {
      expect(result.error).toMatch(/bogus/);
      expect(result.error).toContain("fathom");
      // Valid list excludes the lead.
      expect(result.error).not.toMatch(/Valid handles:.*maestro/);
    }
  });

  it("ignores blank positionals (whitespace) and falls back to defaults", () => {
    expect(resolveSpawnHandles(["  ", ""], OPTS)).toEqual({ handles: DEFAULT_SPAWN });
  });

  it("errors on an empty roster instead of mislabeling the defaults as unknown", () => {
    const result = resolveSpawnHandles([], { roster: [], defaultSpawn: [], lead: "maestro" });
    expect(result).toHaveProperty("error");
    if ("error" in result) expect(result.error).toMatch(/roster is empty/);
  });

  it("rejects a shell-unsafe handle (could break out of the launch quotes)", () => {
    const result = resolveSpawnHandles(['foo"bar'], {
      roster: ['foo"bar', ...ROSTER],
      defaultSpawn: DEFAULT_SPAWN,
      lead: "maestro",
    });
    expect(result).toHaveProperty("error");
    if ("error" in result) expect(result.error).toMatch(/unsafe seat handle/);
  });

  it("works with no lead defined (every seat spawnable)", () => {
    const result = resolveSpawnHandles(["a"], { roster: ["a", "b"], defaultSpawn: ["a", "b"] });
    expect(result).toEqual({ handles: ["a"] });
  });
});
