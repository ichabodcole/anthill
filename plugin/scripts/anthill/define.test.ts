import { describe, expect, test } from "bun:test";
import { CLIError, parseArgs } from "./define.ts";

// Field report (StoryLoom, 2026-08-01): the parser ran with `strict: false`, so
// EVERY command silently accepted EVERY unknown flag and exited 0.
//
// On its own that is a typo that does nothing. The damage is that it converts a
// USAGE error into a SILENT WRONG RESULT, and amplifies any missing-flag defect:
// a seat typed `anthill commit --as aesop -m "…"` on a build where `commit` had
// no `--as`; the flag was swallowed and its VALUE fell through as a positional,
// producing "path(s) not found: aesop" — an error about a file named after him.
// anthill#54's shape: a usage error and a broken tool are indistinguishable
// unless the output disambiguates them.
const SPEC = {
  format: { type: "string" as const, description: "Output format" },
  message: { type: "string" as const, alias: "m", description: "Message" },
  force: { type: "boolean" as const, description: "Force" },
  handle: { type: "positional" as const, description: "Handle", required: false },
};

describe("parseArgs — unknown flags are refused, not swallowed", () => {
  test("an unknown flag throws a usage error naming the valid set", () => {
    expect(() => parseArgs(["--totally-bogus"], SPEC)).toThrow(CLIError);
    try {
      parseArgs(["--totally-bogus"], SPEC);
    } catch (e) {
      const m = (e as Error).message;
      expect(m).toMatch(/totally-bogus/);
      expect(m).toMatch(/Valid flags:/);
      expect(m).toMatch(/--format/);
      // The valid set must be discoverable, not just "invalid option".
      expect(m).toMatch(/--message/);
    }
  });

  test("a TYPO of a real flag fails instead of silently defaulting", () => {
    // The dangerous case: `--fromat json` used to exit 0 and return the DEFAULT
    // format, so you got the wrong output and were never told.
    expect(() => parseArgs(["--fromat", "json"], SPEC)).toThrow(/fromat/);
  });

  test("the swallowed flag's VALUE no longer leaks into positionals", () => {
    // The exact StoryLoom failure: `--as aesop` on a command without `--as`
    // left "aesop" in `_`, where commit read it as a path.
    expect(() => parseArgs(["--as", "aesop", "-m", "x"], SPEC)).toThrow(CLIError);
  });
});

// Guard the shapes the flip could plausibly have broken. `strict: true` changes
// how node:util treats unknown options; everything below must be unaffected.
describe("parseArgs — the shapes strict mode must NOT break", () => {
  test("declared flags, short aliases and = form all still parse", () => {
    expect(parseArgs(["--format", "json"], SPEC).format).toBe("json");
    expect(parseArgs(["--format=json"], SPEC).format).toBe("json");
    expect(parseArgs(["-m", "hello"], SPEC).message).toBe("hello");
    expect(parseArgs(["--force"], SPEC).force).toBe(true);
  });

  test("--no-<flag> negation survives (stripped before the parser sees it)", () => {
    expect(parseArgs(["--no-force"], SPEC).force).toBe(false);
  });

  test("positionals and `_` still work, including after `--`", () => {
    const a = parseArgs(["seatname"], SPEC);
    expect(a.handle).toBe("seatname");
    expect(a._).toEqual(["seatname"]);
    const b = parseArgs(["-m", "msg", "--", "a.txt", "b.txt"], SPEC);
    expect(b.message).toBe("msg");
    expect(b._).toEqual(["a.txt", "b.txt"]);
  });

  test("a path that merely LOOKS flag-ish is safe after `--`", () => {
    expect(parseArgs(["--", "--weird-file-name"], SPEC)._).toEqual(["--weird-file-name"]);
  });
});
