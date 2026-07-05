import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { unexpectedStaged } from "./team-commit.ts";

// The commit guards live inside run(), so we assert the dual-audience envelope
// end-to-end: run the CLI and check that --format json yields a clean {ok:false}
// envelope on stderr (NOT a stack trace) with exit 1.
const CLI = resolve(import.meta.dir, "..", "cli.ts");

async function runCli(
  args: string[],
  cwd?: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(["bun", CLI, ...args], {
    stdout: "pipe",
    stderr: "pipe",
    ...(cwd && { cwd }),
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { code, stdout, stderr };
}

function sh(args: string[], cwd: string): void {
  const r = Bun.spawnSync(args, { cwd });
  if (r.exitCode !== 0) {
    throw new Error(`setup command failed: ${args.join(" ")}\n${r.stderr.toString()}`);
  }
}

/** A throwaway git repo with one committed baseline file, so commit behavior can
 * be exercised for real (no husky/lint-staged here — we're proving the sweep-guard
 * + abort logic, not the hook interaction). */
function makeRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "anthill-commit-"));
  sh(["git", "init", "-q"], dir);
  sh(["git", "config", "user.email", "t@t.t"], dir);
  sh(["git", "config", "user.name", "t"], dir);
  sh(["git", "config", "commit.gpgsign", "false"], dir);
  writeFileSync(join(dir, "baseline.txt"), "base\n");
  sh(["git", "add", "baseline.txt"], dir);
  sh(["git", "commit", "-qm", "baseline"], dir);
  return dir;
}

function stagedNames(dir: string): string[] {
  const r = Bun.spawnSync(["git", "diff", "--cached", "--name-only"], { cwd: dir });
  return r.stdout
    .toString()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Parse the first JSON object line out of a stream. */
function firstJson(
  s: string,
): { ok?: boolean; error?: string; meta?: { command?: string } } | null {
  const line = s
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("{"));
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

// PURE set-difference: the core of the pathspec-less-commit safety check.
describe("unexpectedStaged", () => {
  test("empty when the full staged set is exactly our paths", () => {
    expect(unexpectedStaged(["a.ts", "b.ts"], ["a.ts", "b.ts"])).toEqual([]);
    expect(unexpectedStaged([], [])).toEqual([]);
  });

  test("returns staged entries outside our pathspec (a peer's file)", () => {
    expect(unexpectedStaged(["a.ts", "peer.ts"], ["a.ts"])).toEqual(["peer.ts"]);
  });
});

// End-to-end against a throwaway git repo: prove the real commit behavior, since
// the whole point of the fix is what actually lands (verify the artifact).
describe("anthill commit — pathspec-less land in a real repo", () => {
  test("commits exactly the named path, whole-index, no pathspec", async () => {
    const dir = makeRepo();
    try {
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      const { code } = await runCli(["commit", "-m", "add mine", "mine.txt"], dir);
      expect(code).toBe(0);
      const log = Bun.spawnSync(["git", "log", "-1", "--name-only", "--pretty=%s"], { cwd: dir });
      const out = log.stdout.toString();
      expect(out).toMatch(/add mine/);
      expect(out).toMatch(/mine\.txt/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("does NOT sweep an untracked peer file into the commit", async () => {
    const dir = makeRepo();
    try {
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      writeFileSync(join(dir, "peer.txt"), "peer\n"); // untracked, not ours
      const { code } = await runCli(["commit", "-m", "add mine", "mine.txt"], dir);
      expect(code).toBe(0);
      const log = Bun.spawnSync(["git", "log", "-1", "--name-only", "--pretty=%s"], { cwd: dir });
      expect(log.stdout.toString()).not.toMatch(/peer\.txt/);
      // peer.txt is still there, still untracked.
      const status = Bun.spawnSync(["git", "status", "--porcelain"], { cwd: dir });
      expect(status.stdout.toString()).toMatch(/\?\? peer\.txt/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("aborts (exit 1, clean envelope) when the index holds staged content beyond our paths", async () => {
    const dir = makeRepo();
    try {
      writeFileSync(join(dir, "peer.txt"), "peer\n");
      sh(["git", "add", "peer.txt"], dir); // pre-existing out-of-band staging
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      const { code, stderr } = await runCli(
        ["commit", "-m", "add mine", "mine.txt", "--format", "json"],
        dir,
      );
      expect(code).toBe(1);
      const env = firstJson(stderr);
      expect(env?.ok).toBe(false);
      expect(env?.error).toMatch(/beyond your paths/);
      expect(env?.error).toMatch(/peer\.txt/);
      // Index restored to how we found it: our path unstaged, peer's staging left intact.
      expect(stagedNames(dir)).toEqual(["peer.txt"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
