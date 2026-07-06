import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
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
