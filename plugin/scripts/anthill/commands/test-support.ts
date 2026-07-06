/**
 * Shared test support for the subprocess-driven command tests.
 *
 * `cleanGitEnv()` returns a copy of this process's environment with every
 * `GIT_*` variable removed. Pass it as the `env` of any git (or CLI) subprocess
 * a test spawns against a throwaway repo, so that git targets *that* repo — not
 * whatever git state the parent was carrying.
 *
 * Why it exists: when a pathspec commit (`git commit -- <path>`, or any
 * hand-run that isn't `anthill commit`) fires the husky pre-commit hook, git
 * exports `GIT_INDEX_FILE` — an absolute path to a *temporary* index — into the
 * hook's environment. The hook runs `bun test`, and any test that `git init`s a
 * temp repo and commits inside it inherits that `GIT_INDEX_FILE`, tries to build
 * a tree against the WRONG index, and dies with
 * `invalid object … Error building trees` (naming a file the temp repo has never
 * heard of).
 *
 * Note: a runtime `delete process.env.GIT_INDEX_FILE` does NOT fix this —
 * `Bun.spawn`/`Bun.spawnSync` inherit a snapshot of the environment taken at
 * process start and ignore later mutations. An explicit `env:` is the only
 * reliable scrub. See `.anthill/paper-cuts.md` (2026-07-05 release-prep #1).
 */
export function cleanGitEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && !key.startsWith("GIT_")) env[key] = value;
  }
  return env;
}
