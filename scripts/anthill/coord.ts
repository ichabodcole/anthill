/**
 * Coordination facade — a thin, generalized wrapper over the spellbook plugin's
 * `grapevine` + `bounty` CLIs. Lifted from dream-flute's `team-support.ts`.
 *
 * The single load-bearing reason this facade exists is `resolveCoordCli`: the
 * spellbook plugin lives in a versioned cache path that churns on every plugin
 * upgrade. Centralizing the brittle glob HERE means callers (and the calling
 * skills) never hard-code it.
 *
 * The version-pick is split into a PURE `selectCoordCli` (existence injected) so
 * the semver compare + path-building unit-test without touching the filesystem;
 * `resolveCoordCli` wires it to real fs and throws a clear error when spellbook
 * isn't installed. `execCoord` never throws — a missing daemon or failing verb
 * resolves to `{ ok: false }` so callers degrade gracefully.
 */

import { spawn } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type CoordTool = "grapevine" | "bounty";

/** The spellbook plugin cache root: <home>/.claude/plugins/cache/spellbook-marketplace/spellbook */
export const SPELLBOOK_CACHE_ROOT = join(
  homedir(),
  ".claude",
  "plugins",
  "cache",
  "spellbook-marketplace",
  "spellbook",
);

/** Compare two dotted version strings (e.g. "1.10.0" vs "1.7.0") numerically. */
export function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map((n) => Number.parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** Build the absolute path to a coord CLI within a given spellbook version dir. */
export function buildCoordCliPath(root: string, ver: string, tool: CoordTool): string {
  return join(root, ver, "skills", tool, "scripts", "cli.ts");
}

/**
 * PURE version-pick: from a list of version dir names, choose the HIGHEST semver
 * whose `<root>/<ver>/skills/<tool>/scripts/cli.ts` exists (per the injected
 * `exists` predicate). Returns the winning version + cli path, or undefined.
 */
export function selectCoordCli(params: {
  root: string;
  tool: CoordTool;
  versionDirs: string[];
  exists: (path: string) => boolean;
}): { ver: string; cli: string } | undefined {
  const { root, tool, versionDirs, exists } = params;
  return versionDirs
    .map((ver) => ({ ver, cli: buildCoordCliPath(root, ver, tool) }))
    .filter((c) => exists(c.cli))
    .sort((a, b) => compareSemver(b.ver, a.ver))[0];
}

/**
 * Resolve the absolute path to a spellbook coordination CLI, picking the HIGHEST
 * installed semver. Globs:
 *   ~/.claude/plugins/cache/spellbook-marketplace/spellbook/<ver>/skills/<tool>/scripts/cli.ts
 * Throws a clear error naming the expected path if spellbook isn't installed.
 */
export function resolveCoordCli(tool: CoordTool): string {
  let versionDirs: string[];
  try {
    versionDirs = readdirSync(SPELLBOOK_CACHE_ROOT).filter((name) => {
      try {
        return statSync(join(SPELLBOOK_CACHE_ROOT, name)).isDirectory();
      } catch {
        return false;
      }
    });
  } catch {
    throw new Error(
      `anthill: spellbook plugin cache not found at ${SPELLBOOK_CACHE_ROOT}. ` +
        "Is the spellbook plugin installed? (anthill depends on spellbook for grapevine + bounty.)",
    );
  }

  const best = selectCoordCli({ root: SPELLBOOK_CACHE_ROOT, tool, versionDirs, exists: existsSync });
  if (!best) {
    throw new Error(
      `anthill: could not resolve the spellbook ${tool} CLI under ` +
        `${SPELLBOOK_CACHE_ROOT}/*/skills/${tool}/scripts/cli.ts. ` +
        "Is the spellbook plugin installed?",
    );
  }
  return best.cli;
}

export interface ExecResult {
  ok: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Exec a resolved coord CLI via `bun <cli> <args...>`, capturing stdout/stderr.
 * Never throws — a missing daemon / failing verb / unspawnable binary resolves
 * to `ok: false` so callers degrade gracefully instead of crashing.
 *
 * `opts.cwd` defaults to `process.cwd()` (the team layer is cwd-anchored via the
 * `.team/config.json` root marker, not a package-name root).
 */
export function execCoord(
  cliPath: string,
  args: string[],
  opts: { cwd?: string } = {},
): Promise<ExecResult> {
  return new Promise((resolveP) => {
    const child = spawn("bun", [cliPath, ...args], {
      cwd: opts.cwd ?? process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (err) => {
      resolveP({ ok: false, exitCode: 1, stdout, stderr: err.message });
    });
    child.on("close", (code) => {
      resolveP({ ok: (code ?? 1) === 0, exitCode: code ?? 1, stdout, stderr });
    });
  });
}

/** Best-effort JSON parse of the FIRST JSON line on stdout. Returns null on failure. */
export function parseJsonLine<T = unknown>(stdout: string): T | null {
  const line = stdout
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("{") || l.startsWith("["));
  if (!line) return null;
  try {
    return JSON.parse(line) as T;
  } catch {
    return null;
  }
}

/**
 * Compact a captured stderr blob into a single short reason. Coord CLIs can dump
 * a full multi-line Bun stack trace (e.g. a dead daemon's ConnectionRefused); we
 * keep only the first meaningful line so warnings stay readable.
 */
export function firstErrorLine(stderr: string, fallback: string): string {
  const line = stderr
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !/^\d+\s*\|/.test(l) && !/^\^/.test(l));
  return line || fallback;
}
