/**
 * `anthill wiki lint` — the skeleton is clean, a planted defect is reported, and
 * a verdict is data, never an error.
 *
 * The lint's own detector has 180 tests of its own (`docs-lint/index.test.ts`,
 * lifted with the core). These test what anthill adds: that the SHIPPED skeleton
 * passes its own lint — a template that ships an orphan ships the accumulation
 * failure this wiki exists to end — and that the CLI's envelope carries the
 * verdict per CONTRACT.md ("outcomes are not errors").
 *
 * Both planted-defect cases are the positive controls AGENTS.md's second testing
 * rule asks for: a lint that reports an empty list on a clean tree reports the
 * same on a tree it cannot see, so the tree is given a defect and the lint has
 * to find it.
 */
import { describe, expect, it } from "bun:test";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { cleanGitEnv } from "./test-support.ts";

const CLI = resolve(import.meta.dir, "..", "cli.ts");
const WIKI_TEMPLATE = resolve(import.meta.dir, "..", "..", "..", "templates", "docs-team", "wiki");

function run(args: string[], cwd: string) {
  const p = Bun.spawnSync(["bun", CLI, ...args], { cwd, env: cleanGitEnv() });
  return { code: p.exitCode, stdout: p.stdout.toString(), stderr: p.stderr.toString() };
}

/** A v2 single-team project with the wiki skeleton copied in as `init` would render it. */
function projectWithWiki(): string {
  const root = mkdtempSync(join(tmpdir(), "anthill-wiki-lint-"));
  mkdirSync(join(root, ".anthill"), { recursive: true });
  writeFileSync(
    join(root, ".anthill", "config.json"),
    JSON.stringify({
      version: 2,
      channel: "t",
      lead: "lead",
      seats: [{ handle: "lead", role: "lead", scope: "everything", spawn: false }],
    }),
  );
  cpSync(WIKI_TEMPLATE, join(root, ".anthill", "wiki"), { recursive: true });
  return root;
}

function envelope(stdout: string) {
  const lines = stdout.trimEnd().split("\n");
  expect(lines).toHaveLength(1);
  return JSON.parse(lines[0] as string);
}

describe("anthill wiki lint", () => {
  it("the shipped skeleton is clean — every page cataloged, every link and `related` key resolving", () => {
    const root = projectWithWiki();
    try {
      const { code, stdout, stderr } = run(["wiki", "lint", "--format", "json"], root);
      expect(stderr).toBe("");
      expect(code).toBe(0);
      const env = envelope(stdout);
      expect(env.ok).toBe(true);
      expect(env.data.problems).toEqual([]);
      expect(env.data.clean).toBe(true);
      expect(env.data.wikiDir).toBe(".anthill/wiki");
      // index + six touch points; SCHEMA.md is the contract, not a page, and is
      // walked but exempt — it appears in the node list flagged as such.
      expect(env.data.typeIndex.touchpoint).toHaveLength(6);
      expect(env.data.typeIndex.index).toEqual(["index.md"]);
      const schema = env.data.nodes.find((n: { path: string }) => n.path === "SCHEMA.md");
      expect(schema?.contractExempt).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("text mode prints the OK line and nothing else when clean", () => {
    const root = projectWithWiki();
    try {
      const { code, stdout } = run(["wiki", "lint", "--format", "text"], root);
      expect(code).toBe(0);
      expect(stdout.trim()).toStartWith("OK —");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("POSITIVE CONTROL — a page with no catalog line is reported as an ORPHAN, at exit 0 with clean:false", () => {
    const root = projectWithWiki();
    try {
      writeFileSync(
        join(root, ".anthill", "wiki", "touchpoints", "stray.md"),
        [
          "---",
          "type: touchpoint",
          "title: Stray",
          "description: A page nothing points at.",
          "tags: [lifecycle]",
          "status: draft",
          "generated: { by: test, at: 2026-09-03 }",
          "---",
          "",
          "# Stray",
          "",
        ].join("\n"),
      );
      const { code, stdout } = run(["wiki", "lint", "--format", "json"], root);
      // A verdict is an ANSWER, not an error — exit 0, ok:true, clean:false.
      expect(code).toBe(0);
      const env = envelope(stdout);
      expect(env.ok).toBe(true);
      expect(env.data.clean).toBe(false);
      expect(env.data.problems).toHaveLength(1);
      expect(env.data.problems[0]).toStartWith("ORPHAN         touchpoints/stray.md");
      expect(env.data.stats.orphans).toBe(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("POSITIVE CONTROL — a dead link and a bad `related` key are both reported, in text mode too", () => {
    const root = projectWithWiki();
    try {
      const page = join(root, ".anthill", "wiki", "touchpoints", "work.md");
      const src = readFileSync(page, "utf8");
      writeFileSync(
        page,
        src
          .replace("related: [touchpoint/plan, touchpoint/finalize]", "related: [touchpoint/nope]")
          .replace(
            "## How this team does it",
            "See [nowhere](./nowhere.md).\n\n## How this team does it",
          ),
      );
      const { code, stdout } = run(["wiki", "lint", "--format", "text"], root);
      expect(code).toBe(0);
      expect(stdout).toContain("MISSING FILE   touchpoints/work.md: ./nowhere.md");
      expect(stdout).toContain('BAD related    touchpoints/work.md: "touchpoint/nope"');
      expect(stdout.trimEnd()).toEndWith("2 problem(s).");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("no wiki directory is a `failed` — the fix is in the world — and it says how", () => {
    const root = projectWithWiki();
    try {
      rmSync(join(root, ".anthill", "wiki"), { recursive: true, force: true });
      const { code, stdout, stderr } = run(["wiki", "lint", "--format", "json"], root);
      expect(code).toBe(1);
      expect(stdout).toBe("");
      const env = envelope(stderr); // error envelopes travel on stderr
      expect(env.ok).toBe(false);
      expect(env.kind).toBe("failed");
      expect(env.error).toContain("no wiki at .anthill/wiki");
      expect(env.error).toContain("init");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("`wiki` alone is a group — a usage error naming `lint`", () => {
    const root = projectWithWiki();
    try {
      const { code, stdout, stderr } = run(["wiki", "--format", "json"], root);
      expect(code).toBe(2);
      expect(stdout).toBe("");
      const env = envelope(stderr);
      expect(env.ok).toBe(false);
      expect(env.kind).toBe("usage");
      expect(env.choices).toContain("lint");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
