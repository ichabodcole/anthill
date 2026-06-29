import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import {
  buildCoordCliPath,
  compareSemver,
  execCoord,
  firstErrorLine,
  parseJsonLine,
  resolveCoordCli,
  selectCoordCli,
  SPELLBOOK_CACHE_ROOT,
} from "./coord.ts";

describe("compareSemver", () => {
  test("orders by numeric component, not lexical", () => {
    expect(compareSemver("1.10.0", "1.7.0")).toBeGreaterThan(0); // 10 > 7 (lexical would say <)
    expect(compareSemver("1.7.0", "1.10.0")).toBeLessThan(0);
    expect(compareSemver("2.0.0", "1.99.0")).toBeGreaterThan(0);
    expect(compareSemver("1.2.3", "1.2.3")).toBe(0);
  });

  test("tolerates differing lengths + junk components", () => {
    expect(compareSemver("1.2", "1.2.0")).toBe(0);
    expect(compareSemver("1.2.1", "1.2")).toBeGreaterThan(0);
    expect(compareSemver("vX", "0.0.0")).toBe(0); // NaN -> 0
  });

  test("sorts descending to pick the highest", () => {
    const sorted = ["1.7.0", "1.14.0", "1.2.0", "1.9.0"].sort((a, b) => compareSemver(b, a));
    expect(sorted[0]).toBe("1.14.0");
  });
});

describe("buildCoordCliPath", () => {
  test("assembles <root>/<ver>/skills/<tool>/scripts/cli.ts", () => {
    expect(buildCoordCliPath("/cache/sb", "1.14.0", "grapevine")).toBe(
      "/cache/sb/1.14.0/skills/grapevine/scripts/cli.ts",
    );
    expect(buildCoordCliPath("/cache/sb", "1.9.0", "bounty")).toBe(
      "/cache/sb/1.9.0/skills/bounty/scripts/cli.ts",
    );
  });
});

describe("selectCoordCli (pure version pick)", () => {
  const root = "/cache/sb";

  test("picks the highest semver whose cli exists", () => {
    const present = new Set([
      buildCoordCliPath(root, "1.14.0", "grapevine"),
      buildCoordCliPath(root, "1.9.0", "grapevine"),
      buildCoordCliPath(root, "1.2.0", "grapevine"),
    ]);
    const best = selectCoordCli({
      root,
      tool: "grapevine",
      versionDirs: ["1.2.0", "1.14.0", "1.9.0"],
      exists: (p) => present.has(p),
    });
    expect(best?.ver).toBe("1.14.0");
    expect(best?.cli).toBe(buildCoordCliPath(root, "1.14.0", "grapevine"));
  });

  test("skips version dirs that lack the requested tool's cli", () => {
    // 1.20.0 exists as a dir but has no bounty cli; 1.9.0 does.
    const present = new Set([buildCoordCliPath(root, "1.9.0", "bounty")]);
    const best = selectCoordCli({
      root,
      tool: "bounty",
      versionDirs: ["1.20.0", "1.9.0"],
      exists: (p) => present.has(p),
    });
    expect(best?.ver).toBe("1.9.0");
  });

  test("returns undefined when nothing matches", () => {
    const best = selectCoordCli({
      root,
      tool: "grapevine",
      versionDirs: ["1.0.0"],
      exists: () => false,
    });
    expect(best).toBeUndefined();
  });
});

describe("parseJsonLine", () => {
  test("parses the first JSON object line, ignoring noise", () => {
    const out = 'some log line\n{"ok":true,"subscribers":["a","b"]}\ntrailing';
    expect(parseJsonLine<{ ok: boolean; subscribers: string[] }>(out)).toEqual({
      ok: true,
      subscribers: ["a", "b"],
    });
  });

  test("parses a JSON array line", () => {
    expect(parseJsonLine<number[]>("\n[1,2,3]\n")).toEqual([1, 2, 3]);
  });

  test("returns null on no/!invalid JSON", () => {
    expect(parseJsonLine("just text")).toBeNull();
    expect(parseJsonLine("{ not json")).toBeNull();
    expect(parseJsonLine("")).toBeNull();
  });
});

describe("firstErrorLine", () => {
  test("skips Bun stack-trace framing, keeps the first real line", () => {
    const stderr = ["", "  1 | const x = 1;", "    ^", "ConnectionRefused: dead daemon", ""].join("\n");
    expect(firstErrorLine(stderr, "fallback")).toBe("ConnectionRefused: dead daemon");
  });

  test("falls back when nothing meaningful", () => {
    expect(firstErrorLine("", "nothing happened")).toBe("nothing happened");
  });
});

describe("execCoord — never throws, graceful failure shape", () => {
  test("an unspawnable / failing cli resolves to ok:false (no throw)", async () => {
    // A cli path that doesn't exist: bun exits non-zero -> ok:false, not a throw.
    const res = await execCoord("/no/such/anthill-coord-cli.ts", ["info"]);
    expect(res.ok).toBe(false);
    expect(res.exitCode).not.toBe(0);
    expect(typeof res.stdout).toBe("string");
    expect(typeof res.stderr).toBe("string");
  });
});

// Live smoke check — only when spellbook is actually installed in this env.
describe("resolveCoordCli — live smoke", () => {
  const haveSpellbook = existsSync(SPELLBOOK_CACHE_ROOT);

  test.skipIf(!haveSpellbook)("resolves grapevine + bounty to existing cli.ts files", () => {
    for (const tool of ["grapevine", "bounty"] as const) {
      const cli = resolveCoordCli(tool);
      expect(cli.startsWith(SPELLBOOK_CACHE_ROOT)).toBe(true);
      expect(cli.endsWith(`skills/${tool}/scripts/cli.ts`)).toBe(true);
      expect(existsSync(cli)).toBe(true);
    }
  });
});
