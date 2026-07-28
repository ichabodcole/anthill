import { describe, expect, test } from "bun:test";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { foreignDirtyPaths, unexpectedStaged } from "./team-commit.ts";
import { cleanGitEnv } from "./test-support.ts";

// This suite git-inits throwaway repos and commits inside them. Give every git
// (and CLI) subprocess an env with GIT_* stripped, so a leaked GIT_INDEX_FILE
// (e.g. from a pathspec-commit hook running this suite) can't redirect them at
// the parent's index. See test-support.ts / .anthill/paper-cuts.md (2026-07-05 #1).
const GIT_ENV = cleanGitEnv();

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
    env: GIT_ENV,
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
  const r = Bun.spawnSync(args, { cwd, env: GIT_ENV });
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

/** Install a pre-commit hook that always fails — stands in for the real thing a
 * shared tree trips: a whole-tree gate reddened by SOMEONE ELSE's work. */
function installFailingHook(dir: string): void {
  const hooks = join(dir, ".git", "hooks");
  mkdirSync(hooks, { recursive: true });
  const p = join(hooks, "pre-commit");
  writeFileSync(p, "#!/bin/sh\necho 'gate: typecheck failed in some/peer/file.ts' >&2\nexit 1\n");
  chmodSync(p, 0o755);
}

function stagedNames(dir: string): string[] {
  const r = Bun.spawnSync(["git", "diff", "--cached", "--name-only"], { cwd: dir, env: GIT_ENV });
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

// PURE: the foreign-red diagnostic (anthill#50/#24/#28/#55) — on a gate failure,
// which dirty paths lie OUTSIDE the commit the seat just attempted?
describe("foreignDirtyPaths", () => {
  test("names a peer's dirty file, ignoring our own", () => {
    const porcelain = [" M src/mine.ts", " M src/peer.ts", "?? scratch/probe.txt"].join("\n");
    expect(foreignDirtyPaths(porcelain, ["src/mine.ts"])).toEqual([
      "src/peer.ts",
      "scratch/probe.txt",
    ]);
  });

  test("treats a committed DIRECTORY as covering everything under it", () => {
    const porcelain = [" M src/a.ts", " M src/nested/b.ts", " M other/c.ts"].join("\n");
    expect(foreignDirtyPaths(porcelain, ["src"])).toEqual(["other/c.ts"]);
    // A trailing slash on the pathspec must behave identically.
    expect(foreignDirtyPaths(porcelain, ["src/"])).toEqual(["other/c.ts"]);
  });

  test("does not mistake a path PREFIX for containment", () => {
    // `src2/` must not be considered covered by `src`.
    expect(foreignDirtyPaths(" M src2/a.ts", ["src"])).toEqual(["src2/a.ts"]);
  });

  test("reports both halves of a rename, and dedupes", () => {
    expect(foreignDirtyPaths('R  old.md -> "new name.md"', ["mine.ts"])).toEqual([
      "old.md",
      "new name.md",
    ]);
    expect(foreignDirtyPaths(" M dup.ts\n M dup.ts", ["mine.ts"])).toEqual(["dup.ts"]);
  });

  test("a clean tree outside our paths yields nothing to blame", () => {
    expect(foreignDirtyPaths("", ["a.ts"])).toEqual([]);
    expect(foreignDirtyPaths(" M a.ts", ["a.ts"])).toEqual([]);
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
      const log = Bun.spawnSync(["git", "log", "-1", "--name-only", "--pretty=%s"], {
        cwd: dir,
        env: GIT_ENV,
      });
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
      const log = Bun.spawnSync(["git", "log", "-1", "--name-only", "--pretty=%s"], {
        cwd: dir,
        env: GIT_ENV,
      });
      expect(log.stdout.toString()).not.toMatch(/peer\.txt/);
      // peer.txt is still there, still untracked.
      const status = Bun.spawnSync(["git", "status", "--porcelain"], { cwd: dir, env: GIT_ENV });
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

// anthill#48 / #51 — a chapter containing removals or a file move could not be
// landed through the wrapper at all, forcing a bypass to raw `git commit` and
// defeating the serialization the wrapper exists to provide.
describe("anthill commit — deletions and renames (anthill#48, #51)", () => {
  test("stages and commits a DELETED path", async () => {
    const dir = makeRepo();
    try {
      sh(["git", "rm", "-q", "baseline.txt"], dir);
      const { code, stderr } = await runCli(
        ["commit", "-m", "remove baseline", "baseline.txt"],
        dir,
      );
      expect(stderr).not.toMatch(/pathspec/);
      expect(code).toBe(0);
      const log = Bun.spawnSync(["git", "log", "-1", "--name-status", "--pretty=%s"], {
        cwd: dir,
        env: GIT_ENV,
      });
      expect(log.stdout.toString()).toMatch(/D\s+baseline\.txt/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("stages and commits a git-mv RENAME PAIR (old + new both named)", async () => {
    const dir = makeRepo();
    try {
      mkdirSync(join(dir, "_archive"), { recursive: true });
      sh(["git", "mv", "baseline.txt", "_archive/baseline.txt"], dir);
      const { code, stderr } = await runCli(
        ["commit", "-m", "archive baseline", "baseline.txt", "_archive/baseline.txt"],
        dir,
      );
      expect(stderr).not.toMatch(/pathspec/);
      expect(code).toBe(0);
      const log = Bun.spawnSync(["git", "log", "-1", "--name-only", "--pretty=%s"], {
        cwd: dir,
        env: GIT_ENV,
      });
      const out = log.stdout.toString();
      expect(out).toMatch(/_archive\/baseline\.txt/);
      // Nothing left behind: the move landed whole.
      const status = Bun.spawnSync(["git", "status", "--porcelain"], { cwd: dir, env: GIT_ENV });
      expect(status.stdout.toString().trim()).toBe("");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("anthill commit — the sweep guard sees BOTH halves of a staged rename", () => {
  test("aborts when a peer's staged rename moves a foreign file INTO our pathspec", async () => {
    // The subtle hole `--no-renames` closes. With git's rename detection on,
    // `git mv a.txt sub/a.txt` reports only `sub/a.txt`. A seat committing `sub`
    // would then see an index that looks entirely its own — and land the peer's
    // DELETION of `a.txt`, a path outside its pathspec, without ever noticing.
    const dir = makeRepo();
    try {
      mkdirSync(join(dir, "sub"), { recursive: true });
      writeFileSync(join(dir, "peer.txt"), "peer\n");
      sh(["git", "add", "peer.txt"], dir);
      sh(["git", "commit", "-qm", "peer file"], dir);
      sh(["git", "mv", "peer.txt", "sub/peer.txt"], dir); // a PEER's staged move

      writeFileSync(join(dir, "sub", "mine.txt"), "mine\n");
      const { code, stderr } = await runCli(
        ["commit", "-m", "add mine", "sub", "--format", "json"],
        dir,
      );

      expect(code).toBe(1);
      const env = firstJson(stderr);
      expect(env?.ok).toBe(false);
      expect(env?.error).toMatch(/beyond your paths/);
      expect(env?.error).toMatch(/peer\.txt/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// anthill#55 part 1 — THE sharpest one. We must stage before the gate can run,
// so a failed gate used to leave our paths staged; every peer's commit then
// refused, making the bounced seat the team's index-holder without knowing it.
describe("anthill commit — a bounced commit must not strand the index (anthill#55)", () => {
  test("gate failure leaves the index exactly as it was found (nothing staged)", async () => {
    const dir = makeRepo();
    try {
      installFailingHook(dir);
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      const { code } = await runCli(["commit", "-m", "add mine", "mine.txt"], dir);
      expect(code).not.toBe(0);
      // THE regression guard: not holding the index means peers can still land.
      expect(stagedNames(dir)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("gate failure preserves staging that existed BEFORE we ran", async () => {
    const dir = makeRepo();
    try {
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      sh(["git", "add", "mine.txt"], dir); // deliberately staged beforehand
      installFailingHook(dir);
      const { code } = await runCli(["commit", "-m", "add mine", "mine.txt"], dir);
      expect(code).not.toBe(0);
      // Restoring must not silently discard another intention.
      expect(stagedNames(dir)).toEqual(["mine.txt"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("names the FOREIGN dirty paths so the seat doesn't debug its own clean lane", async () => {
    const dir = makeRepo();
    try {
      installFailingHook(dir);
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      writeFileSync(join(dir, "peer-wip.txt"), "peer mid-edit\n"); // a peer's in-flight work
      const { code, stderr, stdout } = await runCli(["commit", "-m", "add mine", "mine.txt"], dir);
      expect(code).not.toBe(0);
      const out = stderr + stdout;
      expect(out).toMatch(/peer-wip\.txt/);
      expect(out).toMatch(/NOT your commit/);
      expect(stagedNames(dir)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
