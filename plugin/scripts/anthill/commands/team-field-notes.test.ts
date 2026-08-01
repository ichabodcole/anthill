/**
 * `anthill field-notes` — the command, and the CHARACTER of the doc it prints.
 *
 * The behavioural tests are ordinary. The last two are not: they guard the
 * framing, which is the part most likely to erode. A doc like this drifts
 * prescriptive one edit at a time — nobody ever decides to make it a mandate.
 */
import { describe, expect, it } from "bun:test";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { cleanGitEnv } from "./test-support.ts";

const CLI = resolve(import.meta.dir, "..", "cli.ts");

function run(args: string[], cwd?: string) {
  const p = Bun.spawnSync(["bun", CLI, ...args], { cwd, env: cleanGitEnv() });
  return { code: p.exitCode, stdout: p.stdout.toString(), stderr: p.stderr.toString() };
}

describe("anthill field-notes", () => {
  it("prints the doc as markdown under --format text", () => {
    const { code, stdout } = run(["field-notes", "--format", "text"]);
    expect(code).toBe(0);
    expect(stdout).toStartWith("# anthill field notes");
  });

  it("returns the doc bytes, not a summary, under --format json", () => {
    const { stdout } = run(["field-notes", "--format", "json"]);
    const lines = stdout.trimEnd().split("\n");
    expect(lines).toHaveLength(1); // one envelope line, no stray output
    const env = JSON.parse(lines[0] as string);
    expect(env.ok).toBe(true);
    // An agent asking for the notes wants the notes; a summary would make it go
    // read the file itself, which defeats the command.
    expect(env.data.markdown).toStartWith("# anthill field notes");
    expect(env.data.markdown.length).toBeGreaterThan(2000);
  });

  it("works with NO .anthill/config.json — someone evaluating anthill can read it", () => {
    const bare = mkdtempSync(join(tmpdir(), "anthill-fieldnotes-bare-"));
    try {
      const { code, stdout } = run(["field-notes", "--format", "text"], bare);
      expect(code).toBe(0);
      expect(stdout).toContain("anthill field notes");
    } finally {
      rmSync(bare, { recursive: true, force: true });
    }
  });

  it("names the CAUSE when the bundled doc is missing, not a raw ENOENT", () => {
    // A packaging slip is not the caller's doing, and "ENOENT ... /private/var/..."
    // names the symptom while hiding the cause. Copy the CLI without its doc and
    // check the message is actionable.
    const dir = mkdtempSync(join(tmpdir(), "anthill-fieldnotes-nodoc-"));
    try {
      const src = resolve(import.meta.dir, "..");
      cpSync(src, join(dir, "anthill"), { recursive: true });
      rmSync(join(dir, "anthill", "field-notes.md"), { force: true });
      const p = Bun.spawnSync(
        ["bun", join(dir, "anthill", "cli.ts"), "field-notes", "--format", "json"],
        {
          cwd: dir,
          env: cleanGitEnv(),
        },
      );
      const line = p.stderr.toString().trim();
      expect(line.split("\n")).toHaveLength(1);
      const env = JSON.parse(line);
      expect(env.ok).toBe(false);
      expect(env.error).toContain("incompletely installed");
      expect(env.error).not.toContain("ENOENT");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("says plainly that it is NOT a list to adopt", () => {
    // The guard on framing. If this fails, someone made the notes prescriptive —
    // which turns observations-with-evidence into rules a team must argue against,
    // and anthill does not get to legislate how somebody else's team works.
    const { stdout } = run(["field-notes", "--format", "text"]);
    expect(stdout).toContain("What this is not");
    expect(stdout).toContain("a list you are expected to adopt");
    expect(stdout).toMatch(/your team may differ/i);
  });

  it("tells the reader how to report a field note that did not hold", () => {
    // The only path by which we learn one of these is wrong. Spontaneous reports
    // have a measured 0-for-5 record here, and a team that quietly discards a
    // note teaches nobody anything — so the ask has to be in the doc.
    const { stdout } = run(["field-notes", "--format", "text"]);
    expect(stdout).toContain("anthill feedback");
  });
});
