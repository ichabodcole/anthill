/**
 * The CLI's failure surface: an error raised by the PARSER must reach the same
 * dual-audience verdict as one raised inside `run()`.
 *
 * Backlog (on `develop`, not this branch — cite it with its ref):
 *   git show develop:docs/backlog/2026-07-31-parser-errors-bypass-the-agent-envelope.md
 *
 * ## Why this file does not reuse `team-comms.test.ts`'s spawn helper
 *
 * That helper appends `--format json` to every invocation. The defect it would
 * hide is the one that actually hid: a PIPED agent passing NO `--format` flag
 * already gets JSON on every other path (`resolveFormat` is `isTTY ? text : json`),
 * and anthill's own emitted incantations — the `join` manifest's tail commands —
 * pass no `--format` at all. A harness that always sends the flag cannot express
 * that row, so it would confirm the fix while the commonest agent invocation stayed
 * broken. `run()` below deliberately passes argv through untouched.
 *
 * The bug was originally named "parser errors ignore `--format json`". That name
 * selected everyone's probe methodology, which then confirmed the name — three
 * seats re-verified the flag row and none ran the no-flag row until a verifier
 * completed the matrix instead of sampling it. The name, not the code, was the
 * thing that was wrong.
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { commandPath, main, sniffFormatValue } from "./cli.ts";
import { defineCommand } from "./define.ts";

const CLI = resolve(import.meta.dir, "cli.ts");

/**
 * Spawn the real binary with argv VERBATIM — no flag is appended. Piped stdio
 * means `process.stdout.isTTY` is false, which is precisely an agent's situation.
 */
function run(args: string[]): { stdout: string; stderr: string; exitCode: number } {
  const r = Bun.spawnSync(["bun", CLI, ...args], {
    stdout: "pipe",
    stderr: "pipe",
    cwd: resolve(import.meta.dir, "..", "..", ".."),
  });
  return {
    stdout: r.stdout.toString(),
    stderr: r.stderr.toString(),
    exitCode: r.exitCode,
  };
}

/** Every argv below is a DISTINCT throw site, which is the axis under test. */
const PARSER_ERRORS: Array<{ label: string; argv: string[]; expect: RegExp }> = [
  { label: "unknown flag", argv: ["comms", "read", "--nope"], expect: /Unknown option/ },
  { label: "missing required positional", argv: ["join"], expect: /Missing required positional/ },
  { label: "unknown command", argv: ["bogusverb"], expect: /Unknown command/ },
  {
    // A bare `anthill` is intercepted as grouped help before it ever reaches the
    // dispatcher, so reaching this throw site requires argv that is non-empty and
    // still names no command.
    label: "no command specified",
    argv: ["--format", "json"],
    expect: /No command specified/,
  },
];

describe("a repeated --format resolves the way the real parser resolves it", () => {
  // Ported from develop, where the same sniffer was written independently and
  // returned the FIRST match — so the same argv got two verdicts depending on
  // which code path saw it. This branch's implementation already accumulates
  // (last wins) and never had the bug; these guard it against a later
  // "simplification" back to an early return.

  test("last --format wins, so a parser error agrees with a successful parse", () => {
    const r = run(["status", "--nope", "--format", "text", "--format", "json"]);
    expect(r.stderr.trimEnd().split("\n")).toHaveLength(1);
    expect(JSON.parse(r.stderr.trim()).ok).toBe(false);
    expect(r.stdout).toBe("");
  });

  test("and the reverse order picks text, not json", () => {
    // Guards the obvious wrong fix: always preferring "json" passes the test
    // above while still ignoring what the caller asked for last.
    const r = run(["status", "--nope", "--format", "json", "--format", "text"]);
    expect(r.stderr).not.toStartWith("{");
    expect(r.stderr).toContain("USAGE");
  });

  test("the equals form is subject to the same rule", () => {
    const r = run(["status", "--nope", "--format=text", "--format=json"]);
    expect(JSON.parse(r.stderr.trim()).ok).toBe(false);
  });
});

describe("sniffFormatValue — recovers the --format VALUE, never a decision", () => {
  test("spaced form", () => {
    expect(sniffFormatValue(["comms", "read", "--format", "json"])).toBe("json");
  });

  test("equals form", () => {
    expect(sniffFormatValue(["comms", "read", "--format=json"])).toBe("json");
  });

  test("absent → undefined, so resolveFormat applies the TTY heuristic", () => {
    expect(sniffFormatValue(["comms", "read", "--nope"])).toBeUndefined();
  });

  test("returns the value verbatim, including an INVALID one", () => {
    // Deliberate: validating `--format` values is a separate, CLI-wide defect
    // (`resolveFormat` silently discards an unrecognised value and falls back to
    // the TTY heuristic). Swallowing it here would make this path disagree with
    // every other one, which is the very thing being fixed.
    expect(sniffFormatValue(["--format", "zzz"])).toBe("zzz");
  });

  test("LAST occurrence wins — the subcommand's flag outranks the root's", () => {
    expect(sniffFormatValue(["--format", "text", "comms", "read", "--format", "json"])).toBe(
      "json",
    );
  });

  test("a value after `--` is a positional, not a flag", () => {
    // Matches the real parser: `commit -m msg -- --format json` names paths.
    expect(sniffFormatValue(["commit", "--", "--format", "json"])).toBeUndefined();
  });

  test("a trailing bare `--format` with no value does not invent one", () => {
    expect(sniffFormatValue(["comms", "read", "--format"])).toBeUndefined();
  });
});

describe("commandPath — matches the strings commands hand to emit/emitError", () => {
  const leaf = defineCommand({ meta: { name: "read" } });
  const group = defineCommand({ meta: { name: "comms" }, subCommands: { read: leaf } });

  test("a nested command joins parent and child", () => {
    expect(commandPath(leaf, group)).toBe("comms read");
  });

  test("a top-level command drops the root's name", () => {
    // `status` emits `command: "status"`, never "anthill status".
    const top = defineCommand({ meta: { name: "status" } });
    expect(commandPath(top, main)).toBe("status");
  });

  test("an unresolved command falls back to the root's own name", () => {
    expect(commandPath(main, undefined)).toBe("anthill");
  });
});

describe("parser errors emit the agent envelope (piped, NO --format flag)", () => {
  for (const { label, argv, expect: pattern } of PARSER_ERRORS) {
    test(`${label} → a single-line {ok:false} envelope on stderr`, () => {
      const { stdout, stderr, exitCode } = run(argv);

      expect(exitCode).toBe(1);
      // stdout must stay clean so an agent parsing only stdout gets an empty
      // parse — the RIGHT failure — rather than a wall of usage prose.
      expect(stdout).toBe("");
      expect(stderr.trimEnd().split("\n")).toHaveLength(1);

      const envelope = JSON.parse(stderr);
      expect(envelope.ok).toBe(false);
      expect(envelope.error).toMatch(pattern);
      expect(typeof envelope.meta.command).toBe("string");
      // Rendered usage never enters a JSON field, in any form.
      expect(envelope.error).not.toMatch(/USAGE/);
      expect(JSON.stringify(envelope)).not.toMatch(/USAGE/);
    });
  }

  test("an unknown flag names the valid set, so an agent can self-correct", () => {
    // The promise weaver's prose is scoped against: a typo has no *why*, so what
    // is owed is "what you typed, and the flags that exist" — not a reason.
    const envelope = JSON.parse(run(["comms", "read", "--nope"]).stderr);
    expect(envelope.error).toMatch(/--nope/);
    expect(envelope.error).toMatch(/Valid flags:/);
    expect(envelope.error).toMatch(/--channel/);
  });

  test("meta.command resolves to the SUBCOMMAND, not the root", () => {
    // TWO distinct groups on purpose. Asserting only `comms` would encode that
    // group rather than the rule — the shape that already bit this seat once
    // (a test written when the set was complete pinned the set, not the rule).
    // `info show` is an independent group whose own `emitError` calls hardcode
    // "info show", so this also pins that the derived string MATCHES what the
    // command emits when it fails from inside `run()`. If those two ever
    // diverge, an agent could not group a command's failures by `meta.command`.
    expect(JSON.parse(run(["comms", "read", "--nope"]).stderr).meta.command).toBe("comms read");
    expect(JSON.parse(run(["info", "show", "--nope"]).stderr).meta.command).toBe("info show");
    // …and a top-level command, which drops the root's name entirely.
    expect(JSON.parse(run(["join"]).stderr).meta.command).toBe("join");
  });

  test("the equals form is honoured too — `--format=text` still gets usage", () => {
    // `--format=json` is covered by the sniffer's unit tests, but only the spaced
    // form was ever exercised end-to-end. An agent writing the equals form is not
    // exotic; it is the form that survives shell quoting unscathed.
    const { stderr } = run(["comms", "read", "--nope", "--format=text"]);
    expect(stderr).toMatch(/USAGE/);
    expect(() => JSON.parse(stderr)).toThrow();
  });

  test("a trailing valueless `--format` does not derail the verdict", () => {
    // Falls through to the TTY heuristic, so a piped agent still gets an envelope
    // rather than the usage block a naive scan would hand it.
    expect(JSON.parse(run(["comms", "read", "--nope", "--format"]).stderr).ok).toBe(false);
  });
});

describe("THE INVARIANT: the format decision does not depend on where the error was raised", () => {
  // The assertion that survives any field names, and the one that would have
  // caught the under-fix. `comms read --as <handle>` is a REFUSED arg: recognised
  // by the parser, refused inside `run()` — so it is the same argv shape reaching
  // the other throw site. It was already correct before the fix, making it the
  // control that must stay byte-identical.
  const IN_RUN = ["comms", "read", "--as", "forager"];
  const PARSER = ["comms", "read", "--nope"];

  test("piped with NO flag: both sites emit JSON", () => {
    for (const argv of [IN_RUN, PARSER]) {
      const { stderr, stdout } = run(argv);
      expect(stdout).toBe("");
      expect(() => JSON.parse(stderr)).not.toThrow();
      expect(JSON.parse(stderr).ok).toBe(false);
    }
  });

  test("explicit --format text: both sites emit non-JSON, for a human", () => {
    for (const argv of [IN_RUN, PARSER]) {
      const { stderr } = run([...argv, "--format", "text"]);
      expect(() => JSON.parse(stderr)).toThrow();
    }
  });

  test("explicit --format json: both sites emit JSON", () => {
    for (const argv of [IN_RUN, PARSER]) {
      expect(JSON.parse(run([...argv, "--format", "json"]).stderr).ok).toBe(false);
    }
  });

  test("the two sites AGREE cell-for-cell — the property, not four coincidences", () => {
    // A per-cell golden passes even if the two paths agree by luck on the cells
    // sampled. Comparing the sites to EACH OTHER is what pins the invariant.
    const isJson = (argv: string[]) => {
      try {
        return JSON.parse(run(argv).stderr).ok === false;
      } catch {
        return false;
      }
    };
    for (const suffix of [[], ["--format", "json"], ["--format", "text"], ["--format", "zzz"]]) {
      expect(isJson([...PARSER, ...suffix])).toBe(isJson([...IN_RUN, ...suffix]));
    }
    // POSITIVE ANCHOR — do not remove. Agreement alone is symmetric, so every
    // assertion above is satisfied in a BOTH-BROKEN world (`false === false`,
    // which is also what `isJson` returns when the parse itself fails). This line
    // is what makes the test assert something rather than merely assert symmetry.
    // Contract 4's assertion-(4) shape: the positive anchor is the part a later
    // refactor drops first, and nothing notices because the suite stays green.
    expect(isJson([...PARSER])).toBe(true);
    expect(isJson([...IN_RUN])).toBe(true);
  });
});

describe("--format text is unchanged — a usage block is the right answer for a human", () => {
  test("a parser error still renders usage plus the message", () => {
    const { stdout, stderr, exitCode } = run(["comms", "read", "--nope", "--format", "text"]);
    expect(exitCode).toBe(1);
    expect(stdout).toBe("");
    expect(stderr).toMatch(/USAGE/);
    expect(stderr).toMatch(/Unknown option '--nope'/);
  });

  test("an unknown command still renders the ROOT usage", () => {
    // Correct, not a bug: no subcommand resolved, so the root's is the only
    // usage there is. Pinned so the fix cannot silently change which one shows.
    const { stderr } = run(["bogusverb", "--format", "text"]);
    expect(stderr).toMatch(/Project orchestration CLI/);
  });
});

describe("M3 — the help/usage interceptors honour the format verdict", () => {
  test("--help --format json gives the manifest entry, NOT a rendered usage block", () => {
    const { stdout, stderr, exitCode } = run(["comms", "read", "--help", "--format", "json"]);
    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const env = JSON.parse(stdout);
    expect(env.ok).toBe(true);
    expect(env.meta.command).toBe("comms read");
    // Flags as DATA. Rendered usage in a JSON field is what Contract 5 forbids,
    // and it would be prose the agent has to re-parse to find a flag name.
    expect(env.data.name).toBe("read");
    expect(Array.isArray(env.data.flags)).toBe(true);
    expect(stdout).not.toMatch(/USAGE/);
  });

  test("--help with no --format still renders usage for a human (text path intact)", () => {
    const { stdout } = run(["comms", "read", "--help", "--format", "text"]);
    expect(stdout).toMatch(/USAGE/);
    expect(() => JSON.parse(stdout)).toThrow();
  });

  test("--version --format json is one intent, not two", () => {
    // The old length check (`rawArgs.length === 1`) silently failed to match
    // once --format was present, so the version request fell through entirely.
    const env = JSON.parse(run(["--version", "--format", "json"]).stdout);
    expect(env.ok).toBe(true);
    expect(env.data.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  /**
   * `--version` must say WHICH cli.ts answered, not only what it calls itself.
   *
   * Two binaries reported `1.7.1` while differing in at least two behaviours —
   * the PATH launcher had no `-F`, the flag our own emitted LAND string uses, so
   * the string failed outright; and piped `--help` returned text from one and
   * JSON from the other. The version string did not merely fail to inform, it
   * ASSERTED SAMENESS, and a seat reasonably read it as proof the two were
   * interchangeable.
   *
   * Keyed on the DISCRIMINATING PROPERTY, not on a path literal: the assertion
   * is that `source` resolves to a real, absolute cli.ts that EXISTS on disk —
   * which is what makes two installs distinguishable — rather than on this
   * checkout's path, which would be a souvenir of where the suite happened to
   * run and would fail in CI, in a worktree, and from the cache.
   */
  test("--version says WHICH cli.ts answered, so two installs are distinguishable", () => {
    const env = JSON.parse(run(["--version", "--format", "json"]).stdout);
    const source = env.data.source as string;
    expect(isAbsolute(source)).toBe(true);
    expect(source).toEndWith("cli.ts");
    // The path is only worth anything if it points at something real.
    expect(existsSync(source)).toBe(true);
    // TOTAL, not conditional — an absent `source` would be indistinguishable
    // from an older binary that never emitted one, which is the exact confusion
    // this field exists to end (Contract 5(a)).
    expect(Object.hasOwn(env.data, "source")).toBe(true);
  });

  test("--version carries the source in TEXT too — the human is the original victim", () => {
    // A human comparing two shells is who hit this. Telling only the JSON
    // audience would leave them exactly where they were.
    const { stdout } = run(["--version", "--format", "text"]);
    expect(stdout).toMatch(/^\d+\.\d+\.\d+ \(.*cli\.ts\)/);
  });

  test("bare `help` under json emits the manifest as an ENVELOPE", () => {
    const env = JSON.parse(run(["help", "--format", "json"]).stdout);
    expect(env.ok).toBe(true);
    expect(Array.isArray(env.data.commands)).toBe(true);
  });

  test("CONTROL: `help --json` keeps emitting the BARE manifest", () => {
    // A shipped contract with existing consumers. Two spellings, two shapes,
    // both honoured — the defect was one being silently ignored, not both
    // existing. If this ever starts returning an envelope, that is a break.
    const out = JSON.parse(run(["help", "--json"]).stdout);
    expect(out.ok).toBeUndefined();
    expect(out.name).toBe("anthill");
    expect(Array.isArray(out.commands)).toBe(true);
  });
});

describe("M5 — a flag BEFORE the subcommand is parsed, not dropped on the floor", () => {
  test("an unknown flag before the subcommand is refused", () => {
    // Previously exited 0 with ok:true: only rawArgs.slice(idx+1) was ever
    // parsed, so `strict: true`'s whole promise was void in this position. A
    // typo is as likely before the subcommand as after it; only one was checked.
    const { stderr, exitCode } = run(["--nope", "status"]);
    expect(exitCode).toBe(1);
    const env = JSON.parse(stderr);
    expect(env.ok).toBe(false);
    expect(env.error).toMatch(/--nope/);
  });

  test("the same flag after the subcommand behaves identically — position is not a loophole", () => {
    const before = JSON.parse(run(["--nope", "status"]).stderr);
    const after = JSON.parse(run(["status", "--nope"]).stderr);
    expect(before.ok).toBe(after.ok);
    expect(before.ok).toBe(false);
  });

  test("CONTROL: a VALID root flag before the subcommand still dispatches", () => {
    // `--format` is declared on the root, so it must not be rejected by the new
    // validation — only unknown flags are.
    const { exitCode } = run(["--format", "json", "status"]);
    expect(exitCode).toBe(0);
  });
});
