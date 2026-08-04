import { describe, expect, test } from "bun:test";
import { resolveFormat } from "./agent-layer.ts";

/**
 * The dual-audience layer had NO test file. Every command emits through it, and
 * the format decision — the one that decides whether a human gets usage or an
 * agent gets a parseable envelope — was made from a global.
 *
 * `resolveFormat` took the FLAG as a parameter and reached for the TTY as
 * ambient state. `Bun.spawnSync` always yields a pipe, so **no test in this
 * suite could ever reach the TTY branch**: half the matrix was unreachable, and
 * "a human at a terminal still gets usage" was a shipped promise with no guard,
 * hand-verified once with `script -q /dev/null` and never since.
 */
describe("resolveFormat — the full dual-audience matrix, finally reachable", () => {
  // Asserted as a MATRIX rather than as six separate cases. Every individual
  // cell is satisfied by some hardcoded return value; only the set pins the
  // rule. This is the discriminator discipline from Contract 4's assertion (4)
  // and `positionState`'s three-value check, applied to a 2x3 grid.
  test("all six cells at once — the rule, not six coincidences", () => {
    const cell = (flag: string | undefined, isTTY: boolean) => resolveFormat(flag, isTTY);
    expect([
      cell("json", true),
      cell("json", false),
      cell("text", true),
      cell("text", false),
      cell(undefined, true),
      cell(undefined, false),
    ]).toEqual(["json", "json", "text", "text", "text", "json"]);
  });

  // Contract 5(c), stated as an executable assertion rather than as prose. The
  // clause exists because a seat was one draft away from writing "pass
  // `--format json` to get an envelope" — false as a condition, and contradicted
  // by our own emitted commands, which pass no `--format` at all.
  test("a piped agent that passes NO flag gets json — the envelope is not flag-gated", () => {
    expect(resolveFormat(undefined, false)).toBe("json");
  });

  // The other half of 5(c), and the half with no automated guard until now.
  test("a human at a TTY passing NO flag gets text", () => {
    expect(resolveFormat(undefined, true)).toBe("text");
  });

  // The flag must WIN over the environment in both directions. One direction
  // alone passes against an implementation that ignores the flag whenever it
  // agrees with the TTY state — which is exactly half the time.
  test("an explicit flag overrides the environment, both ways", () => {
    expect(resolveFormat("json", true)).toBe("json");
    expect(resolveFormat("text", false)).toBe("text");
  });

  /**
   * THE ASSERTION THAT KEEPS THE OTHERS HONEST.
   *
   * Every test above passes `isTTY` explicitly, so all of them stay green if the
   * default is rewired to a constant — and the default is what production uses,
   * on all 21 call sites. Without this, the parameter would make the branch
   * testable while leaving the real path unguarded, which is the shape of the
   * bug it was added to fix.
   *
   * This asserts the WIRING (the default is bound to `process.stdout.isTTY`),
   * not TTY behaviour — stubbing a global only ever proves the stub, and that
   * distinction is why this is one test and not the whole matrix.
   */
  test("the DEFAULT reads process.stdout.isTTY — not a constant", () => {
    const original = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
    try {
      Object.defineProperty(process.stdout, "isTTY", { value: true, configurable: true });
      const asTty = resolveFormat(undefined);
      Object.defineProperty(process.stdout, "isTTY", { value: false, configurable: true });
      const asPipe = resolveFormat(undefined);
      // Both values from ONE stubbed property: if the default were hardcoded,
      // or read something else, these would not differ.
      expect([asTty, asPipe]).toEqual(["text", "json"]);
    } finally {
      if (original) Object.defineProperty(process.stdout, "isTTY", original);
      else Reflect.deleteProperty(process.stdout, "isTTY");
    }
  });

  /**
   * ⚠ KNOWN DEFECT, PINNED SO IT IS VISIBLE — this is NOT the intended
   * behaviour and this test must not be read as blessing it.
   *
   * An unrecognised `--format` value is silently swallowed and falls through to
   * the environment, so `--format josn` yields json when piped and text at a
   * terminal: an **environment-dependent silent wrong result**, which is worse
   * than a loud failure. It is the unvalidated-VALUE sibling of the swallowed-
   * FLAG family, and the fix belongs with a CLI-wide `strict` decision rather
   * than a special case here (blast radius — 21 call sites, shared tree).
   *
   * Pinned rather than left undocumented because it lived only in a seat doc's
   * candidate list, where no reader trips over it. When someone fixes it, THIS
   * TEST FAILS and sends them to this comment — which is the point.
   */
  test("KNOWN DEFECT: an unrecognised --format value falls through to the environment", () => {
    expect(resolveFormat("josn", true)).toBe("text");
    expect(resolveFormat("josn", false)).toBe("json");
    // The tell that makes it a defect rather than a policy: the same bad input
    // produces different output depending on where it ran.
    expect(resolveFormat("josn", true)).not.toBe(resolveFormat("josn", false));
  });
});
