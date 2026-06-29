/**
 * Project-root discovery. Walks up from process.cwd() looking for a
 * package.json whose `name` matches the expected root package name.
 *
 * Why not `import.meta.dir` / `import.meta.url`? Those point at the CLI
 * source — they break the moment you compile to a binary and the binary
 * gets moved to $PATH. Walking from cwd() is the same pattern git, cargo,
 * and deno use.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** The package.json `name` of the host project. Change when renaming the project root. */
export const PROJECT_PACKAGE_NAME = "anthill";

function findProjectRoot(expectedName: string): string {
  let dir = process.cwd();
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
      throw new Error(
        `anthill: could not find project root (no package.json named "${expectedName}" in ${process.cwd()} or its parents). ` +
          `If you renamed the project, update PROJECT_PACKAGE_NAME in scripts/anthill/paths.ts.`,
      );
    }
    dir = parent;
  }
}

export const PROJECT_ROOT = findProjectRoot(PROJECT_PACKAGE_NAME);

// Well-known paths — extend as your project grows.
// Example: export const LOG_DIR = resolve(PROJECT_ROOT, "logs");


