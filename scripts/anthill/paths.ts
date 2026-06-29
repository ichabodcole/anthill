/**
 * Project-root discovery for the SEED's own commands (info show/env). Walks up
 * from process.cwd() looking for a package.json whose `name` matches the expected
 * root package name.
 *
 * Why not `import.meta.dir` / `import.meta.url`? Those point at the CLI
 * source — they break the moment you compile to a binary and the binary
 * gets moved to $PATH. Walking from cwd() is the same pattern git, cargo,
 * and deno use.
 *
 * IMPORTANT (portability): anthill is a PORTABLE CLI run from the plugin cache
 * against arbitrary target repos, so the host package.json named "anthill" often
 * won't exist above cwd. This resolver therefore FALLS BACK to cwd instead of
 * throwing — a throw here would crash the whole CLI at import time (cli.ts pulls
 * this in transitively via the info command) the moment it runs outside this
 * repo. The team commands do NOT use this at all: they key off the
 * `.team/config.json` root marker (config.ts). See spec §5.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** The package.json `name` of the host project. Change when renaming the project root. */
export const PROJECT_PACKAGE_NAME = "anthill";

function findProjectRoot(expectedName: string): string {
  const start = process.cwd();
  let dir = start;
  while (true) {
    const pkgPath = resolve(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
        if (pkg.name === expectedName) return dir;
      } catch {
        // malformed package.json — keep walking
      }
    }
    const parent = dirname(dir);
    if (parent === dir) {
      // Not found — the portable CLI is running outside its own repo. Fall back
      // to cwd rather than throw at import (info show/env degrade via their own
      // try/catch; team commands don't depend on this).
      return start;
    }
    dir = parent;
  }
}

export const PROJECT_ROOT = findProjectRoot(PROJECT_PACKAGE_NAME);

// Well-known paths — extend as your project grows.
// Example: export const LOG_DIR = resolve(PROJECT_ROOT, "logs");


