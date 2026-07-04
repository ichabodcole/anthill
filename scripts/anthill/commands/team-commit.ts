import { spawnSync } from "node:child_process";
import { closeSync, openSync, readFileSync, statSync, unlinkSync, writeSync } from "node:fs";
import { join } from "node:path";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";

// How long to wait for the serialize lock before giving up, and when to treat a
// held lock as stale (a crashed peer) and steal it.
const LOCK_WAIT_MS = 90_000;
const LOCK_STALE_MS = 120_000;
const LOCK_POLL_MS = 200;

interface CommitData {
  committed: boolean;
  sha?: string;
  paths: string[];
  message: string;
  waitedMs?: number;
  warnings?: string[];
}

function git(args: string[], cwd: string): { ok: boolean; stdout: string; stderr: string } {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return {
    ok: r.status === 0,
    stdout: (r.stdout ?? "").trim(),
    stderr: (r.stderr ?? "").trim(),
  };
}

/** Resolve the git working-tree root (so commits + the lock anchor to the real
 * repo regardless of cwd). Falls back to cwd if not in a repo. */
function repoRoot(cwd: string): string {
  const top = git(["rev-parse", "--show-toplevel"], cwd);
  return top.ok && top.stdout ? top.stdout : cwd;
}

/** The shared git dir (`--git-common-dir` so a worktree resolves to the real
 * `.git`, where the one shared index — the thing seats race on — actually lives). */
function lockPath(root: string): string {
  const common = git(["rev-parse", "--git-common-dir"], root);
  const dir = common.ok && common.stdout ? join(root, common.stdout) : join(root, ".git");
  return join(dir, "anthill-team-commit.lock");
}

function sleep(ms: number): void {
  // Synchronous wait — this CLI is a one-shot; a blocking poll keeps the lock
  // logic simple + deterministic.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** Acquire the serialize lock (atomic O_EXCL create), waiting for a peer to
 * release. Steals a stale lock (crashed holder). Returns the wait time, or
 * throws on timeout. */
function acquireLock(path: string): number {
  const startedAt = nowMillis();
  for (;;) {
    try {
      const fd = openSync(path, "wx");
      writeSync(fd, `${process.pid} ${new Date(nowMillis()).toISOString()}\n`);
      closeSync(fd);
      return nowMillis() - startedAt;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
      // Held — steal if stale, else wait.
      try {
        if (nowMillis() - statSync(path).mtimeMs > LOCK_STALE_MS) {
          unlinkSync(path);
          continue;
        }
      } catch {
        // Lock vanished between the open and the stat — just retry.
      }
      if (nowMillis() - startedAt > LOCK_WAIT_MS) {
        let holder = "unknown";
        try {
          holder = readFileSync(path, "utf8").trim();
        } catch {
          // ignore
        }
        throw new Error(
          `timed out after ${LOCK_WAIT_MS}ms waiting for the team-commit lock (held by: ${holder}). ` +
            `If that peer crashed, remove ${path}.`,
        );
      }
      sleep(LOCK_POLL_MS);
    }
  }
}

function releaseLock(path: string): void {
  try {
    unlinkSync(path);
  } catch {
    // already gone — fine
  }
}

/**
 * PURE (the unit-test target): which staged entries fall OUTSIDE the paths we
 * were asked to commit. `full` and `ours` are both `git diff --cached
 * --name-only` outputs — one unfiltered, one filtered to our pathspec — so they're
 * the same repo-root-relative namespace and the set-difference needs no path
 * normalization. A non-empty result means the index holds staged content beyond
 * our paths (a peer staged out-of-band, or pre-existing staging): the shared-tree
 * "explicit paths, never sweep" contract is broken, so we abort rather than let a
 * pathspec-less commit rake it in.
 */
export function unexpectedStaged(full: string[], ours: string[]): string[] {
  const mine = new Set(ours);
  return full.filter((p) => !mine.has(p));
}

/** Split a `git diff --cached --name-only` stdout blob into a clean path list. */
function stagedList(stdout: string): string[] {
  return stdout
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

// `anthill commit -m "<msg>" <path> [<path>…]` — the file-scoped, serialized land
// for a shared tree. Two guarantees a bare `git commit` can't give when several
// seats share one working tree + index:
//   1. EXPLICIT PATHS ONLY — refuses to run without paths, then stages just those
//      paths and VERIFIES the index holds nothing else before committing, so a
//      commit can never sweep a peer's staged file (the recurring shared-index
//      race). No `git add -A`; unexpected staged content aborts rather than rides
//      along.
//   2. SERIALIZE LOCK — concurrent seats queue instead of racing git's index +
//      the pre-commit hook's lint-staged stash. One land at a time, in order.
// It commits WITHOUT a pathspec (a partial `git commit -- <paths>` builds a temp
// index that lint-staged's stash dance corrupts — every check passes, then the
// commit dies on a phantom invalid blob); the verification above is what makes a
// whole-index commit safe.
// The same command IS the atomic cross-seat land: the lead collects every seat's
// paths and passes them in one call → one commit across the seats.
export const teamCommitCommand = defineAnthillCommand({
  meta: {
    name: "commit",
    description: "File-scoped, serialized commit for the shared team tree (explicit paths only)",
    scope: "workspace",
  },
  args: {
    message: { type: "string", alias: "m", description: "Commit message", valueHint: "text" },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const message = (ctx.args.message as string | undefined)?.trim();
    const paths = ((ctx.args._ as string[] | undefined) ?? []).filter((p) => p.length > 0);
    const warnings: string[] = [];

    // Guards emit the dual-audience error envelope (clean {ok:false} in JSON
    // mode) rather than throwing — a JSON-mode stack trace would regress the
    // stable envelope contract this CLI sells.
    if (!message) {
      emitError({
        format,
        command: "commit",
        error: 'a commit message is required: `anthill commit -m "<msg>" <path>…`',
      });
      process.exit(1);
    }
    if (paths.length === 0) {
      emitError({
        format,
        command: "commit",
        error:
          "refusing to commit with NO explicit paths. On a shared tree a bare commit sweeps a " +
          'peer\'s staged file — pass exactly your paths: `anthill commit -m "<msg>" <path>…`',
      });
      process.exit(1);
    }

    const root = repoRoot(process.cwd());
    const lock = lockPath(root);
    const waitedMs = acquireLock(lock);
    try {
      // Stage exactly these paths (explicit pathspec → never a peer's file; also
      // the only way a NEW/untracked path is picked up).
      const staged = git(["add", "--", ...paths], root);
      if (!staged.ok) {
        throw new Error(`git add failed:\n${staged.stderr || staged.stdout || "unknown"}`);
      }
      // Verify the index is EXACTLY our paths before a pathspec-less commit. We do
      // NOT use a partial (`git commit -- <paths>`) commit: that builds a temporary
      // index, and lint-staged's stash/backup dance corrupts that interaction —
      // every check passes, then the commit dies citing an invalid blob for an
      // unrelated file (the recurring paper-cut). A whole-index commit runs the
      // hook against the REAL index and sidesteps it — but only sweeps nothing if
      // the index really is just our paths, which this verification guarantees.
      const full = git(["diff", "--cached", "--name-only"], root);
      const ours = git(["diff", "--cached", "--name-only", "--", ...paths], root);
      if (!full.ok || !ours.ok) {
        throw new Error(`git diff --cached failed:\n${full.stderr || ours.stderr || "unknown"}`);
      }
      const unexpected = unexpectedStaged(stagedList(full.stdout), stagedList(ours.stdout));
      if (unexpected.length > 0) {
        // Restore the index to how we found it (unstage only our paths), then
        // refuse with the dual-audience envelope — same guard style as no-paths.
        git(["reset", "--quiet", "--", ...paths], root);
        releaseLock(lock);
        emitError({
          format,
          command: "commit",
          error:
            "refusing to commit: the index has staged content beyond your paths " +
            `(${unexpected.join(", ")}). On a shared tree that means a peer staged out-of-band, ` +
            "or there's leftover staging — commit or reset it, then retry your paths.",
        });
        process.exit(1);
      }
      // Whole-index commit — NO pathspec. The verification above proved the index
      // is exactly our paths, so this can't sweep a peer's file.
      const res = git(["commit", "-m", message], root);
      if (!res.ok) {
        const detail = res.stderr || res.stdout || "git commit failed";
        throw new Error(`git commit failed:\n${detail}`);
      }
      const sha = git(["rev-parse", "--short", "HEAD"], root);
      const data: CommitData = {
        committed: true,
        sha: sha.ok ? sha.stdout : undefined,
        paths,
        message,
        waitedMs,
        ...(warnings.length > 0 && { warnings }),
      };
      emit({
        format,
        command: "commit",
        data,
        startedAt: started,
        renderText: (d) => {
          const lines = [
            `Committed ${d.sha ?? "(sha?)"} — ${d.paths.length} path(s), file-scoped:`,
          ];
          for (const p of d.paths) lines.push(`  ${p}`);
          if (d.waitedMs && d.waitedMs > 500) {
            lines.push(`(waited ${Math.round(d.waitedMs)}ms for the serialize lock)`);
          }
          return lines.join("\n");
        },
      });
    } finally {
      releaseLock(lock);
    }
  },
});
