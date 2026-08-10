/**
 * THE BOARD BINDING — the artifact the convene guard NAMES, which it was not
 * reading.
 *
 * The guard's stated reason is that `.bounty-session` is a single repo-root file.
 * Every signal it actually consulted came from the comms session-open record —
 * written by `spawn`, while `.bounty-session` is written by `convene`. So the
 * whole convene → brief → spawn window was unguarded, in the guard's own
 * scenario. Measured on a two-team fixture before the fix:
 *
 *     $ anthill convene --team dev    → .bounty-session = k-myproject-1a36f1b1
 *     $ anthill convene --team lean   → ok:true, REBOUND to k-lean-1a36f1b1
 *
 * ⚠ THE ROUND-TRIP TEST IS THE LOAD-BEARING ONE, and it is why this file exists
 * rather than a few more cases in the pure suite. `boardOwnerFromBinding` reads
 * spellbook's derived id format (`k-<session-key>-<hash>`), which anthill does not
 * own. If that derivation changes, the pure tests below still pass — they assert
 * against strings this file wrote — while the real guard silently returns `null`
 * for every binding and fails OPEN, which is exactly the bug it was added to fix.
 * The round-trip runs a real `convene` and asserts the reader recognizes what the
 * writer wrote, so an upstream format change goes RED here instead.
 *
 * CLEANUP: one module-level `mkdtempSync` + `afterAll(rmSync)` (see
 * `tmpleak.guard.test.ts`).
 */

import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { SPELLBOOK_CACHE_ROOT } from "../coord.ts";
import { boardOwnerFromBinding } from "./team-support.ts";
import { cleanGitEnv } from "./test-support.ts";

const CLI = resolve(import.meta.dir, "..", "cli.ts");
const GIT_ENV = cleanGitEnv();
const ROOT = mkdtempSync(join(tmpdir(), "anthill-boardbind-"));
afterAll(() => rmSync(ROOT, { recursive: true, force: true }));

const TEAMS = [
  { name: "dev", channel: "myproject" },
  { name: "lean", channel: "lean" },
];

describe("boardOwnerFromBinding — PURE", () => {
  test("names the team whose channel keyed the pinned board", () => {
    expect(boardOwnerFromBinding("k-myproject-1a36f1b1", TEAMS)).toBe("dev");
    expect(boardOwnerFromBinding("k-lean-1a36f1b1", TEAMS)).toBe("lean");
  });

  test("a binding no configured team keyed is null, not a guess", () => {
    // A stranger's board, or a session opened outside anthill. Returning a team
    // here would report the wrong team as holding the board — worse than
    // reporting none, since the refusal names the team.
    expect(boardOwnerFromBinding("k-someone-else-9999", TEAMS)).toBeNull();
    expect(boardOwnerFromBinding("", TEAMS)).toBeNull();
    expect(boardOwnerFromBinding("   \n", TEAMS)).toBeNull();
  });

  test("the prefix cannot match two teams, because channels are PREFIX-FREE", () => {
    // `config.ts` refuses `dev` beside `dev-lean`. That rule exists for
    // `anthill attach`'s sibling-folding, and this read is its second dependent:
    // without it, `k-dev-lean-<hash>` would match both `dev` and `dev-lean`.
    const bound = "k-dev-lean-abc123";
    const matches = [
      { name: "a", channel: "dev-lean" },
      { name: "b", channel: "dev" },
    ].filter((t) => boardOwnerFromBinding(bound, [t]) !== null);
    expect(matches.map((t) => t.name)).toEqual(["a", "b"]);
    // ^ BOTH match in isolation — which is precisely why the config layer must
    //   never allow this pair to coexist. Asserted so that if the prefix-free
    //   rule is ever relaxed, this test documents what it takes with it.
  });
});

/**
 * ⚠ GATED ON SPELLBOOK BEING INSTALLED, and the ungated version turned CI red.
 *
 * This test runs a REAL `anthill convene`, which shells out to spellbook's
 * `bounty` — an optional dependency this repo resolves at runtime and CI does not
 * install. It passed on every developer machine and failed on the one environment
 * that had never seen spellbook.
 *
 * **The comment below the assertion said exactly the right thing and the code did
 * the opposite** — _"if bounty is unavailable the marker never appears, REPORT
 * that rather than asserting on a file that was never written, so a missing
 * dependency does not read as a format change"_ — and then it asserted. A
 * skipped-dependency failure was reported as the upstream-format-change alarm.
 *
 * `test.skipIf` is the idiom this repo already uses for exactly this
 * (`coord.test.ts`'s live smoke), keyed on the same `SPELLBOOK_CACHE_ROOT`.
 *
 * ⚠ AND THE COST HAS TO BE STATED, because a skip is silent by nature: **on CI
 * this guard does not run.** Its whole job is to catch spellbook changing its
 * derived-id format, so a green CI is NOT evidence the round trip holds — only a
 * green local run is. That is a real gap, and the honest fix is installing
 * spellbook in CI rather than pretending the skip covers it. Filed, not hidden.
 */
describe("ROUND TRIP — what `convene` writes, this reader recognizes", () => {
  const haveSpellbook = existsSync(SPELLBOOK_CACHE_ROOT);

  test.skipIf(!haveSpellbook)(
    "a real convene's `.bounty-session` resolves back to the team that wrote it",
    async () => {
      const dir = join(ROOT, "roundtrip");
      mkdirSync(join(dir, ".anthill"), { recursive: true });
      writeFileSync(
        join(dir, ".anthill/config.json"),
        JSON.stringify({
          version: 2,
          teams: {
            dev: {
              channel: "myproject",
              lead: "maestro",
              seats: [{ handle: "maestro", role: "lead", scope: "o" }],
              paths: { teamDir: ".anthill" },
            },
            lean: {
              lead: "boss",
              seats: [{ handle: "boss", role: "lead", scope: "o" }],
            },
          },
        }),
      );

      const proc = Bun.spawn(["bun", CLI, "convene", "--team", "dev", "--format", "json"], {
        cwd: dir,
        stdout: "pipe",
        stderr: "pipe",
        env: GIT_ENV,
      });
      await proc.exited;

      // Reached only when spellbook IS installed (see the describe), so a missing
      // marker here is a real failure rather than an absent dependency — which is
      // the distinction the un-gated version collapsed.
      const marker = join(dir, ".bounty-session");
      expect({ marker: ".bounty-session", written: existsSync(marker) }).toEqual({
        marker: ".bounty-session",
        written: true,
      });

      const binding = readFileSync(marker, "utf8");
      expect({ binding: binding.trim(), owner: boardOwnerFromBinding(binding, TEAMS) }).toEqual({
        binding: binding.trim(),
        owner: "dev",
      });
    },
  );
});
