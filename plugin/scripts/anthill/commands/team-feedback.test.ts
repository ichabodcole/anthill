import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import type { GhResult } from "../feedback.ts";
import { buildFeedback, type FeedbackDeps } from "./team-feedback.ts";

// End-to-end guard envelopes (the guards live inside run()): spawn the CLI and
// assert the dual-audience {ok:false} envelope on stderr, exit 1 — same style as
// team-commit.test.ts. No network: the guards fire before any gh call.
const CLI = resolve(import.meta.dir, "..", "cli.ts");

async function runCli(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(["bun", CLI, ...args], { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { code, stdout, stderr };
}

function firstJson(
  s: string,
): { ok?: boolean; error?: string; meta?: { command?: string } } | null {
  const line = s
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("{"));
  return line ? JSON.parse(line) : null;
}

describe("anthill feedback — guard envelopes (--format json)", () => {
  test("no message → clean {ok:false} envelope on stderr, exit 1", async () => {
    const { code, stderr } = await runCli(["feedback", "--format", "json"]);
    expect(code).toBe(1);
    const env = firstJson(stderr);
    expect(env?.ok).toBe(false);
    expect(env?.error).toMatch(/message is required/);
    expect(env?.meta?.command).toBe("feedback");
    expect(stderr).not.toMatch(/at run \(/);
  });

  test("unknown --category → clean {ok:false} envelope on stderr, exit 1", async () => {
    const { code, stderr } = await runCli([
      "feedback",
      "hello",
      "--category",
      "nope",
      "--format",
      "json",
    ]);
    expect(code).toBe(1);
    const env = firstJson(stderr);
    expect(env?.ok).toBe(false);
    expect(env?.error).toMatch(/unknown --category/);
    expect(env?.meta?.command).toBe("feedback");
  });
});

// Behavior branches via the injectable buildFeedback — no real gh, no network.
const ENV: FeedbackDeps["env"] = {
  version: "1.2.0",
  platform: "darwin",
  osRelease: "25.5.0",
  bunVersion: "1.1.30",
};

function stubGh(result: GhResult): FeedbackDeps {
  return { gh: () => result, env: ENV };
}

/** A gh stub that MUST NOT be called (default/compose path). */
function forbiddenGh(): FeedbackDeps {
  return {
    gh: () => {
      throw new Error("gh() must not be called without --submit");
    },
    env: ENV,
  };
}

describe("buildFeedback — behavior branches", () => {
  test("default (no submit): composes, includes repo + submitCmd + prefilled URL, sends nothing", () => {
    const data = buildFeedback(
      { message: "scan misreads pnpm globs", category: "friction", submit: false },
      forbiddenGh(),
    );
    expect(data.title).toBe("[feedback/friction]  scan misreads pnpm globs");
    expect(data.repo).toBe("ichabodcole/anthill");
    expect(data.issueUrl).toContain("https://github.com/ichabodcole/anthill/issues/new?");
    expect(data.issueUrl).toContain("labels=anthill-feedback");
    expect(data.submitCmd).toBe(
      'anthill feedback "scan misreads pnpm globs" --category friction --submit',
    );
    expect(data.warnings).toBeUndefined();
  });

  test("submitCmd includes --skill when given", () => {
    const data = buildFeedback(
      { message: "x", category: "idea", skill: "bootstrap", submit: false },
      forbiddenGh(),
    );
    expect(data.submitCmd).toBe(
      'anthill feedback "x" --category idea --skill "bootstrap" --submit',
    );
  });

  test("submit success: returns the created issue URL, no repo/submitCmd/warnings", () => {
    const data = buildFeedback(
      { message: "a real bug", category: "bug", submit: true },
      stubGh({
        status: 0,
        stdout: "https://github.com/ichabodcole/anthill/issues/7\n",
        stderr: "",
      }),
    );
    expect(data.issueUrl).toBe("https://github.com/ichabodcole/anthill/issues/7");
    expect(data.repo).toBeUndefined();
    expect(data.submitCmd).toBeUndefined();
    expect(data.warnings).toBeUndefined();
  });

  test("submit failure: degrades to the prefilled URL + a warning, loses nothing", () => {
    const data = buildFeedback(
      { message: "a real bug", category: "bug", submit: true },
      stubGh({ status: 1, stdout: "", stderr: "gh: not authenticated" }),
    );
    expect(data.issueUrl).toContain("https://github.com/ichabodcole/anthill/issues/new?");
    expect(data.body).toContain("a real bug");
    expect(data.warnings?.length).toBe(1);
    expect(data.warnings?.[0]).toMatch(/nothing was lost/);
  });

  test("submit with a missing gh binary (status null): still degrades, no throw", () => {
    const data = buildFeedback(
      { message: "x", category: "docs", submit: true },
      stubGh({ status: null, stdout: "", stderr: "" }),
    );
    expect(data.issueUrl).toContain("/issues/new?");
    expect(data.warnings?.length).toBe(1);
  });
});
