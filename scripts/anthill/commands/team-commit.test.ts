import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";

// The commit guards live inside run(), so we assert the dual-audience envelope
// end-to-end: run the CLI and check that --format json yields a clean {ok:false}
// envelope on stderr (NOT a stack trace) with exit 1.
const CLI = resolve(import.meta.dir, "..", "cli.ts");

async function runCli(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(["bun", CLI, ...args], { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { code, stdout, stderr };
}

/** Parse the first JSON object line out of a stream. */
function firstJson(s: string): { ok?: boolean; error?: string; meta?: { command?: string } } | null {
  const line = s.split("\n").map((l) => l.trim()).find((l) => l.startsWith("{"));
  return line ? JSON.parse(line) : null;
}

describe("anthill commit — guard envelopes (--format json)", () => {
  test("no message → clean {ok:false} envelope on stderr, exit 1", async () => {
    const { code, stderr } = await runCli(["commit", "--format", "json"]);
    expect(code).toBe(1);
    const env = firstJson(stderr);
    expect(env?.ok).toBe(false);
    expect(env?.error).toMatch(/commit message is required/);
    expect(env?.meta?.command).toBe("commit");
    // Regression guard: no raw Bun stack-trace framing leaked.
    expect(stderr).not.toMatch(/at run \(/);
  });

  test("message but no paths → clean {ok:false} envelope on stderr, exit 1", async () => {
    const { code, stderr } = await runCli(["commit", "-m", "x", "--format", "json"]);
    expect(code).toBe(1);
    const env = firstJson(stderr);
    expect(env?.ok).toBe(false);
    expect(env?.error).toMatch(/explicit paths/);
    expect(env?.meta?.command).toBe("commit");
    expect(stderr).not.toMatch(/at run \(/);
  });
});
