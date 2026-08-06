import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  COMMS_DIR,
  commsCurrentPath,
  commsLogPath,
  commsPositionPath,
  listSessions,
  mintSessionId,
  readCurrentSession,
  readSessionOpen,
  resolveCommsLog,
  resolveCommsPosition,
  rotateSession,
  writeSessionOpen,
} from "./comms.ts";

/**
 * Session rotation — `t-ce6f0c2e`, criterion 1.
 *
 * The model this replaces was `comms clear` / `--fresh`, and replacing it was
 * the whole point: THE LOG IS THE PROVENANCE OF EVERYTHING A SESSION SHIPS.
 * A lead pulled a peer's upstream issue draft out of it after teardown, and an
 * entire measurement lane read from it. So rotation MINTS a successor and
 * destroys nothing; deleting stays the human's choice.
 *
 * ⚠ THE MECHANISM LANDS INERT. Rotating a channel with LIVE followers is
 * seams.md 6(e)'s log-swap fired deliberately on everyone at once — `follow`
 * resolves its path ONCE at attach, so a survivor reads a dead path while
 * carrying its old watermark. Every rotation below is against a FIXTURE tree.
 * None of these results is evidence about a live channel, and they must not be
 * quoted as if they were.
 */
function fixture(): string {
  return mkdtempSync(join(tmpdir(), "anthill-rot-"));
}

describe("rotation — the CURRENT pointer and the legacy layout", () => {
  test("LEGACY IS THE STARTING STATE and stays readable — null is a positive answer", () => {
    // Every existing footprint is here. None may become unreadable because
    // rotation shipped, so this is the anchor the rest of the file leans on.
    const dir = fixture();
    mkdirSync(resolve(dir, COMMS_DIR), { recursive: true });
    writeFileSync(commsLogPath(dir, "ch"), '{"id":1}\n', "utf8");

    expect(readCurrentSession(dir, "ch")).toBeNull();
    expect(resolveCommsLog(dir, "ch")).toBe(commsLogPath(dir, "ch"));
    expect(readFileSync(resolveCommsLog(dir, "ch"), "utf8")).toContain('"id":1');
  });

  test("after rotation CURRENT resolves and the log is a NEW, EMPTY, session-scoped file", () => {
    const dir = fixture();
    mkdirSync(resolve(dir, COMMS_DIR), { recursive: true });
    writeFileSync(commsLogPath(dir, "ch"), '{"id":1}\n', "utf8");

    const r = rotateSession(dir, "ch", Date.parse("2026-08-05T12:00:00.000Z"));
    expect(r.sessionId).not.toBeNull();
    const id = r.sessionId as string;

    expect(readCurrentSession(dir, "ch")).toBe(id);
    expect(resolveCommsLog(dir, "ch")).toBe(commsLogPath(dir, "ch", id));
    expect(readFileSync(resolveCommsLog(dir, "ch"), "utf8")).toBe("");
  });

  test("THE INVARIANT: the prior log is NOT destroyed and stays addressable by id", () => {
    // This is the clause that separates rotation from the `clear` it replaces.
    // If this assertion ever goes, the feature has become the thing it was
    // built to avoid.
    const dir = fixture();
    mkdirSync(resolve(dir, COMMS_DIR), { recursive: true });
    writeFileSync(commsLogPath(dir, "ch"), '{"id":1}\n', "utf8");

    rotateSession(dir, "ch", Date.parse("2026-08-05T12:00:00.000Z"));

    expect(readFileSync(commsLogPath(dir, "ch"), "utf8")).toContain('"id":1');
    // …and a SECOND rotation does not destroy the first session either.
    const r2 = rotateSession(dir, "ch", Date.parse("2026-08-05T13:00:00.000Z"));
    const sessions = listSessions(dir, "ch");
    expect(sessions).toContain(null); // the legacy log, addressable as "no id"
    expect(sessions.length).toBe(3); // legacy + two minted
    expect(r2.sessionId).not.toBe(null);
  });

  test("`previous` names the session being succeeded — null out of legacy", () => {
    const dir = fixture();
    const first = rotateSession(dir, "ch", Date.parse("2026-08-05T12:00:00.000Z"));
    expect("previous" in first && first.previous).toBeNull();

    const second = rotateSession(dir, "ch", Date.parse("2026-08-05T13:00:00.000Z"));
    expect("previous" in second && second.previous).toBe(first.sessionId as string);
  });
});

describe("rotation — POSITIONS are per session, which is the 6(e) defence", () => {
  test("a position written before rotation is NOT visible after it", () => {
    // steward pre-registered the hazard and sentinel then measured it live: a
    // log swapped under a follower produces a FALSE `current`, because the
    // watermark survives into a log that never contained those messages.
    // Per-session positions make that unrepresentable rather than merely
    // unlikely — the post-rotation lookup cannot reach the old file.
    const dir = fixture();
    const before = commsPositionPath(dir, "ch", "forager");
    mkdirSync(resolve(dir, COMMS_DIR, "ch.positions"), { recursive: true });
    writeFileSync(before, JSON.stringify({ handle: "forager", emittedThrough: 389 }), "utf8");

    expect(resolveCommsPosition(dir, "ch", "forager")).toBe(before);

    rotateSession(dir, "ch", Date.parse("2026-08-05T12:00:00.000Z"));

    const after = resolveCommsPosition(dir, "ch", "forager");
    expect(after).not.toBe(before);
    // The OLD file still exists — nothing is destroyed — it is simply no longer
    // what a reader resolves. Both halves matter: no data loss, no false read.
    expect(readFileSync(before, "utf8")).toContain("389");
  });

  test("THE DISCRIMINATOR: legacy / session-A / session-B are three distinct paths", () => {
    // One function, three inputs, asserted as a SET. Any single row is
    // satisfied by a hardcoded value; the set is not.
    const paths = [
      commsPositionPath("/t", "ch", "forager"),
      commsPositionPath("/t", "ch", "forager", "sA"),
      commsPositionPath("/t", "ch", "forager", "sB"),
    ];
    expect(new Set(paths).size).toBe(3);
  });
});

describe("rotation — DROPPING the session-open record is the safe half", () => {
  test("the record is DROPPED, so teardown fails SAFE into `unknown`", () => {
    // c9a33e7 instruments the consequence: a DROPPED record means `spawned` is
    // unknowable, which is `unknown`, which BLOCKS teardown. Preserving it
    // would leave `spawned` naming the previous session's seats beside an empty
    // positions dir — the pane-kill conjunction, wearing the shape of tidiness.
    const dir = fixture();
    writeSessionOpen(dir, "ch", ["forager", "weaver"]);
    expect(readSessionOpen(dir, "ch")?.spawned).toEqual(["forager", "weaver"]);

    rotateSession(dir, "ch", Date.parse("2026-08-05T12:00:00.000Z"));

    expect(readSessionOpen(dir, "ch")).toBeNull();
  });
});

describe("rotation — the id, and the filename guards", () => {
  test("ids are SORTABLE and carry their own timestamp", () => {
    const a = mintSessionId(Date.parse("2026-08-05T12:00:00.000Z"));
    const b = mintSessionId(Date.parse("2026-08-05T13:00:00.000Z"));
    expect(a < b).toBe(true);
    expect(a).toContain("2026-08-05");
  });

  test("a session id becomes a FILENAME and is charset-guarded like the channel", () => {
    expect(() => commsLogPath("/t", "ch", "../../etc/passwd")).toThrow(/unsafe session id/);
    expect(() => commsPositionPath("/t", "ch", "forager", "../evil")).toThrow(/unsafe session id/);
  });

  test("a damaged CURRENT pointer reads as LEGACY, never as a traversal", () => {
    // Fail toward the layout that still works, and never toward a path outside
    // the comms dir.
    const dir = fixture();
    mkdirSync(resolve(dir, COMMS_DIR), { recursive: true });
    writeFileSync(commsCurrentPath(dir, "ch"), "../../etc/passwd\n", "utf8");
    expect(readCurrentSession(dir, "ch")).toBeNull();
    expect(resolveCommsLog(dir, "ch")).toBe(commsLogPath(dir, "ch"));
  });
});
