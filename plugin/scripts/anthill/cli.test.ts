/**
 * Entry-point tests for `cli.ts` — specifically the top-level catch, which is
 * the ONLY place errors raised by the PARSER (unknown flag, missing required
 * positional, unknown command) get rendered. That class is the one an agent hits
 * most often, since a wrong flag is the commonest way an agent gets a command
 * wrong, and it used to render a human usage block on every path — including
 * `--format json`.
 *
 * These are subprocess tests on purpose: `runCli()` reads `process.argv`, writes
 * to the real streams, and calls `process.exit`. Only a real spawn observes what
 * a caller actually sees.
 *
 * HARNESS RULE: `probe()` must be able to invoke with NO `--format` at all.
 * A sibling harness in this repo appends `--format json` to every call, which
 * STRUCTURALLY HIDES the no-flag-piped row — and that row is precisely where the
 * defect lived, because `resolveFormat` already defaults piped → json and
 * anthill's own emitted incantations pass no `--format`.
 */

import { afterAll, describe, expect, it } from "bun:test";
import { chmodSync, cpSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { main } from "./cli.ts";
import { resolveSubCommand } from "./define.ts";
import { renderCommandUsage } from "./help-renderer.ts";

const HERE = dirname(new URL(import.meta.url).pathname);
const CLI = join(HERE, "cli.ts");
const REPO_ROOT = join(HERE, "..", "..", "..");

interface Probe {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Run the CLI with a real argv array. Streams are piped (never a TTY), which is
 * the agent-facing condition. `args` is passed through verbatim — nothing is
 * appended.
 */
async function probe(args: string[], opts: { cwd?: string } = {}): Promise<Probe> {
  const proc = Bun.spawn(["bun", CLI, ...args], {
    cwd: opts.cwd ?? REPO_ROOT,
    stdout: "pipe",
    stderr: "pipe",
    stdin: "ignore",
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { exitCode, stdout, stderr };
}

/** Split a stream into non-empty lines — for the "exactly ONE line" assertion. */
function lines(s: string): string[] {
  return s.split("\n").filter((l) => l.length > 0);
}

function isEnvelopeOutput(stderr: string): boolean {
  const l = lines(stderr);
  if (l.length !== 1) return false;
  try {
    const parsed = JSON.parse(l[0] as string) as { ok?: unknown };
    return parsed.ok === false;
  } catch {
    return false;
  }
}

/** Assert the agent contract: exactly one `{ok:false,…}` line on stderr, stdout empty. */
function expectErrorEnvelope(result: Probe, expected: { command: string; error: RegExp }) {
  expect(result.stdout).toBe("");
  const errLines = lines(result.stderr);
  expect(errLines).toHaveLength(1);
  const envelope = JSON.parse(errLines[0] as string) as {
    ok: boolean;
    error: string;
    meta?: { command?: string; stack?: string };
  };
  expect(envelope.ok).toBe(false);
  expect(envelope.error).toMatch(expected.error);
  expect(envelope.meta?.command).toBe(expected.command);
  expect(result.exitCode).toBe(1);
  return envelope;
}

/** The exact bytes the human path must keep producing. */
function expectedUsageText(rawArgs: string[], message: string): string {
  const [cmd, parent] = resolveSubCommand(main, rawArgs);
  return `${renderCommandUsage(cmd, parent)}\n${message}\n`;
}

// The three parser-error classes, each reaching the same catch in `cli.ts`.
const PARSER_ERRORS = [
  {
    label: "unknown flag",
    args: ["status", "--nope"],
    command: "status",
    error: /Unknown option '--nope'/,
  },
  {
    label: "missing required positional",
    args: ["join"],
    command: "join",
    error: /Missing required positional argument: HANDLE/,
  },
  {
    label: "unknown command",
    args: ["bogusverb"],
    command: "anthill",
    error: /Unknown command bogusverb/,
  },
] as const;

describe("cli parser errors — JSON path", () => {
  for (const c of PARSER_ERRORS) {
    it(`${c.label}: --format json emits one envelope line on stderr`, async () => {
      const result = await probe([...c.args, "--format", "json"]);
      expectErrorEnvelope(result, { command: c.command, error: c.error });
    });

    it(`${c.label}: --format=json (equals form) emits one envelope line`, async () => {
      const result = await probe([...c.args, "--format=json"]);
      expectErrorEnvelope(result, { command: c.command, error: c.error });
    });

    // The row a `--format json`-appending harness cannot see. `resolveFormat`
    // already resolves piped → json, and anthill's own emitted incantations
    // (e.g. the three `anthill join` prints) carry no `--format` — so this is
    // the row an agent hits in practice.
    it(`${c.label}: NO --format, piped, still emits one envelope line`, async () => {
      const result = await probe([...c.args]);
      expectErrorEnvelope(result, { command: c.command, error: c.error });
    });
  }
});

describe("cli parser errors — text path is byte-unchanged", () => {
  for (const c of PARSER_ERRORS) {
    it(`${c.label}: --format text renders the usage block verbatim`, async () => {
      const args = [...c.args, "--format", "text"];
      const result = await probe(args);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe("");
      // A usage block is the right answer for a human — assert the exact bytes,
      // not merely "contains".
      const message = lines(result.stderr).at(-1) as string;
      expect(message).toMatch(c.error);
      expect(result.stderr).toBe(expectedUsageText(args, message));
      // And it is emphatically NOT an envelope.
      expect(isEnvelopeOutput(result.stderr)).toBe(false);
    });
  }
});

describe("cli errors raised INSIDE run() — the control", () => {
  it("`join nobody --format json` still emits its envelope unchanged", async () => {
    const result = await probe(["join", "nobody", "--format", "json"]);
    expectErrorEnvelope(result, { command: "join", error: /unknown seat "nobody"/ });
  });

  it("`join nobody --format text` still emits the plain `Error:` line", async () => {
    const result = await probe(["join", "nobody", "--format", "text"]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(lines(result.stderr)).toHaveLength(1);
    expect(result.stderr).toMatch(/^Error: unknown seat "nobody"/);
  });
});

/**
 * The invariant, named. This is stronger than enumerating cells: it says the
 * format decision is a function of the INVOCATION, never of the call site that
 * happened to throw. Matching the literal string "json" would satisfy the
 * explicit-flag rows and fail this one on the no-flag row.
 */
describe("invariant: the format decision must not depend on where the error was raised", () => {
  const FORMAT_INPUTS: Array<{ label: string; flags: string[] }> = [
    { label: "--format json", flags: ["--format", "json"] },
    { label: "--format text", flags: ["--format", "text"] },
    { label: "no --format (piped)", flags: [] },
  ];

  for (const input of FORMAT_INPUTS) {
    it(`${input.label}: a parser-raised error resolves the same format as a run-raised one`, async () => {
      const [fromParser, fromRun] = await Promise.all([
        probe(["join", ...input.flags]), // missing positional — raised by the parser
        probe(["join", "nobody", ...input.flags]), // unknown seat — raised inside run()
      ]);
      expect(isEnvelopeOutput(fromParser.stderr)).toBe(isEnvelopeOutput(fromRun.stderr));
      expect(fromParser.stdout).toBe("");
      expect(fromRun.stdout).toBe("");
    });
  }
});

/**
 * Unexpected (non-CLIError) throws. Same dual-audience problem, with the extra
 * constraint that debuggability must not regress: text keeps the stack verbatim,
 * and the JSON path preserves it on `meta` (top-level envelope fields are TOTAL;
 * `meta` is the variable bag).
 *
 * Trigger: a read-only `.anthill/` makes `init`'s `writeFileSync` throw EACCES,
 * and `team-init.ts` has no catch — so it escapes to the top-level handler.
 */
describe("a repeated --format resolves the same way the real parser resolves it", () => {
  // Found by an independent reviewer, reproduced before fixing. The sniffer
  // originally returned the FIRST --format it saw, while `util.parseArgs`
  // resolves a repeated non-`multiple` option to its LAST occurrence. So the
  // same argv got two different verdicts depending on which code path saw it —
  // which is precisely the invariant above, violated:
  //   status --nope --format text --format json  -> usage block  (sniff: text)
  //   status       --format text --format json  -> json envelope (parse: json)

  it("last --format wins, so a parser error agrees with a successful parse", async () => {
    const err = await probe(["status", "--nope", "--format", "text", "--format", "json"]);
    expect(err.stderr.trimEnd().split("\n")).toHaveLength(1);
    expect(JSON.parse(err.stderr.trim()).ok).toBe(false);
    expect(err.stdout).toBe("");
  });

  it("and the reverse order picks text, not json", async () => {
    // Guards the obvious wrong fix: always preferring "json" would pass the
    // test above while still ignoring what the user actually asked for last.
    const err = await probe(["status", "--nope", "--format", "json", "--format", "text"]);
    expect(err.stderr).not.toStartWith("{");
    expect(err.stderr).toContain("USAGE");
  });

  it("the equals form is subject to the same rule", async () => {
    const err = await probe(["status", "--nope", "--format=text", "--format=json"]);
    expect(JSON.parse(err.stderr.trim()).ok).toBe(false);
  });
});

describe("cli non-CLIError throws", () => {
  const tmp = mkdtempSync(join(tmpdir(), "anthill-cli-test-"));
  const created: string[] = [];

  afterAll(() => {
    // Restore write permission before rm — the whole point of these dirs is that
    // they are not writable.
    for (const dir of created) {
      try {
        chmodSync(join(dir, ".anthill"), 0o755);
      } catch {
        /* already writable */
      }
    }
    rmSync(tmp, { recursive: true, force: true });
  });

  function readOnlyProject(): string {
    const dir = join(tmp, `ro-${created.length}`);
    mkdirSync(join(dir, ".anthill"), { recursive: true });
    cpSync(join(REPO_ROOT, ".anthill", "config.json"), join(dir, ".anthill", "config.json"));
    chmodSync(join(dir, ".anthill"), 0o555);
    created.push(dir);
    return dir;
  }

  const isRoot = typeof process.getuid === "function" && process.getuid() === 0;
  const maybe = isRoot ? it.skip : it; // root ignores the mode bits

  maybe("--format json wraps the throw in an envelope and keeps the stack on meta", async () => {
    const cwd = readOnlyProject();
    const result = await probe(["init", "--format", "json"], { cwd });
    const envelope = expectErrorEnvelope(result, { command: "init", error: /EACCES/ });
    // Debuggability preserved, not flattened away.
    expect(envelope.meta?.stack).toBeString();
    expect(envelope.meta?.stack).toContain("EACCES");
    expect(envelope.meta?.stack).toMatch(/\n\s+at /);
    // And it is still ONE line — the stack is JSON-escaped inside it.
    expect(lines(result.stderr)).toHaveLength(1);
  });

  maybe("--format text keeps the raw stack verbatim", async () => {
    const cwd = readOnlyProject();
    const result = await probe(["init", "--format", "text"], { cwd });
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("EACCES");
    expect(result.stderr).toMatch(/\n\s+at /);
    expect(isEnvelopeOutput(result.stderr)).toBe(false);
  });

  maybe("no --format, piped, still wraps the throw in an envelope", async () => {
    const cwd = readOnlyProject();
    const result = await probe(["init"], { cwd });
    const envelope = expectErrorEnvelope(result, { command: "init", error: /EACCES/ });
    expect(envelope.meta?.stack).toContain("EACCES");
  });
});
