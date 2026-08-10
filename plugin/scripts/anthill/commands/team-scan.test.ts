import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { ScanReport } from "../scan.ts";

// e2e: drive the whole CLI over an in-tree fixture and assert the emitted
// `{ ok, data: ScanReport }` envelope. `scan` needs no `.anthill/` config — it runs
// during bootstrap discovery — so `--root` points it straight at the fixture repo.
const CLI = resolve(import.meta.dir, "..", "cli.ts");
const FIXTURES = resolve(import.meta.dir, "..", "__fixtures__");

async function runCli(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(["bun", CLI, ...args], { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { code, stdout, stderr };
}

function firstEnvelope(s: string): { ok?: boolean; data?: ScanReport } | null {
  const line = s
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("{"));
  return line ? JSON.parse(line) : null;
}

describe("anthill scan — e2e", () => {
  test("workspace fixture → ok envelope with the full ScanReport", async () => {
    const root = resolve(FIXTURES, "workspace-repo");
    const { code, stdout } = await runCli(["scan", "--root", root, "--format", "json"]);
    expect(code).toBe(0);
    const env = firstEnvelope(stdout);
    expect(env?.ok).toBe(true);
    const data = env?.data as ScanReport;
    expect(data.root).toBe(root);
    expect(data.workspace).toEqual({ manager: "bun", globs: ["apps/*", "packages/*"] });
    expect(data.units.map((u) => u.path)).toEqual(["apps/mobile", "apps/web", "packages/shared"]);
    const web = data.units.find((u) => u.name === "web");
    expect(web?.stack[0]).toBe("nuxt");
    expect(web?.internalDeps).toEqual(["@acme/shared"]);
    expect(data.warnings).toBeUndefined();
  });

  test("single-surface fixture → workspace null + one root unit", async () => {
    const root = resolve(FIXTURES, "single-surface-repo");
    const { code, stdout } = await runCli(["scan", "--root", root, "--format", "json"]);
    expect(code).toBe(0);
    const data = firstEnvelope(stdout)?.data as ScanReport;
    expect(data.workspace).toBeNull();
    expect(data.units).toHaveLength(1);
    expect(data.units[0]?.path).toBe(".");
    expect(data.units[0]?.name).toBe("solo-app");
  });
});

// The TEXT half of the fail-open, which the JSON fix did not cover and which is
// the surface a human actually reads. `renderScan` printed "Workspace:
// single-surface" for a repo with no manifest — the same unevidenced claim,
// after the payload was already honest. Found by running the command rather than
// by reading the diff.
//
// CLEANUP: one module-level mkdtempSync + afterAll(rmSync) (see tmpleak.guard).
const TEXT_ROOT = mkdtempSync(join(tmpdir(), "anthill-scan-text-"));
afterAll(() => rmSync(TEXT_ROOT, { recursive: true, force: true }));

describe("anthill scan --format text — never asserts a shape it cannot support", () => {
  test("a repo with no manifest does NOT print 'single-surface'", async () => {
    const dir = join(TEXT_ROOT, "novel");
    mkdirSync(join(dir, "chapters"), { recursive: true });
    writeFileSync(join(dir, "README.md"), "# My Novel\n");

    const { stdout } = await runCli(["scan", "--root", dir, "--format", "text"]);
    expect(stdout).not.toContain("single-surface");
    expect(stdout).toContain("no readable package.json");
    // "?" reads as "we looked and found nothing"; we never looked.
    expect(stdout).toContain("not scanned");
  });

  test("a real single-surface app still prints 'single-surface' — the control", async () => {
    // Without this the assertion above is satisfied by deleting the line.
    const dir = join(TEXT_ROOT, "app");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "solo" }));

    const { stdout } = await runCli(["scan", "--root", dir, "--format", "text"]);
    expect(stdout).toContain("Workspace: single-surface");
    expect(stdout).not.toContain("not scanned");
  });
});
