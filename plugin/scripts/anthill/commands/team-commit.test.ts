import { describe, expect, test } from "bun:test";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { foreignDirtyPaths, stampSeat, unexpectedStaged } from "./team-commit.ts";
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

/** A LINKED WORKTREE of `repo`, which is the fixture every test above was
 * missing. In a main checkout `git rev-parse --git-common-dir` answers a
 * RELATIVE ".git"; from a linked worktree it answers an ABSOLUTE path. Any
 * fixture that is only ever a plain repo exercises one of those namespaces and
 * silently certifies code that mishandles the other. */
function makeWorktree(repo: string): { wt: string; cleanup: () => void } {
  const wt = mkdtempSync(join(tmpdir(), "anthill-commit-wt-"));
  rmSync(wt, { recursive: true, force: true }); // git wants to create it itself
  sh(["git", "worktree", "add", "-q", "-b", "seat-test", wt], repo);
  return {
    wt,
    cleanup: () => {
      rmSync(wt, { recursive: true, force: true });
      Bun.spawnSync(["git", "worktree", "prune"], { cwd: repo, env: GIT_ENV });
    },
  };
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
// Field report (StoryLoom, 2026-08-01, three independent witnesses): the FIRST
// path in the foreign-dirty list loses its first character, and only sometimes.
// Cause: git() trims stdout. Porcelain's status column is two chars, so an
// UNSTAGED modification is " M path" with a LEADING SPACE — trim eats it, the
// line becomes "M path", and slice(3) removes "M a" instead of " M ".
// It survives when the first line is "?? path" or "M  path" (no leading space),
// which is exactly the reported "conditional, not universal".
// Severity: this corrupts the one line whose whole job is preventing false
// attribution. Their lead grepped it for his own path, missed, and blamed peers
// for his own failure four times.
describe("foreignDirtyPaths — trimmed porcelain (StoryLoom field report)", () => {
  test("does NOT eat the first character when the leading status space is gone", () => {
    // Exactly what git() hands it after .trim(): first line's leading space lost.
    const trimmed = ["M apps/api/foo.test.ts", " M apps/api/foo.ts", "?? apps/api/bar.ts"].join(
      "\n",
    );
    expect(foreignDirtyPaths(trimmed, ["mine.ts"])).toEqual([
      "apps/api/foo.test.ts",
      "apps/api/foo.ts",
      "apps/api/bar.ts",
    ]);
  });

  test("still parses untrimmed porcelain identically", () => {
    const raw = [" M apps/api/foo.test.ts", " M apps/api/foo.ts", "?? apps/api/bar.ts"].join("\n");
    expect(foreignDirtyPaths(raw, ["mine.ts"])).toEqual([
      "apps/api/foo.test.ts",
      "apps/api/foo.ts",
      "apps/api/bar.ts",
    ]);
  });
});

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

  // Field regression (StoryLoom, 2026-07-31): the restore note used to read
  // "your paths are unstaged", which a seat understood as "your work is
  // isolated" and reported to his team as status. It means only that the INDEX
  // was restored; the working-tree edits stay, and a peer who commits a file you
  // have edits in still carries them. The note must not imply isolation.
  test("the restore note scopes itself to the index and disclaims isolation", async () => {
    const dir = makeRepo();
    try {
      installFailingHook(dir);
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      const { code, stderr, stdout } = await runCli(["commit", "-m", "add mine", "mine.txt"], dir);
      expect(code).not.toBe(0);
      const out = stderr + stdout;
      expect(out).toMatch(/index/i);
      expect(out).toMatch(/working[- ]tree edits are untouched/i);
      expect(out).toMatch(/does NOT isolate your work/i);
      // The exact phrasing that caused the misread must not come back.
      expect(out).not.toMatch(/your paths are unstaged/i);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  // Field report (StoryLoom, 2026-08-01): the gate-failure path threw a raw
  // Error, which reaches cli.ts's fallback and prints `err.stack` — five frames
  // of Bun internals landing UNDER the foreign-red diagnostic, burying the one
  // line the reader needed. This file's own rule (stated above the argument
  // guards) says emit the envelope rather than throw; this was the one path
  // breaking it. The two existing `at run (` guards sit on argument-validation
  // paths that never throw, so they could never have caught this.
  test("a gate bounce emits the envelope and leaks NO stack frames", async () => {
    const dir = makeRepo();
    try {
      installFailingHook(dir);
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      const { code, stderr, stdout } = await runCli(["commit", "-m", "add mine", "mine.txt"], dir);
      expect(code).not.toBe(0);
      expect(stderr + stdout).toMatch(/git commit failed/);
      expect(stderr).not.toMatch(/at run \(/);
      expect(stderr).not.toMatch(/at runCommand \(/);
      expect(stderr).not.toMatch(/\n\s+at /);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  // Found in independent review of this very branch, then reproduced before
  // fixing. Converting the gate-failure `throw` into `emitError + process.exit`
  // (to stop a stack-trace leak) silently dropped the lock release, because
  // `process.exit()` does NOT unwind `finally`. The suite asserted on the INDEX
  // and on stderr, never on the LOCK — so it passed with the bug present.
  //
  // Stranding the lock is anthill#55 moved from the index onto the lock: the
  // event that blocked you also hides that you are now blocking everyone. Worse,
  // the peer's 90s `acquireLock` timeout throws BEFORE the try, so it reaches
  // cli.ts's fallback and prints the exact stack trace this branch removed.
  test("a gate bounce RELEASES the serialize lock (process.exit skips finally)", async () => {
    const dir = makeRepo();
    try {
      installFailingHook(dir);
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      const { code } = await runCli(["commit", "-m", "will bounce", "mine.txt"], dir);
      expect(code).not.toBe(0);

      const common = Bun.spawnSync(["git", "rev-parse", "--git-common-dir"], {
        cwd: dir,
        env: GIT_ENV,
      })
        .stdout.toString()
        .trim();
      const lock = join(dir, common, "anthill-team-commit.lock");
      expect(existsSync(lock)).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  // Per-seat worktree isolation, session 6: `anthill commit` died with ENOENT in
  // EVERY seat worktree and nobody could land. `lockPath` did
  // `join(root, gitCommonDir)`, and `join` does not reset on an absolute second
  // argument, so a worktree's absolute `--git-common-dir` was concatenated onto
  // the worktree root to make a path that cannot exist.
  //
  // This is a positive control, not a smoke test: it FAILS against the `join`
  // implementation and passes against `resolve`. The reason it was never caught
  // is that every other test in this file runs in a plain repo, where
  // `--git-common-dir` is a relative ".git" and `join` is accidentally correct.
  //
  // Note what this does NOT assert: that the lock file lands at any particular
  // path. It asserts the commit SUCCEEDS from a worktree — because the defect
  // was reached through the lock and the symptom the team felt was "I cannot
  // land", and a path-shape assertion would re-encode the implementation I just
  // changed.
  test("commits from a LINKED WORKTREE, where --git-common-dir is absolute", async () => {
    const repo = makeRepo();
    const { wt, cleanup } = makeWorktree(repo);
    try {
      writeFileSync(join(wt, "seat.txt"), "seat work\n");
      const { code, stderr } = await runCli(["commit", "-m", "seat lands", "seat.txt"], wt);
      expect(stderr).not.toContain("ENOENT");
      expect(code).toBe(0);

      const log = Bun.spawnSync(["git", "log", "-1", "--format=%s"], { cwd: wt, env: GIT_ENV })
        .stdout.toString()
        .trim();
      expect(log).toBe("seat lands");
    } finally {
      cleanup();
      rmSync(repo, { recursive: true, force: true });
    }
  });

  // The consequence, proven end to end rather than argued: a peer must be able to
  // land immediately after someone else's gate bounce, not queue behind a corpse.
  test("a peer can commit promptly after a gate failure", async () => {
    const dir = makeRepo();
    try {
      installFailingHook(dir);
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      await runCli(["commit", "-m", "will bounce", "mine.txt"], dir);

      rmSync(join(dir, ".git", "hooks", "pre-commit"), { force: true });
      writeFileSync(join(dir, "peer.txt"), "peer\n");
      const started = Date.now();
      const { code } = await runCli(["commit", "-m", "peer lands", "peer.txt"], dir);
      expect(code).toBe(0);
      // A stranded lock costs the peer LOCK_WAIT_MS (90s); this must be instant.
      expect(Date.now() - started).toBeLessThan(20_000);
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

// All four seats of a consuming team, independently, in one session: every
// commit on a shared tree is authored by the human, so "who landed this?" is
// unanswerable after the fact. Their lead found an anomalous commit and had to
// ASK THE CHANNEL; the author was identified only because they volunteered.
// `anthill commit` already knows the handle — stamping it makes attribution a
// mechanism instead of a discipline, and sweep forensics a `git log --grep`.
describe("anthill commit — seat attribution (StoryLoom field request)", () => {
  function withConfig(dir: string, handles: string[]): void {
    mkdirSync(join(dir, ".anthill"), { recursive: true });
    writeFileSync(
      join(dir, ".anthill", "config.json"),
      JSON.stringify({
        version: 2,
        channel: "t",
        lead: handles[0],
        seats: handles.map((h) => ({ handle: h, role: "r", scope: "s", spawn: true })),
      }),
    );
  }

  test("--as <seat> stamps an Anthill-Seat trailer that git log can grep", async () => {
    const dir = makeRepo();
    try {
      withConfig(dir, ["maestro", "forager"]);
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      const { code } = await runCli(
        ["commit", "-m", "do a thing", "--as", "forager", "mine.txt"],
        dir,
      );
      expect(code).toBe(0);
      const body = Bun.spawnSync(["git", "log", "-1", "--format=%B"], {
        cwd: dir,
        env: GIT_ENV,
      }).stdout.toString();
      expect(body).toMatch(/^Anthill-Seat: forager$/m);
      // The subject must survive intact — the trailer is appended, not merged in.
      expect(body.split("\n")[0]).toBe("do a thing");
      // And it must be findable the way a forensic reader would look.
      const found = Bun.spawnSync(["git", "log", "--grep=Anthill-Seat: forager", "--format=%s"], {
        cwd: dir,
        env: GIT_ENV,
      }).stdout.toString();
      expect(found).toMatch(/do a thing/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("an unknown seat is refused BEFORE anything is staged, and names the valid set", async () => {
    const dir = makeRepo();
    try {
      withConfig(dir, ["maestro", "forager"]);
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      const { code, stderr } = await runCli(
        ["commit", "-m", "do a thing", "--as", "nobody", "mine.txt"],
        dir,
      );
      expect(code).not.toBe(0);
      // Assert the machine envelope, not a substring of escaped JSON.
      const env = firstJson(stderr);
      expect(env?.ok).toBe(false);
      expect(env?.error).toMatch(/unknown seat "nobody"/);
      expect(env?.error).toMatch(/maestro/);
      expect(env?.error).toMatch(/forager/);
      // Nothing staged: a bogus handle must not leave the tree half-touched.
      expect(stagedNames(dir)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("no --as still commits cleanly (the flag is optional)", async () => {
    const dir = makeRepo();
    try {
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      const { code } = await runCli(["commit", "-m", "plain", "mine.txt"], dir);
      expect(code).toBe(0);
      const body = Bun.spawnSync(["git", "log", "-1", "--format=%B"], {
        cwd: dir,
        env: GIT_ENV,
      }).stdout.toString();
      expect(body).not.toMatch(/Anthill-Seat:/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// The FALSE-GREEN, demonstrated by a consuming team in a throwaway repo: the
// gate reads the WORKING TREE, the commit holds NAMED PATHS, and they coincide
// only when exactly one seat is dirty. A peer's uncommitted code can satisfy
// this commit's dependency, the gate passes, and the landed commit is red in
// isolation. The false RED is loud and well handled; this direction was silent.
describe("anthill commit — false-GREEN visibility on SUCCESS", () => {
  // THE CLEAN CASE — the half that was missing, and the half the SOP's beat
  // depends on. `uncheckedAgainst` used to be OMITTED when empty, so a seat
  // that read it carefully and a seat that never read it produced the SAME
  // observation: absence. That is the definition of a check that is not one,
  // and four seats hit it in one session (one holding both states across three
  // lands on one machine).
  //
  // Its own repo on purpose: the sibling test leaves a peer's file dirty, so
  // asserting "clean" in that tree would have asserted nothing. (It did, on the
  // first attempt — the assertion failed because the world was not what the
  // test's name claimed.)
  test("on a CLEAN tree the field is PRESENT and empty — absence is the defect", async () => {
    const dir = makeRepo();
    try {
      writeFileSync(join(dir, "solo.txt"), "no peer dirt\n");
      const j = await runCli(["commit", "-m", "solo", "solo.txt", "--format", "json"], dir);
      expect(j.code).toBe(0);
      const env = firstJson(j.stdout) as { data?: Record<string, unknown> } | null;
      // The KEY's presence is asserted directly: `toEqual([])` against
      // `undefined` is exactly the confusion this field existed to end.
      expect(Object.hasOwn(env?.data ?? {}, "uncheckedAgainst")).toBe(true);
      expect(env?.data?.uncheckedAgainst).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("names dirty paths outside the commit, and says the check wasn't isolated", async () => {
    const dir = makeRepo();
    try {
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      writeFileSync(join(dir, "peer-wip.txt"), "a peer's uncommitted work\n");
      // The machine contract: the set is a first-class field, not prose.
      const j = await runCli(["commit", "-m", "add mine", "mine.txt", "--format", "json"], dir);
      expect(j.code).toBe(0);
      const env = firstJson(j.stdout) as { data?: { uncheckedAgainst?: string[] } } | null;
      expect(env?.data?.uncheckedAgainst).toEqual(["peer-wip.txt"]);

      // And the human rendering actually says what it means.
      writeFileSync(join(dir, "mine2.txt"), "more\n");
      const t = await runCli(["commit", "-m", "again", "mine2.txt", "--format", "text"], dir);
      expect(t.code).toBe(0);
      const out = t.stdout + t.stderr;
      expect(out).toMatch(/peer-wip\.txt/);
      expect(out).toMatch(/NOT checked in isolation/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("says nothing when the tree holds no foreign dirt (no noise on a clean land)", async () => {
    const dir = makeRepo();
    try {
      writeFileSync(join(dir, "mine.txt"), "mine\n");
      const { code, stdout, stderr } = await runCli(["commit", "-m", "add mine", "mine.txt"], dir);
      expect(code).toBe(0);
      expect(stdout + stderr).not.toMatch(/NOT checked in isolation/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

/**
 * t-93fca16a — retro H1's assigned test: `--stdin` / `-F` on `anthill commit`.
 *
 * The hazard is a property of the SHELL, upstream of this process: an unquoted
 * `-m` body carrying backticks is command-substituted by bash before the tool
 * sees it. `comms send` already had `--stdin`; commit did not, and commit
 * messages here are made of paths, flags and code.
 */
describe("anthill commit — --stdin / -F (H1: a mechanical guard for the backtick class)", () => {
  const CODE_BODY =
    "fix(comms): handle `--as-of` and $HOME in bodies\n\n" +
    "The guard is `SAFE_SESSION_KEY.test(config.channel)` — see $(whoami) notes.\n";

  test("-F carries a backtick/$() body through VERBATIM", async () => {
    const dir = makeRepo();
    writeFileSync(join(dir, "a.txt"), "a\n");
    const msgFile = join(dir, "msg.txt");
    writeFileSync(msgFile, CODE_BODY);

    const r = await runCli(["commit", "-F", msgFile, "a.txt", "--format", "json"], dir);
    expect(r.code).toBe(0);

    const logged = Bun.spawnSync(["git", "log", "-1", "--format=%B"], {
      cwd: dir,
      env: GIT_ENV,
    }).stdout.toString();
    // The assertion that matters: the backticked span survived UNEXECUTED and
    // unmangled. A shell-substituted body would have replaced it or emptied it.
    expect(logged).toContain("`--as-of`");
    expect(logged).toContain("$(whoami)");
    expect(logged).toContain("$HOME");
    rmSync(dir, { recursive: true, force: true });
  });

  test("--stdin does the same from a pipe", async () => {
    const dir = makeRepo();
    writeFileSync(join(dir, "b.txt"), "b\n");
    const proc = Bun.spawn(["bun", CLI, "commit", "--stdin", "b.txt", "--format", "json"], {
      cwd: dir,
      env: GIT_ENV,
      stdin: new TextEncoder().encode(CODE_BODY),
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(await proc.exited).toBe(0);
    const logged = Bun.spawnSync(["git", "log", "-1", "--format=%B"], {
      cwd: dir,
      env: GIT_ENV,
    }).stdout.toString();
    expect(logged).toContain("`--as-of`");
    rmSync(dir, { recursive: true, force: true });
  });

  test("combining two message sources is REFUSED and names both", async () => {
    const dir = makeRepo();
    writeFileSync(join(dir, "c.txt"), "c\n");
    const msgFile = join(dir, "m.txt");
    writeFileSync(msgFile, "from file\n");
    const r = await runCli(
      ["commit", "-m", "from flag", "-F", msgFile, "c.txt", "--format", "json"],
      dir,
    );
    expect(r.code).not.toBe(0);
    const env = JSON.parse(r.stderr.trim());
    expect(env.ok).toBe(false);
    expect(env.error).toContain("-m");
    expect(env.error).toContain("--file");
    // And NOTHING was committed — a refusal that still commits is worse than no
    // refusal, because the caller believes the wrong message was rejected.
    const head = Bun.spawnSync(["git", "log", "-1", "--format=%s"], {
      cwd: dir,
      env: GIT_ENV,
    }).stdout.toString();
    expect(head.trim()).toBe("baseline");
    rmSync(dir, { recursive: true, force: true });
  });

  test("-F on a missing file names the path AS GIVEN and commits nothing", async () => {
    const dir = makeRepo();
    writeFileSync(join(dir, "d.txt"), "d\n");
    const r = await runCli(["commit", "-F", "no/such.txt", "d.txt", "--format", "json"], dir);
    expect(r.code).not.toBe(0);
    const env = JSON.parse(r.stderr.trim());
    // The path the caller typed, not a re-derived absolute one: re-deriving
    // invents a second answer to a question that already has one.
    expect(env.error).toContain("no/such.txt");
    rmSync(dir, { recursive: true, force: true });
  });

  test("--stdin still appends the Anthill-Seat trailer", async () => {
    // The trailer is the other half of this command's contract; a new message
    // path that silently dropped it would make `git log --grep` lie.
    const dir = makeRepo();
    mkdirSync(join(dir, ".anthill"), { recursive: true });
    writeFileSync(
      join(dir, ".anthill", "config.json"),
      JSON.stringify({
        version: 2,
        channel: "c",
        seats: [{ handle: "forager", role: "hands", scope: "s/", spawn: true }],
      }),
    );
    writeFileSync(join(dir, "e.txt"), "e\n");
    const proc = Bun.spawn(
      ["bun", CLI, "commit", "--stdin", "--as", "forager", "e.txt", "--format", "json"],
      {
        cwd: dir,
        env: GIT_ENV,
        stdin: new TextEncoder().encode("feat: via stdin with `code`\n"),
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    expect(await proc.exited).toBe(0);
    const logged = Bun.spawnSync(["git", "log", "-1", "--format=%B"], {
      cwd: dir,
      env: GIT_ENV,
    }).stdout.toString();
    expect(logged).toContain("Anthill-Seat: forager");
    expect(logged).toContain("`code`");
    rmSync(dir, { recursive: true, force: true });
  });

  test("CONTROL: -m still works unchanged", async () => {
    const dir = makeRepo();
    writeFileSync(join(dir, "f.txt"), "f\n");
    const r = await runCli(["commit", "-m", "plain message", "f.txt", "--format", "json"], dir);
    expect(r.code).toBe(0);
    rmSync(dir, { recursive: true, force: true });
  });
});

/**
 * The KNOWN-POSITIVE for the whole card.
 *
 * Every test above passes a body straight to `Bun.spawn`, so no shell is
 * involved and none of them demonstrate the hazard `--stdin`/`-F` exist to
 * defeat. An instrument never shown able to report the failure cannot support a
 * claim that the failure was avoided — so this runs BOTH paths through a real
 * `sh -c` and asserts they differ.
 */
describe("anthill commit — the shell hazard, demonstrated on both sides", () => {
  const shellRun = (cmd: string, cwd: string) =>
    Bun.spawnSync(["sh", "-c", cmd], { cwd, env: GIT_ENV });

  const lastMessage = (dir: string) =>
    Bun.spawnSync(["git", "log", "-1", "--format=%B"], {
      cwd: dir,
      env: GIT_ENV,
    }).stdout.toString();

  test("-m through a shell EXECUTES a backticked span; -F through the same shell does not", async () => {
    const dir = makeRepo();
    writeFileSync(join(dir, "x.txt"), "x\n");
    writeFileSync(join(dir, "y.txt"), "y\n");

    // (a) THE HAZARD, reproduced. Double-quoted `-m` is what a hurried caller
    // writes; bash substitutes the backticked span before anthill is even
    // invoked, so the committed message contains the command's OUTPUT.
    shellRun(`bun ${CLI} commit -m "docs: note \`echo INJECTED\` here" x.txt`, dir);
    const hazard = lastMessage(dir);
    expect(hazard).toContain("INJECTED"); // the substitution HAPPENED
    expect(hazard).not.toContain("echo INJECTED"); // the literal did NOT survive

    // (b) THE FIX, through the identical shell. The body never passes through
    // bash's expansion at all, so the literal text lands.
    const msgFile = join(dir, "msg2.txt");
    writeFileSync(msgFile, "docs: note `echo INJECTED` here\n");
    shellRun(`bun ${CLI} commit -F ${msgFile} y.txt`, dir);
    const fixed = lastMessage(dir);
    expect(fixed).toContain("`echo INJECTED`"); // the literal SURVIVED
    expect(fixed.replace("`echo INJECTED`", "")).not.toContain("INJECTED");

    // Same shell, same body, opposite outcomes — which is what makes (b) mean
    // something rather than being a green from a harness that cannot fail.
    expect(hazard).not.toBe(fixed);
    rmSync(dir, { recursive: true, force: true });
  });
});

// The seat trailer must be idempotent, because the rule it replaces is one that
// humans measurably fail: a seat hand-writing `Anthill-Seat:` into `-m` (the
// habit our own raw-git fallback trains) produced a duplicate TWICE in one
// session, the second time by the seat who had just written the lesson about it.
// A situational warning fails at the recognition step, so this is mechanical.
describe("stampSeat", () => {
  test("appends the trailer when the body has none", () => {
    expect(stampSeat("subject line", "forager")).toBe("subject line\n\nAnthill-Seat: forager");
  });

  test("does NOT append a second trailer for the same seat", () => {
    const body = "subject\n\nAnthill-Seat: forager";
    expect(stampSeat(body, "forager")).toBe(body);
  });

  test("counts exactly one trailer after stamping an already-stamped body", () => {
    const out = stampSeat("subject\n\nAnthill-Seat: forager", "forager");
    expect(out.split("\n").filter((l) => l.startsWith("Anthill-Seat:")).length).toBe(1);
  });

  // The case that must NOT be deduplicated: an atomic cross-seat land is one
  // commit legitimately carrying several seats. Dropping a real seat is a worse
  // failure than repeating one, so the match is scoped to the same handle.
  test("still appends when the existing trailer names a DIFFERENT seat", () => {
    const out = stampSeat("subject\n\nAnthill-Seat: weaver", "forager");
    expect(out).toContain("Anthill-Seat: weaver");
    expect(out).toContain("Anthill-Seat: forager");
  });

  test("is not fooled by a trailer mentioned mid-prose rather than on its own line", () => {
    // "we stamp Anthill-Seat: forager on every land" inside a paragraph is prose
    // ABOUT the trailer, not the trailer. Matching it would silently skip the
    // real stamp — the same word-vs-claim trap this seat has hit twice before.
    const out = stampSeat("we always write Anthill-Seat: forager in the body", "forager");
    expect(out.split("\n").filter((l) => l.trim() === "Anthill-Seat: forager").length).toBe(1);
  });
});
