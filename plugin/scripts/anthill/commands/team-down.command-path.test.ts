import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { SeatPresence } from "./team-support.ts";

/**
 * COMMAND-PATH tests for `anthill down` — distinct from `team-down.test.ts`,
 * which covers the PURE guard.
 *
 * Why this file exists (measured, not theorised): the guard call
 * `if (shouldBlockTeardown(present, force))` can be DELETED OUTRIGHT from
 * `run()` and `team-down.test.ts` still reports 3 pass / 0 fail and the full
 * suite still reports 390 pass / 0 fail. The pure tests are correct and
 * unrepresentative — they exercise a function the deletion does not touch,
 * so nothing asserted that the COMMAND consults it.
 *
 * The load-bearing assertion here is therefore **that `killSession` was NOT
 * invoked** — not that an error was emitted. An error envelope that still tore
 * the session down would pass a message-only check, which is the exact shape of
 * failure this guard exists to prevent (killing seats' panes mid-build).
 *
 * These tests never touch real tmux: `../tmux.ts` and `./team-support.ts` are
 * mocked before the command module is imported, so a regression here fails a
 * test rather than killing a teammate's pane.
 */

interface Recorder {
  killed: string[];
  exits: number[];
  stdout: string;
  stderr: string;
}

/** Models real `process.exit` terminating the command body. */
class ExitSignal extends Error {
  constructor(readonly code: number) {
    super(`exit(${code})`);
  }
}

/** Runs the command, absorbing the simulated exit so the case can assert. */
async function runCmd(
  cmd: { run: (ctx: unknown) => Promise<void> },
  args: Record<string, unknown>,
) {
  try {
    await cmd.run({ args });
  } catch (err) {
    if (!(err instanceof ExitSignal)) throw err;
  }
}

let rec: Recorder;

/** Fresh mocks + a fresh import of the command under test, per case. */
async function loadCommand(opts: { presence: SeatPresence; sessionExists: boolean }) {
  rec = { killed: [], exits: [], stdout: "", stderr: "" };

  mock.module("../tmux.ts", () => ({
    hasTmux: () => true,
    sanitizeSessionName: (n: string) => n,
    sessionExists: async () => opts.sessionExists,
    killSession: async (name: string) => {
      rec.killed.push(name);
      return { ok: true, stdout: "", stderr: "" };
    },
  }));

  // Every export `team-down.ts` imports must be named here: mock.module
  // replaces the module WHOLESALE, so an unlisted export becomes a
  // `SyntaxError: Export named 'X' not found` and every case in this file goes
  // red at once — looking like a rejected change rather than a harness gap.
  mock.module("./team-support.ts", () => ({
    requireConfig: () => ({ channel: "test-channel", seats: [], grounding: [] }),
    seatPresence: async () => opts.presence,
  }));

  // process.exit would abort the test runner, so it is stubbed — but it MUST
  // throw rather than return. A stub that returns lets `run()` continue past
  // the refusal and reach `killSession`, which reports a kill that production
  // could never perform: real `process.exit(1)` terminates there.
  //
  // Found the hard way — the first version of this stub returned, and the
  // refusal case failed with `killed: ["probe"]` against correct code. An
  // instrument that changes the thing it measures, in the file whose subject is
  // exactly that.
  process.exit = ((code?: number) => {
    rec.exits.push(code ?? 0);
    throw new ExitSignal(code ?? 0);
  }) as typeof process.exit;

  // Both streams are captured because the two envelopes use DIFFERENT ones:
  // `emit` -> stdout, `emitError` -> stderr (agent-layer.ts). Capturing only
  // stdout made the refusal envelope look absent when it had been emitted
  // correctly — a second instrument artifact in this same file.
  process.stdout.write = ((chunk: string) => {
    rec.stdout += chunk;
    return true;
  }) as typeof process.stdout.write;

  process.stderr.write = ((chunk: string) => {
    rec.stderr += chunk;
    return true;
  }) as typeof process.stderr.write;

  // Imported AFTER the mocks are registered — a static top-level import would
  // bind the real modules and silently defeat every assertion below.
  const mod = await import(`./team-down.ts?case=${Math.random()}`);
  return mod.teamDownCommand;
}

const realExit = process.exit;
const realWrite = process.stdout.write;
const realErrWrite = process.stderr.write;

beforeEach(() => {
  mock.restore();
});

afterEach(() => {
  process.exit = realExit;
  process.stdout.write = realWrite;
  process.stderr.write = realErrWrite;
  mock.restore();
});

describe("anthill down — command path honours the presence guard", () => {
  it("REFUSES and does not kill when seats are present and --force is absent", async () => {
    const cmd = await loadCommand({
      presence: { state: "present", seats: ["forager", "weaver"] },
      sessionExists: true,
    });
    await runCmd(cmd, { session: "probe", force: false, format: "json" });

    // THE load-bearing assertion. Deleting the guard call from run() flips this.
    expect(rec.killed).toEqual([]);

    expect(rec.exits).toContain(1);
    expect(rec.stderr).toContain('"ok":false');
    expect(rec.stderr).toContain("seats still present on the vine");
    expect(rec.stderr).toContain("forager, weaver");

    // Stream separation: the refusal must NOT reach stdout, where an agent
    // parsing the success channel would read it as output.
    expect(rec.stdout).toBe("");
  });

  it("PROCEEDS and kills when the same seats are present but --force is passed", async () => {
    const cmd = await loadCommand({
      presence: { state: "present", seats: ["forager", "weaver"] },
      sessionExists: true,
    });
    await runCmd(cmd, { session: "probe", force: true, format: "json" });

    // The discriminator: identical presence, one flag changed, opposite outcome.
    // Without this case the suite would pass against a guard that blocks always.
    expect(rec.killed).toEqual(["probe"]);
    expect(rec.exits).toEqual([]);
    expect(rec.stdout).toContain('"tornDown":true');
  });

  it("PROCEEDS and kills when nobody is present and --force is absent", async () => {
    const cmd = await loadCommand({ presence: { state: "none" }, sessionExists: true });
    await runCmd(cmd, { session: "probe", force: false, format: "json" });

    expect(rec.killed).toEqual(["probe"]);
    expect(rec.exits).toEqual([]);
    expect(rec.stdout).toContain('"tornDown":true');
  });

  it("distinguishes REFUSED from NOTHING-TO-DO: an absent session is a graceful no-op", async () => {
    // Both this case and the refusal case leave `killed` empty, so an assertion
    // on `killed` alone cannot tell them apart. The envelope is what separates
    // "the guard stopped me" from "there was nothing there".
    const cmd = await loadCommand({
      presence: { state: "present", seats: ["forager"] },
      sessionExists: false,
    });
    await runCmd(cmd, { session: "probe", force: false, format: "json" });

    expect(rec.killed).toEqual([]);
    expect(rec.exits).toEqual([]);
    expect(rec.stdout).toContain('"ok":true');
    expect(rec.stdout).toContain('"tornDown":false');
  });
  // The `unknown` state is the entire reason the guard was repointed, and the
  // original four cases could only produce `present` and `none` — so nothing on
  // the command path exercised it. Cases added at forager's pushback (comms
  // #329); the gap was real and was in this file.
  it("REFUSES and does not kill when presence is UNKNOWN and --force is absent", async () => {
    const cmd = await loadCommand({
      presence: {
        state: "unknown",
        reason: "grapevine daemon not running — no presence available",
      },
      sessionExists: true,
    });
    await runCmd(cmd, { session: "probe", force: false, format: "json" });

    // Fails open is the dangerous direction: an unreadable roster must not be
    // treated as an empty one. This is the assertion that flips if the guard is
    // reverted to `state === "present"`.
    expect(rec.killed).toEqual([]);

    expect(rec.exits).toContain(1);
    expect(rec.stderr).toContain('"ok":false');
    // The reason must reach the operator — "I could not tell" is only
    // actionable if it says why it could not tell.
    expect(rec.stderr).toContain("grapevine daemon not running");
    expect(rec.stdout).toBe("");
  });

  it("PROCEEDS and kills when presence is UNKNOWN but --force is passed", async () => {
    const cmd = await loadCommand({
      presence: { state: "unknown", reason: "grapevine 'who' failed" },
      sessionExists: true,
    });
    await runCmd(cmd, { session: "probe", force: true, format: "json" });

    // Keeps the escape hatch honest: blocking on unknown must remain
    // overridable, or an unreachable grapevine would make teardown impossible.
    expect(rec.killed).toEqual(["probe"]);
    expect(rec.exits).toEqual([]);
    expect(rec.stdout).toContain('"tornDown":true');
  });
});
