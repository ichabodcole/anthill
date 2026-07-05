/**
 * `anthill scan` — deterministic repo reader that emits the ratified `ScanReport`
 * (seams.md Contract 1). Consumed by weaver's bootstrap candidate-seating logic.
 *
 * Design: pure detectors (the unit-test target) + a thin orchestrator that does the
 * real filesystem reads. The command layer (`commands/team-scan.ts`) wraps
 * `buildScanReport` in the `{ ok, data }` envelope via the agent-layer.
 *
 * Load-bearing invariant: `root` resolves BEFORE `.anthill/` exists — scan runs
 * during bootstrap discovery, so it MUST NOT key off the config walk-up (that throws
 * with no config). It resolves by `.git` / topmost `package.json` / cwd instead.
 *
 * v1 scope (ratified): `stack` is derived from `package.json` deps only, ordered
 * dominant-first. No config-file / language / runtime sniffing (deferred, YAGNI).
 */

import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

// ---- The ratified contract (seams.md Contract 1) ---------------------------

export interface ScanReport {
  /** Absolute repo root: `.git` dir / topmost `package.json` / cwd — pre-`.anthill`. */
  root: string;
  /** `null` ⇒ single-surface. Manager/globs are detection byproducts. */
  workspace: { manager: PackageManager | null; globs: string[] } | null;
  /** Workspace members; single-surface ⇒ the ONE root package (len 1, path "."). */
  units: ScanUnit[];
  /** Non-fatal notices — house convention: on `data.warnings`, never stderr in JSON mode. */
  warnings?: string[];
}

export interface ScanUnit {
  /** package.json "name", else dir basename. */
  name: string;
  /** Repo-relative POSIX dir; "." for root / single-surface. */
  path: string;
  /** Best-effort hybrid hint: glob position refined by manifest signals. */
  kind: "app" | "package";
  /** Dep-derived framework markers, DOMINANT-FIRST (stack[0] = primary); [] if unknown. */
  stack: string[];
  /** package.json "private". */
  private: boolean;
  /** Names of OTHER units this depends on (deps ∩ member names). */
  internalDeps: string[];
}

export type PackageManager = "bun" | "pnpm" | "npm" | "yarn";

/** The shape we read out of a package.json — every field optional / defensive. */
export interface Manifest {
  name?: string;
  private?: boolean;
  workspaces?: string[] | { packages?: string[] };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

// ---- Framework marker table (dominant-first) -------------------------------

/**
 * Ordered dominant-first so `sniffStack` yields `stack[0]` = the primary framework.
 * Meta-frameworks rank above their base lib (next before react, nuxt before vue,
 * expo before react-native, sveltekit before svelte) so a shared base (e.g. react)
 * never false-folds two surfaces with different primaries.
 * Each entry maps the emitted marker to the package name(s) that signal it.
 */
const FRAMEWORK_MARKERS: ReadonlyArray<{ marker: string; deps: readonly string[] }> = [
  { marker: "next", deps: ["next"] },
  { marker: "remix", deps: ["@remix-run/react", "@remix-run/node", "@remix-run/server-runtime"] },
  { marker: "nuxt", deps: ["nuxt"] },
  { marker: "sveltekit", deps: ["@sveltejs/kit"] },
  { marker: "astro", deps: ["astro"] },
  { marker: "expo", deps: ["expo"] },
  { marker: "react-native", deps: ["react-native"] },
  { marker: "vue", deps: ["vue"] },
  { marker: "svelte", deps: ["svelte"] },
  { marker: "solid", deps: ["solid-js"] },
  { marker: "react", deps: ["react"] },
  { marker: "nest", deps: ["@nestjs/core"] },
  { marker: "fastify", deps: ["fastify"] },
  { marker: "hono", deps: ["hono"] },
  { marker: "elysia", deps: ["elysia"] },
  { marker: "express", deps: ["express"] },
];

// ---- Pure detectors --------------------------------------------------------

/**
 * Resolve the absolute repo root for scan, BEFORE `.anthill/` exists.
 * Priority: nearest ancestor holding `.git`, else the TOPMOST ancestor holding a
 * `package.json`, else `startDir`. Never uses the config walk-up (would throw at
 * bootstrap time). Pure over the filesystem — deterministic for a given tree.
 */
export function resolveScanRoot(startDir: string): string {
  const start = resolve(startDir);
  let dir = start;
  let topmostPkgDir: string | null = null;
  while (true) {
    if (existsSync(join(dir, ".git"))) return dir;
    if (existsSync(join(dir, "package.json"))) topmostPkgDir = dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return topmostPkgDir ?? start;
}

/** Lockfile-based package-manager sniff. Returns null when no lockfile is present. */
export function detectManager(rootDir: string): PackageManager | null {
  if (existsSync(join(rootDir, "bun.lock")) || existsSync(join(rootDir, "bun.lockb"))) return "bun";
  if (existsSync(join(rootDir, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(rootDir, "package-lock.json"))) return "npm";
  if (existsSync(join(rootDir, "yarn.lock"))) return "yarn";
  return null;
}

/**
 * Workspace globs = `package.json` `workspaces` (array or `{ packages }` form) unioned
 * with a hand-parsed pnpm `packages:` list. Order preserved (package.json first),
 * deduped. No YAML dependency — the pnpm parse reads just the one `packages:` block.
 */
export function parseWorkspaceGlobs(rootPkg: Manifest, pnpmYamlText?: string): string[] {
  const out: string[] = [];
  const ws = rootPkg.workspaces;
  if (Array.isArray(ws)) out.push(...ws);
  else if (ws && Array.isArray(ws.packages)) out.push(...ws.packages);
  if (pnpmYamlText) out.push(...parsePnpmPackages(pnpmYamlText));
  // Dedupe, drop negations (v1 doesn't expand excludes) and empties.
  const seen = new Set<string>();
  const globs: string[] = [];
  for (const g of out) {
    const t = g.trim();
    if (!t || t.startsWith("!") || seen.has(t)) continue;
    seen.add(t);
    globs.push(t);
  }
  return globs;
}

/**
 * Hand-parse the `packages:` list out of a pnpm-workspace.yaml. Reads the block of
 * `- item` list entries directly under a `packages:` key; stops at the next
 * non-indented / non-list line. Intentionally minimal (ratified: no YAML dep).
 */
export function parsePnpmPackages(yamlText: string): string[] {
  const lines = yamlText.split(/\r?\n/);
  const globs: string[] = [];
  let inBlock = false;
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, ""); // strip trailing comments
    if (/^\s*packages\s*:/.test(line)) {
      inBlock = true;
      continue;
    }
    if (!inBlock) continue;
    const item = line.match(/^\s*-\s*(.+?)\s*$/);
    if (item?.[1]) {
      globs.push(stripQuotes(item[1]));
      continue;
    }
    // A non-empty, non-list line ends the block.
    if (line.trim() !== "") break;
  }
  return globs;
}

function stripQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

/** All declared dependency names (prod + dev + peer) as a set. */
function allDepNames(manifest: Manifest): Set<string> {
  return new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ]);
}

/**
 * Framework markers present in the manifest's deps, DOMINANT-FIRST (table order).
 * `stack[0]` is the primary framework; [] when nothing matches.
 */
export function sniffStack(manifest: Manifest): string[] {
  const deps = allDepNames(manifest);
  const stack: string[] = [];
  for (const { marker, deps: pkgs } of FRAMEWORK_MARKERS) {
    if (pkgs.some((p) => deps.has(p))) stack.push(marker);
  }
  return stack;
}

/**
 * Best-effort hybrid kind hint. Glob POSITION is primary (`apps/*`⇒app,
 * `packages/*`⇒package); when position is silent (e.g. root ".") the MANIFEST
 * signal decides (private + framework ⇒ app; publishable + no framework ⇒ package).
 * Default unknown ⇒ package. Raw signals (private/stack/internalDeps) stay exposed so
 * weaver can overrule a mislabel.
 */
export function classifyUnit(manifest: Manifest, relPath: string): "app" | "package" {
  const firstSeg = relPath.split("/")[0];
  if (firstSeg === "apps") return "app";
  if (firstSeg === "packages") return "package";

  const hasFramework = sniffStack(manifest).length > 0;
  const isPrivate = manifest.private === true;
  if (isPrivate && hasFramework) return "app";
  if (!isPrivate && !hasFramework) return "package";
  return "package";
}

/**
 * Names of OTHER member units this manifest depends on — deps ∩ member names, minus
 * self, sorted for golden stability. These are the edges weaver's fan-in ≥ 2 folds over.
 */
export function internalDepsOf(manifest: Manifest, memberNames: Iterable<string>): string[] {
  const members = new Set(memberNames);
  const self = manifest.name;
  const deps = allDepNames(manifest);
  const out: string[] = [];
  for (const dep of deps) {
    if (dep !== self && members.has(dep)) out.push(dep);
  }
  return out.sort();
}

// ---- Orchestrator (does the filesystem reads) ------------------------------

function readManifest(pkgPath: string): Manifest | null {
  try {
    return JSON.parse(readFileSync(pkgPath, "utf8")) as Manifest;
  } catch {
    return null;
  }
}

function toPosix(p: string): string {
  return p.split("\\").join("/");
}

/** Expand workspace globs to repo-relative member dirs (dirs holding a package.json). */
function expandMembers(rootDir: string, globs: string[]): string[] {
  const found = new Set<string>();
  for (const glob of globs) {
    const pattern = `${glob.replace(/\/+$/, "")}/package.json`;
    const scanner = new Bun.Glob(pattern);
    for (const rel of scanner.scanSync({ cwd: rootDir, onlyFiles: true, dot: false })) {
      found.add(toPosix(dirname(rel)));
    }
  }
  return [...found].sort();
}

/**
 * Build the ratified `ScanReport` for an already-resolved absolute `rootDir`.
 * Never throws on manifest/IO problems — degrades to warnings (house guard pattern).
 */
export function buildScanReport(rootDir: string): ScanReport {
  const root = resolve(rootDir);
  const warnings: string[] = [];

  const rootPkgPath = join(root, "package.json");
  const rootPkg = readManifest(rootPkgPath);
  if (!rootPkg) {
    warnings.push(
      existsSync(rootPkgPath)
        ? `root package.json at ${toPosix(relative(root, rootPkgPath)) || "package.json"} is unreadable / malformed`
        : "no package.json at repo root",
    );
  }

  const pnpmYamlPath = join(root, "pnpm-workspace.yaml");
  const pnpmYamlText = existsSync(pnpmYamlPath) ? readFileSync(pnpmYamlPath, "utf8") : undefined;
  const globs = parseWorkspaceGlobs(rootPkg ?? {}, pnpmYamlText);

  // Single-surface: no workspace globs ⇒ the ONE root package at path ".".
  if (globs.length === 0) {
    const manifest = rootPkg ?? {};
    const unit: ScanUnit = {
      name: manifest.name ?? basename(root),
      path: ".",
      kind: classifyUnit(manifest, "."),
      stack: sniffStack(manifest),
      private: manifest.private === true,
      internalDeps: [],
    };
    return {
      root,
      workspace: null,
      units: [unit],
      ...(warnings.length > 0 && { warnings }),
    };
  }

  // Multi-surface: expand members, read each manifest, then resolve internalDeps
  // against the full member-name set (a second pass — names must all be known first).
  const memberDirs = expandMembers(root, globs);
  const loaded: Array<{ relPath: string; manifest: Manifest }> = [];
  for (const relPath of memberDirs) {
    const manifest = readManifest(join(root, relPath, "package.json"));
    if (!manifest) {
      warnings.push(`member package.json at ${relPath} is unreadable / malformed — skipped`);
      continue;
    }
    loaded.push({ relPath, manifest });
  }

  const memberNames = new Set(
    loaded.map(({ relPath, manifest }) => manifest.name ?? basename(relPath)),
  );

  const units: ScanUnit[] = loaded.map(({ relPath, manifest }) => ({
    name: manifest.name ?? basename(relPath),
    path: relPath,
    kind: classifyUnit(manifest, relPath),
    stack: sniffStack(manifest),
    private: manifest.private === true,
    internalDeps: internalDepsOf(manifest, memberNames),
  }));

  return {
    root,
    workspace: { manager: detectManager(root), globs },
    units,
    ...(warnings.length > 0 && { warnings }),
  };
}
