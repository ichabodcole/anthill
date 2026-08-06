import { describe, expect, test } from "bun:test";
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

describe("exit-path payloads must stay far below the pipe ceiling", () => {
  test("`help --json`'s manifest — the largest payload emitted before a process.exit", async () => {
    const manifest = await buildManifest(main);
    const bytes = Buffer.byteLength(`${JSON.stringify(manifest, null, 2)}\n`, "utf8");

    // The positive control, carried inside the assertion rather than beside it:
    // a manifest that had collapsed to nothing would also be "under the limit",
    // and would pass a bare ceiling check while proving nothing.
    expect(bytes).toBeGreaterThan(1_000);

    // The cell that fails. If this goes red, the fix is NOT to raise SAFE_MAX:
    // it is to drop the `process.exit(0)` on that path in `cli.ts` and let the
    // process end naturally, which is what every large emitter here already does.
    expect(bytes).toBeLessThan(SAFE_MAX);
  });
});
