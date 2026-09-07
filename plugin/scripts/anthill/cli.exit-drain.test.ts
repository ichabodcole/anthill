import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { main } from "./cli.ts";
import { buildManifest } from "./manifest.ts";

/**
 * ⚠ THIS FILE GUARDS AN IMMUNITY WE HAVE BY ACCIDENT, NOT BY DESIGN.
 *
 * **Bun's stdout is ASYNC on a pipe and SYNC on a TTY or file.** So
 * `process.exit()` discards whatever has not drained — and the loss is a
 * truncation at exactly 65536 bytes that still parses as JSON for the first
 * 64KB, on the surface an agent consumes.
 *
 * Measured in this repo's own runtime, one variable:
 *
 *     write 300_000 bytes then process.exit(0)  ->  pipe: 65536   file: 300000
 *     write 300_000 bytes, natural return       ->  pipe: 300000  file: 300000
 *
 * **anthill is not immune. anthill is under the limit.** Its `process.exit`
 * sites (`cli.ts` — `help --json`, `help`, `--version`, `--help`) all emit small
 * payloads, and every LARGE emitter (`comms read`, `status`, `commit`) returns
 * and lets the process end. **Nobody decided that.** It is
 * `principles.md`'s *A MASK IS NOT A DEPENDENCY*: a side effect that happens to
 * be load-bearing appears in no graph, so nothing announces when a correct,
 * unrelated change removes it.
 *
 * Two ways it breaks, both plausible and neither visible in review:
 *   1. someone adds `process.exit(0)` to a large-output path — a reasonable
 *      "exit non-zero on failure" tidy;
 *   2. `help --json` simply GROWS past 64KB as commands are added.
 *
 * _Told to us by spellbook's maintainer (spellbook#80) while root-causing the
 * same defect in `bounty state`, which truncates at 65536 through a pipe. They
 * root-caused it; we had the working reference and did not know why it worked.
 * Neither project could have produced this alone._
 *
 * ⚠ WHY THIS IS A SIZE TRIPWIRE AND NOT A PIPE TEST. The obvious test — pipe
 * `help --json` and assert it arrives whole — **passes vacuously today at ~17KB**,
 * because under the ceiling the bug cannot manifest. It would go green for years
 * and then go green on the day it broke, since a 64KB truncation of a 64KB
 * payload is indistinguishable from success. A control that cannot come out
 * differently is not a control. **This one CAN fail: it fails when the payload
 * approaches the cliff, which is the only moment anyone can still act.**
 */

/** Bun's pipe buffer, and the exact byte count a `process.exit` truncates to. */
const PIPE_CEILING = 65_536;

/**
 * Half the ceiling. Not tuned — chosen so the failure lands while there is still
 * room to act, rather than at the edge where the next command tips it over.
 */
const SAFE_MAX = PIPE_CEILING / 2;

/**
 * 2026-09-03: the manifest crossed SAFE_MAX (32,874 bytes after `wiki lint` and
 * `commit --curated` landed) and the tripwire fired as designed. Its remedy was
 * taken — the root `--help` manifest path now RETURNS instead of exiting — so
 * the manifest is no longer an exit-path payload and is not measured here. What
 * IS still emitted before a `process.exit`: a single command's manifest entry
 * (`<cmd> --help` in JSON), rendered usage, and `--version`. Those stay under
 * the tripwire below. And because the immunity was accidental once, the exit's
 * absence on the manifest path is pinned against the SOURCE, with a positive
 * control, so a tidy-up that puts it back goes red here rather than at 64KB.
 */
const CLI_SRC = readFileSync(new URL("./cli.ts", import.meta.url), "utf8");

/** The CODE lines that follow the root-manifest emit on the `--help` path —
 * comments stripped, because the comment beside that `return` names the very
 * call this guard looks for, and a guard that reads its own explanation as
 * the defect is blind in the other direction. */
export function afterRootManifestEmit(src: string, lines = 8): string {
  const marker = 'data: manifest, renderText: () => ""';
  const at = src.indexOf(marker);
  if (at < 0) throw new Error("root-manifest emit not found in cli.ts — the marker moved");
  return src
    .slice(at)
    .split("\n")
    .filter((l) => !l.trim().startsWith("//"))
    .slice(0, lines)
    .join("\n");
}

describe("exit-path payloads must stay far below the pipe ceiling", () => {
  test("the largest SINGLE-COMMAND manifest entry — what `<cmd> --help` emits before exiting", async () => {
    const manifest = await buildManifest(main);
    const sizes: number[] = [];
    const walk = (cmds: typeof manifest.commands) => {
      for (const c of cmds) {
        sizes.push(Buffer.byteLength(`${JSON.stringify(c, null, 2)}\n`, "utf8"));
        walk(c.subcommands);
      }
    };
    walk(manifest.commands);
    const largest = Math.max(...sizes);
    // Positive control: a manifest that had collapsed to nothing would also be
    // "under the limit" and prove nothing.
    expect(largest).toBeGreaterThan(500);
    expect(largest).toBeLessThan(SAFE_MAX);
  });

  test("the WHOLE manifest is no longer emitted before an exit — the root --help path returns", () => {
    const tail = afterRootManifestEmit(CLI_SRC);
    expect(tail).not.toContain("process.exit");
    expect(tail).toContain("return;");
  });

  test("POSITIVE CONTROL — the source guard sees an exit put back", () => {
    const withExitBack = CLI_SRC.replace(
      'data: manifest, renderText: () => "" });',
      'data: manifest, renderText: () => "" });\n        process.exit(0);',
    );
    expect(withExitBack).not.toBe(CLI_SRC);
    expect(afterRootManifestEmit(withExitBack)).toContain("process.exit");
  });

  test("the manifest itself is still far from the pipe ceiling — a number, so growth is visible", async () => {
    const manifest = await buildManifest(main);
    const bytes = Buffer.byteLength(`${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    // Not an exit-path payload any more, so the bound is the ceiling itself:
    // past it the `help` verb's own natural-return drain is the only thing
    // keeping the document whole, and that is a property worth knowing you
    // are relying on.
    expect(bytes).toBeGreaterThan(1_000);
    expect(bytes).toBeLessThan(PIPE_CEILING);
  });
});
