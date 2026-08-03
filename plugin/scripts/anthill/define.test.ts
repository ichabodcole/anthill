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

// Regression from the `strict: true` flip (shipped 1.7.1). A VALUE that starts
// with `-` is not a flag, but node's parser under strict reads `-m "-fix thing"`
// as short options and reports "did you forget the option argument for '-m'?".
// So a commit message beginning with a dash became unusable — in the command
// every seat runs. `strict: false` tolerated this by accident, which is why it
// only appeared once strictness landed.
//
// Verified against the cached 1.7.0 CLI: `commit -m "-fix thing"` worked there
// and broke on 1.7.1, so this is a regression rather than a pre-existing gap.
// (`feedback "-1 star"` is broken on BOTH and is a separate, older issue.)
describe("parseArgs — a dash-leading VALUE is a value, not a flag", () => {
  const SPEC = {
    message: { type: "string" as const, alias: "m" },
    as: { type: "string" as const },
    force: { type: "boolean" as const },
    path: { type: "positional" as const, required: false },
  };

  test("short alias accepts a value starting with a dash", () => {
    expect(parseArgs(["-m", "-fix the thing"], SPEC).message).toBe("-fix the thing");
  });

  test("long flag accepts a value starting with a dash", () => {
    expect(parseArgs(["--message", "-fix the thing"], SPEC).message).toBe("-fix the thing");
  });

  test("a value that is only a dash-number still works", () => {
    expect(parseArgs(["--message", "-1"], SPEC).message).toBe("-1");
  });

  test("the `=` form was always safe and stays safe", () => {
    expect(parseArgs(["--message=-fix"], SPEC).message).toBe("-fix");
  });

  test("a dash value does not swallow a following positional", () => {
    const r = parseArgs(["-m", "-fix", "src/a.ts"], SPEC);
    expect(r.message).toBe("-fix");
    expect(r._).toEqual(["src/a.ts"]);
  });

  test("`--` stays a terminator, and a dash-leading PATH after it survives", () => {
    const r = parseArgs(["-m", "msg", "--", "-weird-file-name"], SPEC);
    expect(r.message).toBe("msg");
    expect(r._).toEqual(["-weird-file-name"]);
  });

  test("a flag with NO value still errors — the fix must not invent one", () => {
    // `-m --` means the message is missing. Node calls that ambiguous, which is
    // correct: silently treating `--` as the message would be far worse.
    // (This assertion replaced one that wrongly expected this to succeed.)
    expect(() => parseArgs(["-m", "--", "src/a.ts"], SPEC)).toThrow();
  });

  test("a genuinely unknown flag is STILL rejected (the fix must not re-open the swallow)", () => {
    expect(() => parseArgs(["--totally-bogus"], SPEC)).toThrow(CLIError);
    expect(() => parseArgs(["-m", "ok", "--totally-bogus"], SPEC)).toThrow(CLIError);
  });

  test("a boolean flag does not absorb a following dash token", () => {
    // `--force` takes no value, so `-1` after it must not be swallowed as one.
    expect(() => parseArgs(["--force", "-1"], SPEC)).toThrow(CLIError);
  });
});

describe("m10 — a VALUE beginning with a dash names both escapes", () => {
  const SEND = {
    text: { type: "positional" as const, required: false },
    as: { type: "string" as const },
    stdin: { type: "boolean" as const },
  };

  test("the error explains the cause and both escapes, not just a letter", () => {
    // `send "-dash body"` failed with "Unknown option 'd'" — an error about a
    // letter inside the user's own sentence, naming neither cause nor escape.
    try {
      parseArgs(["-dash body", "--as", "forager"], SEND);
      throw new Error("expected a CLIError");
    } catch (e) {
      const m = (e as Error).message;
      expect(m).toContain("-dash body");
      expect(m).toContain("--");
      expect(m).toContain("--stdin"); // offered only because this spec HAS it
    }
  });

  test("a command WITHOUT --stdin does not advertise it", () => {
    // The hint is derived from the spec, so it cannot promise a flag the command
    // does not have — the failure mode of a hand-written hint.
    try {
      parseArgs(["-dash body"], { as: { type: "string" as const } });
      throw new Error("expected a CLIError");
    } catch (e) {
      expect((e as Error).message).not.toContain("--stdin");
    }
  });

  test("CONTROL: a genuine unknown long flag gets NO dash hint", () => {
    try {
      parseArgs(["--nope"], SEND);
      throw new Error("expected a CLIError");
    } catch (e) {
      expect((e as Error).message).not.toContain("meant as a VALUE");
    }
  });
});
