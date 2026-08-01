/**
 * Contract 4's proof, run against the REAL command in a REAL tree.
 *
 * `comms.test.ts` proves the pure resolver. It cannot prove assertion (2):
 * "config absent" there means "I passed null", which asserts my own branch
 * rather than the world. Contract 4's proof text says explicitly *run from a
 * tree with no config, not simulated* — so these spawn the CLI with a cwd that
 * genuinely has no `.anthill/config.json` above it.
 *
 * The tmp root matters: a temp dir INSIDE this repo would walk up and find
 * anthill's own config, and the no-config assertion would silently become a
 * different test that happens to pass.
 */

import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { cleanGitEnv } from "./test-support.ts";

const CLI = resolve(import.meta.dir, "..", "cli.ts");

let noConfigDir: string;
let teamDir: string;

beforeAll(() => {
  noConfigDir = mkdtempSync(join(tmpdir(), "anthill-comms-bare-"));
  teamDir = mkdtempSync(join(tmpdir(), "anthill-comms-team-"));
  mkdirSync(join(teamDir, ".anthill"), { recursive: true });
  writeFileSync(
    join(teamDir, ".anthill", "config.json"),
    JSON.stringify({
      version: 2,
      channel: "test-channel",
      seats: [
        { handle: "forager", role: "hands (CLI/engine)", scope: "scripts/", spawn: true },
        { handle: "weaver", role: "skills", scope: "skills/", spawn: true },
      ],
    }),
  );
});

afterAll(() => {
  rmSync(noConfigDir, { recursive: true, force: true });
  rmSync(teamDir, { recursive: true, force: true });
});

function run(cwd: string, args: string[]) {
  const proc = Bun.spawnSync(["bun", CLI, ...args, "--format", "json"], {
    cwd,
    env: cleanGitEnv(),
  });
  return {
    code: proc.exitCode,
    stdout: proc.stdout.toString(),
    stderr: proc.stderr.toString(),
  };
}

/**
 * Parse the envelope, ASSERTING it is the only thing on the stream.
 *
 * This deliberately does NOT take `.at(-1)`. Picking the last line makes the
 * helper tolerate exactly the defect these tests exist to catch: prose (a usage
 * block, a warning, a stray log) emitted alongside the envelope. An agent does
 * `JSON.parse(stderr)` on the WHOLE stream and gets a syntax error, while a
 * last-line helper reports a clean pass — so the suite would stay green while
 * every real caller broke. Cold review found exactly that leak on `comms
 * follow` (M1) after this helper had been green over it all along.
 *
 * Same shape as `cli.test.ts`'s single-line assertion; that file is the
 * precedent, this one is catching up to it.
 */
function parse(text: string): { ok: boolean; error?: string; data?: Record<string, unknown> } {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length !== 1) {
    throw new Error(
      `expected exactly ONE envelope line, got ${lines.length}:\n${text}\n` +
        "(a second line means something is leaking onto the stream beside the envelope)",
    );
  }
  return JSON.parse(lines[0] as string);
}

const logPath = () => join(teamDir, ".anthill", "comms", "test-channel.ndjson");

describe("assertion (2) — no config, in a real tree (NOT simulated)", () => {
  test("sanity: the tmp tree really has no config above it", () => {
    // If this ever fails, every no-config assertion below is testing something
    // else and passing for the wrong reason.
    let dir = noConfigDir;
    for (;;) {
      expect(existsSync(join(dir, ".anthill", "config.json"))).toBe(false);
      const parent = resolve(dir, "..");
      if (parent === dir) break;
      dir = parent;
    }
  });

  test("send fails with a structured envelope, not a bare non-zero", () => {
    const r = run(noConfigDir, ["comms", "send", "hello", "--as", "forager"]);
    expect(r.code).not.toBe(0);
    expect(parse(r.stderr).ok).toBe(false);
  });

  test("the error names WHERE it looked, not just the filename", () => {
    // The filename alone tells an operator nothing about where — which is
    // exactly what assertion (2) exists to guarantee. This asserts the real
    // start dir appears, so a fabricated or dropped locator fails here.
    const r = run(noConfigDir, ["comms", "send", "hello", "--as", "forager"]);
    const error = parse(r.stderr).error ?? "";
    expect(error).toContain(".anthill/config.json");
    expect(error).toContain("anthill-comms-bare-");
    expect(error).toContain("or any parent");
  });
});

describe("assertion (4) — the success path states where identity came from", () => {
  test("a valid seat's send reports identity resolved-from-roster", () => {
    const r = run(teamDir, ["comms", "send", "first message", "--as", "forager"]);
    expect(r.code).toBe(0);
    expect(parse(r.stdout).data?.identity).toBe("resolved-from-roster");
  });

  test("the sent message carries the roster's role — proof the roster was read", () => {
    run(teamDir, ["comms", "send", "second message", "--as", "weaver"]);
    const lines = readFileSync(logPath(), "utf8").trim().split("\n");
    const last = JSON.parse(lines[lines.length - 1] ?? "{}");
    expect(last.from).toBe("weaver");
    expect(last.role).toBe("skills");
  });
});

describe("assertion (1) — a handle that is not in the roster", () => {
  test("errors and enumerates the valid seats", () => {
    const r = run(teamDir, ["comms", "send", "sneaky", "--as", "ghost"]);
    expect(r.code).not.toBe(0);
    const error = parse(r.stderr).error ?? "";
    expect(error).toContain("forager");
    expect(error).toContain("weaver");
  });

  test("and NOTHING is sent — the half that actually matters", () => {
    // An error envelope that still delivered would be the free-form-alias
    // fallback wearing a hat: the wedge would be gone and the tests still green.
    const before = readFileSync(logPath(), "utf8");
    run(teamDir, ["comms", "send", "must not land", "--as", "ghost"]);
    expect(readFileSync(logPath(), "utf8")).toBe(before);
  });
});

describe("assertion (3) — --as omitted is never an ambient identity", () => {
  test("errors rather than inventing a sender", () => {
    const r = run(teamDir, ["comms", "send", "anonymous"]);
    expect(r.code).not.toBe(0);
    expect(parse(r.stderr).ok).toBe(false);
  });

  test("and nothing is sent", () => {
    const before = readFileSync(logPath(), "utf8");
    run(teamDir, ["comms", "send", "anonymous"]);
    expect(readFileSync(logPath(), "utf8")).toBe(before);
  });
});

describe("read TERMINATES — it is the catch-up verb", () => {
  test("returns the channel history and exits", () => {
    const r = run(teamDir, ["comms", "read"]);
    expect(r.code).toBe(0);
    const messages = parse(r.stdout).data?.messages as unknown[];
    expect(messages.length).toBeGreaterThan(0);
  });

  test("fetches exactly one message by id — not a range with a caveat", () => {
    const r = run(teamDir, ["comms", "read", "--id", "1"]);
    const messages = parse(r.stdout).data?.messages as Array<{ id: number }>;
    expect(messages).toHaveLength(1);
    expect(messages[0]?.id).toBe(1);
  });
});

describe("--as on read — rejected, but it must TEACH, not just refuse", () => {
  // `--as` on `read` was previously swallowed in silence: the command appeared
  // to work while the flag did nothing. Rejecting it is correct (reads are not
  // attributed — Contract 4 c-bis), but a bare "unknown flag" would read as the
  // tool losing a capability it never actually had.
  test("is rejected rather than silently ignored", () => {
    const r = run(teamDir, ["comms", "read", "--as", "forager"]);
    expect(r.code).not.toBe(0);
  });

  test("says WHY, not merely that the flag is unknown", () => {
    const error = parse(run(teamDir, ["comms", "read", "--as", "forager"]).stderr).error ?? "";
    expect(error).toContain("not attributed");
  });

  test("tells the caller exactly what to do instead", () => {
    const error = parse(run(teamDir, ["comms", "read", "--as", "forager"]).stderr).error ?? "";
    expect(error).toContain("drop");
  });

  test("still works without it — the capability was never lost", () => {
    expect(run(teamDir, ["comms", "read"]).code).toBe(0);
  });
});

describe("the verb surface cannot express the mistake", () => {
  // These guard the guardrail. Prose warning against live-tail-for-catch-up has
  // already been read, edited, believed and then violated by its own author in
  // this repo — so the constraint lives here, where a flag cannot reintroduce it.
  const help = (args: string[]) =>
    Bun.spawnSync(["bun", CLI, ...args, "--help"], {
      cwd: teamDir,
      env: cleanGitEnv(),
    }).stdout.toString();

  test("follow has no --since — the flag that makes a stream look finite", () => {
    expect(help(["comms", "follow"])).not.toContain("--since");
  });

  test("follow has no --last and no --from-start either", () => {
    const text = help(["comms", "follow"]);
    expect(text).not.toContain("--last");
    expect(text).not.toContain("--from-start");
  });

  test("read has no --follow — the same mistake pointed the other way", () => {
    expect(help(["comms", "read"])).not.toContain("--follow");
  });
});

describe("regressions — the two concurrency bugs found in review", () => {
  // Both were reproduced BEFORE they were fixed. Each test below fails against
  // the pre-fix code, which is the only thing that makes it a regression test.

  test("send: concurrent sends never reuse a message id", async () => {
    // Pre-fix: `id: nextMessageId(existing)` was computed from a read that
    // PRECEDED the append, so simultaneous senders read the same log and both
    // claimed the same number. Six concurrent sends produced 1,2,3,4,4,5,5,6,7.
    // `O_APPEND` protects the bytes; it does nothing for a value decided before
    // the write. A duplicate breaks `read <channel> <id>` and the read-watermark
    // convention ("ratified as of #14") — the whole point of stable ids.
    const dir = mkdtempSync(join(tmpdir(), "anthill-comms-race-"));
    mkdirSync(join(dir, ".anthill"), { recursive: true });
    writeFileSync(
      join(dir, ".anthill", "config.json"),
      readFileSync(join(teamDir, ".anthill", "config.json"), "utf8"),
    );

    const N = 10;
    await Promise.all(
      Array.from(
        { length: N },
        (_, i) =>
          Bun.spawn(
            ["bun", CLI, "comms", "send", `race ${i}`, "--as", i % 2 ? "weaver" : "forager"],
            { cwd: dir, env: cleanGitEnv(), stdout: "ignore", stderr: "ignore" },
          ).exited,
      ),
    );

    const ids = readFileSync(join(dir, ".anthill", "comms", "test-channel.ndjson"), "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l).id as number);

    expect(ids).toHaveLength(N);
    expect(new Set(ids).size).toBe(N); // the assertion that failed pre-fix
    expect([...ids].sort((a, b) => a - b)).toEqual(Array.from({ length: N }, (_, i) => i + 1));
    rmSync(dir, { recursive: true, force: true });
  });

  test("follow: a multi-byte message does not deafen the tail", async () => {
    // Pre-fix: the resume offset was a BYTE length from `statSync`, but the
    // chunk was sliced off a decoded STRING. One em dash makes those disagree
    // (byte 306 vs char 296) and `slice(offset)` then returns "" forever — the
    // follower goes permanently deaf with no error and no way to tell it apart
    // from a quiet channel. Anthill's own docs are full of em dashes and arrows,
    // so this fires on ordinary use, not an exotic edge case.
    //
    // This drives the REAL `follow` process rather than re-deriving its
    // arithmetic in the test: the bug was that the shipped loop disagreed with
    // itself about units, which an arithmetic-only test cannot see.
    const dir = mkdtempSync(join(tmpdir(), "anthill-comms-utf8-"));
    mkdirSync(join(dir, ".anthill"), { recursive: true });
    writeFileSync(
      join(dir, ".anthill", "config.json"),
      readFileSync(join(teamDir, ".anthill", "config.json"), "utf8"),
    );

    const follower = Bun.spawn(
      ["bun", CLI, "comms", "follow", "--as", "weaver", "--format", "json"],
      {
        cwd: dir,
        env: cleanGitEnv(),
        stdout: "pipe",
        stderr: "ignore",
      },
    );

    const seen: string[] = [];
    const drain = (async () => {
      for await (const part of follower.stdout as ReadableStream<Uint8Array>) {
        seen.push(new TextDecoder().decode(part));
      }
    })();

    await Bun.sleep(400); // let it establish its start-from-now offset
    // FIRST a multi-byte message: this is what desynced the offset. THEN a plain
    // one — the second is the canary. Pre-fix the first arrives and every
    // message after it is swallowed.
    run(dir, ["comms", "send", "seam ratified — envelope grain → field grain", "--as", "forager"]);
    await Bun.sleep(400);
    run(dir, ["comms", "send", "the canary, pure ascii", "--as", "weaver"]);
    await Bun.sleep(600);

    follower.kill();
    await drain.catch(() => {});

    const out = seen.join("");
    expect(out).toContain("envelope grain");
    expect(out).toContain("the canary, pure ascii"); // the assertion that failed pre-fix
    rmSync(dir, { recursive: true, force: true });
  });
});
