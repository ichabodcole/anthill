import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { defineAnthillCommand } from "../define.ts";
import { acquireLock, releaseLock } from "../lock.ts";
import { nowMillis } from "../runtime.ts";
import { requireConfig } from "./team-support.ts";

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
  /** Dirty paths OUTSIDE this commit at the moment it landed. The gate ran over
   * the whole tree; the commit contains only `paths`. When this is non-empty the
   * gate's green was measured against work this commit does not include, so the
   * commit was never checked in isolation. Field-reported: the FALSE-GREEN. */
  uncheckedAgainst?: string[];
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

/** Is `path` inside the committed set (exact file, or under a committed dir)? */
function coveredBy(path: string, ourPaths: string[]): boolean {
  return ourPaths.some((p) => {
    const norm = p.replace(/\/+$/, "");
    return path === norm || path.startsWith(`${norm}/`);
  });
}

/**
 * PURE: given `git status --porcelain` output and the paths we committed, which
 * DIRTY paths lie OUTSIDE our commit?
 *
 * Why this exists (anthill#50, #24, #28, #55 — the "foreign red"): file-scoping
 * bounds the COMMIT, not the GATE. The project's pre-commit hook sees the whole
 * working tree, so a peer's mid-TDD red test or unformatted file fails YOUR
 * commit and the error names a file you don't own. Seats then debug their own
 * clean lane. Naming the foreign dirt at the moment of failure converts an
 * opaque bounce into "that red isn't yours".
 *
 * Runs only on the FAILURE path — the gate has already run, so this costs
 * nothing in the happy case and needs no pre-flight proxy for the gate.
 *
 * Porcelain v1 lines are `XY <path>`, with renames as `XY <old> -> <new>`.
 * Both sides of a rename are reported; either being foreign is worth naming.
 */
export function foreignDirtyPaths(porcelain: string, ourPaths: string[]): string[] {
  const out: string[] = [];
  for (const raw of porcelain.split("\n")) {
    if (raw.trim().length === 0) continue;
    // Status is 2 cols then a space — BUT this string may have been trimmed on
    // the way in, and an unstaged status leads with a space (" M path"), so the
    // FIRST line can arrive as "M path" with the column already eaten. A fixed
    // slice(3) then removes the path's first character, and only on that line —
    // the reported "corrupts the first path, conditionally". Match the status
    // instead of counting characters: 1-2 non-space status chars, then space(s).
    const body = (/^\s{0,2}\S{1,2}\s+(.*)$/.exec(raw)?.[1] ?? raw.slice(3)).trim();
    if (body.length === 0) continue;
    const parts = body.includes(" -> ") ? body.split(" -> ") : [body];
    for (const part of parts) {
      // Porcelain quotes paths containing specials; strip for comparison.
      const p = part.trim().replace(/^"(.*)"$/, "$1");
      if (p.length > 0 && !coveredBy(p, ourPaths) && !out.includes(p)) out.push(p);
    }
  }
  return out;
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
    as: {
      type: "string",
      description: "Seat handle to attribute this commit to (must be in config.seats)",
      valueHint: "handle",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const rawMessage = (ctx.args.message as string | undefined)?.trim();
    // `--as` is validated against the roster BEFORE anything is staged: a bogus
    // handle must not leave the tree half-touched. Field-requested by all four
    // seats of a consuming team — every commit on a shared tree is authored by
    // the human, so "who landed this?" was unanswerable after the fact.
    const seat = (ctx.args.as as string | undefined)?.trim();
    if (seat !== undefined) {
      const config = requireConfig(format, "commit");
      if (!config.seat(seat)) {
        const seats = config.roster().map((s) => s.handle);
        emitError({
          format,
          command: "commit",
          error: `unknown seat "${seat}". Valid handles: ${seats.join(", ") || "(none in config)"}`,
        });
        process.exit(1);
      }
    }
    // The trailer is appended, never substituted — git's own `%an` still shows
    // the human, so this ADDS a machine-greppable seat rather than claiming to
    // replace authorship. `git log --grep "Anthill-Seat: <handle>"` is the point.
    const message = seat && rawMessage ? `${rawMessage}\n\nAnthill-Seat: ${seat}` : rawMessage;
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
    const waitedMs = acquireLock(lock, {
      waitMs: LOCK_WAIT_MS,
      staleMs: LOCK_STALE_MS,
      pollMs: LOCK_POLL_MS,
    });

    // Which of OUR paths were ALREADY staged before we touched the index? We must
    // know this to put the index back exactly as we found it if we bail — see
    // `restoreIndex` below.
    const preStaged = stagedList(
      git(["diff", "--cached", "--name-only", "--no-renames", "--", ...paths], root).stdout,
    );

    /**
     * Put the index back the way we found it. Called on EVERY failure path.
     *
     * anthill#55: we stage BEFORE the gate runs (we must — the gate inspects the
     * index), so a failed commit used to leave our paths staged. Every peer's
     * `anthill commit` then correctly refused ("staged content beyond my paths"),
     * making the bounced seat the index-holder for the whole team WITHOUT KNOWING
     * IT — the same event that blocked you also hid that you were now blocking
     * everyone. Three seats and the lead hit this in one session.
     */
    function restoreIndex(): void {
      // Unstage ONLY what we staged. Paths the seat had already staged before we
      // ran are left untouched — resetting those would silently discard another
      // intention (and for an already-staged DELETION, a reset would resurrect
      // the index entry while the file stays gone, which is not "as we found it").
      const weStaged = paths.filter((p) => !preStaged.includes(p));
      if (weStaged.length > 0) git(["reset", "--quiet", "--", ...weStaged], root);
    }

    try {
      // Stage exactly these paths (explicit pathspec → never a peer's file; also
      // the only way a NEW/untracked path is picked up).
      //
      // `-A` is load-bearing: without it, `git add` dies with "pathspec did not
      // match" on a path that was DELETED (`git rm`) or is the old half of a
      // `git mv` rename pair, so a chapter containing removals or a file move
      // could not be landed through the wrapper at all and had to bypass to a raw
      // `git commit` — defeating the serialization (anthill#48, #51). Scoped by
      // the explicit pathspec, `-A` still cannot reach a peer's file.
      //
      // A path git cannot MATCH is not necessarily an error: `git rm x` already
      // removed x from both the worktree and the index, so the deletion is
      // staged and there is nothing left for `add` to match. Naming x in the
      // pathspec is still correct — it IS part of this commit. So partition
      // first, and only complain about a path that is neither matchable nor
      // already staged (that one is a genuine typo, and silently ignoring it
      // would land a commit missing the file the seat meant to include).
      const matchable = paths.filter(
        (p) => existsSync(join(root, p)) || git(["ls-files", "--", p], root).stdout.length > 0,
      );
      const unmatched = paths.filter((p) => !matchable.includes(p));
      const bogus = unmatched.filter((p) => !preStaged.includes(p));
      if (bogus.length > 0) {
        restoreIndex();
        releaseLock(lock);
        emitError({
          format,
          command: "commit",
          error:
            `path(s) not found in the worktree or the index: ${bogus.join(", ")}. ` +
            "Check for a typo — refusing rather than landing a commit that silently omits them.",
        });
        process.exit(1);
      }

      if (matchable.length > 0) {
        const staged = git(["add", "-A", "--", ...matchable], root);
        if (!staged.ok) {
          restoreIndex();
          throw new Error(`git add failed:\n${staged.stderr || staged.stdout || "unknown"}`);
        }
      }
      // Verify the index is EXACTLY our paths before a pathspec-less commit. We do
      // NOT use a partial (`git commit -- <paths>`) commit: that builds a temporary
      // index, and lint-staged's stash/backup dance corrupts that interaction —
      // every check passes, then the commit dies citing an invalid blob for an
      // unrelated file (the recurring paper-cut). A whole-index commit runs the
      // hook against the REAL index and sidesteps it — but only sweeps nothing if
      // the index really is just our paths, which this verification guarantees.
      // `--no-renames` is REQUIRED for this set-difference to be sound. With
      // rename detection on, git collapses `old -> new` into just `new`, so the
      // OLD half of a staged rename is invisible: our own `git mv` pair looks
      // half-unstaged, and — worse — a peer's staged rename could slip past the
      // sweep guard because the path it would have been caught by never appears.
      const full = git(["diff", "--cached", "--name-only", "--no-renames"], root);
      const ours = git(["diff", "--cached", "--name-only", "--no-renames", "--", ...paths], root);
      if (!full.ok || !ours.ok) {
        restoreIndex();
        throw new Error(`git diff --cached failed:\n${full.stderr || ours.stderr || "unknown"}`);
      }
      const unexpected = unexpectedStaged(stagedList(full.stdout), stagedList(ours.stdout));
      if (unexpected.length > 0) {
        // Restore the index to how we found it, then refuse with the
        // dual-audience envelope — same guard style as no-paths.
        restoreIndex();
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

        // The gate has already run and failed. Before we hand back the error,
        // check whether the tree is dirty OUTSIDE our commit — because on a
        // shared tree the whole-tree pre-commit hook fails on a peer's work just
        // as readily as on ours, and the message names a file we don't own.
        // Telling the seat "this red may not be yours" is the difference between
        // a 30-second retry and half an hour debugging a clean lane.
        const status = git(["status", "--porcelain"], root);
        const foreign = status.ok ? foreignDirtyPaths(status.stdout, paths) : [];

        // Unstage FIRST — leaving the index held is what silently made a bounced
        // seat the blocker for everyone else (anthill#55).
        restoreIndex();

        const hint =
          foreign.length > 0
            ? `\n\nNOTE: the gate runs over the WHOLE tree, and ${foreign.length} path(s) outside ` +
              `your commit are currently dirty:\n` +
              `${foreign
                .slice(0, 12)
                .map((p) => `  ${p}`)
                .join("\n")}` +
              `${foreign.length > 12 ? `\n  … and ${foreign.length - 12} more` : ""}\n` +
              `If the failure above names one of those, it is NOT your commit — a peer's in-flight ` +
              `work is reddening the shared tree. Check with the team before debugging your own paths.`
            : "";
        const staleNote =
          preStaged.length > 0
            ? ""
            : "\n\nYour index has been restored, so you are not blocking other seats' commits. " +
              "This is an INDEX-level restore only: your working-tree edits are untouched and still " +
              "present. It does NOT isolate your work — a peer who commits a file you have edits in " +
              "will still carry them.";
        // Emit the envelope rather than throwing — this file's own rule, stated
        // above the argument guards, and this path was the one place breaking it.
        // A raw `throw` reaches cli.ts's fallback, which prints `err.stack`, so
        // five frames of Bun internals landed UNDER the foreign-red diagnostic
        // and buried the one line the reader needed.
        //
        // ⚠ RELEASE THE LOCK FIRST — `process.exit()` terminates immediately and
        // does NOT unwind `finally`, so converting the old `throw` into an
        // emit+exit silently dropped the `finally { releaseLock(lock) }` that had
        // covered this path. The two sibling guards above already release
        // explicitly for exactly this reason; this branch — the MOST common
        // failure, a red gate — was the one that didn't.
        //
        // The consequence was this file's own bug (anthill#55) moved from the
        // index onto the lock: every peer's commit queues 90s in `acquireLock`,
        // which then throws BEFORE the try — reaching cli.ts's fallback and
        // printing the very stack trace this change was made to remove.
        releaseLock(lock);
        emitError({
          format,
          command: "commit",
          error: `git commit failed:\n${detail}${hint}${staleNote}`,
        });
        process.exit(1);
      }
      const sha = git(["rev-parse", "--short", "HEAD"], root);
      // The FALSE-GREEN counterpart of the foreign-red diagnostic. The gate reads
      // the WORKING TREE; the commit holds NAMED PATHS. They coincide only when
      // exactly one seat is dirty. So a peer's UNCOMMITTED code can satisfy this
      // commit's dependency, the gate passes, and the landed commit is red in
      // isolation — silently, with nothing to notice. We already compute this set
      // for the failure path; printing it on success is the same information in
      // the direction nobody was looking.
      const after = git(["status", "--porcelain"], root);
      const unchecked = after.ok ? foreignDirtyPaths(after.stdout, paths) : [];
      const data: CommitData = {
        committed: true,
        sha: sha.ok ? sha.stdout : undefined,
        paths,
        message,
        waitedMs,
        ...(warnings.length > 0 && { warnings }),
        ...(unchecked.length > 0 && { uncheckedAgainst: unchecked }),
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
          const u = d.uncheckedAgainst ?? [];
          if (u.length > 0) {
            lines.push(
              "",
              `NOTE: the gate ran over the WHOLE tree, and ${u.length} path(s) outside this commit ` +
                `were dirty at the time:`,
            );
            for (const p of u.slice(0, 12)) lines.push(`  ${p}`);
            if (u.length > 12) lines.push(`  … and ${u.length - 12} more`);
            lines.push(
              "This commit was NOT checked in isolation — the green you just saw was measured " +
                "against those paths too. If any of them satisfy something this commit needs, " +
                "HEAD alone may be red.",
            );
          }
          return lines.join("\n");
        },
      });
    } finally {
      releaseLock(lock);
    }
  },
});
