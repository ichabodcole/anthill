import { afterEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// Subprocess integration: the migrate executor does real `git mv` in a real repo,
// so we drive the CLI against a seeded temp git repo and assert the on-disk result.
const CLI = resolve(import.meta.dir, "..", "cli.ts");

function sh(cmd: string[], cwd: string): { ok: boolean; stdout: string; stderr: string } {
  const r = spawnSync(cmd[0] as string, cmd.slice(1), { cwd, encoding: "utf8" });
  return { ok: r.status === 0, stdout: (r.stdout ?? "").trim(), stderr: (r.stderr ?? "").trim() };
}

async function runCli(
  args: string[],
  cwd: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(["bun", CLI, ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { code, stdout, stderr };
}

function firstJson(s: string): {
  ok?: boolean;
  data?: {
    dryRun?: boolean;
    from?: number;
    to?: number;
    ops?: unknown[];
    alreadyCurrent?: boolean;
  };
} | null {
  const line = s
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("{"));
  return line ? JSON.parse(line) : null;
}

/** Seed a temp git repo with a committed v1 footprint (.team/ + docs/team/). */
function seedV1Repo(opts?: { override?: boolean }): string {
  const root = mkdtempSync(resolve(tmpdir(), "anthill-migrate-"));
  sh(["git", "init", "-q"], root);
  sh(["git", "config", "user.email", "t@t.dev"], root);
  sh(["git", "config", "user.name", "tester"], root);

  mkdirSync(join(root, ".team"), { recursive: true });
  const config: Record<string, unknown> = {
    version: 1,
    channel: "demo",
    lead: "lead",
    seats: [{ handle: "lead", role: "lead", scope: "x", spawn: false }],
  };
  if (opts?.override) {
    config.paths = {
      teamDir: "docs/team",
      seatDir: "docs/team/dev",
      seams: "docs/team/dev/seams.md",
    };
  }
  writeFileSync(join(root, ".team/config.json"), `${JSON.stringify(config, null, 2)}\n`);

  mkdirSync(join(root, "docs/team/dev"), { recursive: true });
  writeFileSync(join(root, "docs/team/README.md"), "# SOP\n");
  writeFileSync(join(root, "docs/team/dev/seams.md"), "# seams\n");
  writeFileSync(join(root, "docs/team/dev/lead.md"), "# lead\n");
  writeFileSync(join(root, ".gitignore"), "node_modules\n.team/scratch/\n");

  sh(["git", "add", "-A"], root);
  sh(["git", "commit", "-q", "-m", "seed v1"], root);
  return root;
}

describe("anthill migrate — v1 → v2", () => {
  let root = "";
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = "";
  });

  test("--dry-run previews v1→v2 and changes nothing on disk", async () => {
    root = seedV1Repo();
    const { code, stdout } = await runCli(["migrate", "--dry-run", "--format", "json"], root);
    expect(code).toBe(0);
    const env = firstJson(stdout);
    expect(env?.ok).toBe(true);
    expect(env?.data?.dryRun).toBe(true);
    expect(env?.data?.from).toBe(1);
    expect(env?.data?.to).toBe(2);
    // Tree untouched.
    expect(existsSync(join(root, ".team/config.json"))).toBe(true);
    expect(existsSync(join(root, ".anthill"))).toBe(false);
    expect(existsSync(join(root, "docs/team/README.md"))).toBe(true);
  });

  test("applies: .anthill/ layout, version 2, gitignore swapped, git history preserved", async () => {
    root = seedV1Repo();
    const { code, stdout } = await runCli(["migrate", "--format", "json"], root);
    expect(code).toBe(0);
    expect(firstJson(stdout)?.data?.to).toBe(2);

    // New consolidated layout.
    expect(existsSync(join(root, ".anthill/config.json"))).toBe(true);
    expect(existsSync(join(root, ".anthill/README.md"))).toBe(true);
    expect(existsSync(join(root, ".anthill/dev/seams.md"))).toBe(true);
    // Old locations gone.
    expect(existsSync(join(root, ".team"))).toBe(false);
    expect(existsSync(join(root, "docs/team"))).toBe(false);

    // Version stamped.
    const cfg = JSON.parse(readFileSync(join(root, ".anthill/config.json"), "utf8"));
    expect(cfg.version).toBe(2);

    // Gitignore line swapped.
    const gi = readFileSync(join(root, ".gitignore"), "utf8");
    expect(gi).toContain(".anthill/scratch/");
    expect(gi).not.toContain(".team/scratch/");

    // History preserved: commit the staged moves, then --follow traces the old path.
    sh(["git", "add", "-A"], root);
    sh(["git", "commit", "-q", "-m", "migrate to v2"], root);
    const log = sh(["git", "log", "--follow", "--format=%s", "--", ".anthill/README.md"], root);
    expect(log.stdout).toContain("seed v1");
  });

  test("re-running on an already-migrated repo is a clean no-op", async () => {
    root = seedV1Repo();
    await runCli(["migrate"], root);
    const { code, stdout } = await runCli(["migrate", "--format", "json"], root);
    expect(code).toBe(0);
    const env = firstJson(stdout);
    expect(env?.data?.alreadyCurrent).toBe(true);
    expect(env?.data?.ops).toEqual([]);
  });

  test("paths override: living docs stay put, only the config dir consolidates", async () => {
    root = seedV1Repo({ override: true });
    const { code } = await runCli(["migrate", "--format", "json"], root);
    expect(code).toBe(0);

    // Config moved into .anthill/, .team/ gone.
    expect(existsSync(join(root, ".anthill/config.json"))).toBe(true);
    expect(existsSync(join(root, ".team"))).toBe(false);
    // Living docs STAYED at the overridden docs/team (escape hatch respected).
    expect(existsSync(join(root, "docs/team/README.md"))).toBe(true);
    expect(existsSync(join(root, ".anthill/README.md"))).toBe(false);

    // Version stamped; the override is retained.
    const cfg = JSON.parse(readFileSync(join(root, ".anthill/config.json"), "utf8"));
    expect(cfg.version).toBe(2);
    expect(cfg.paths.teamDir).toBe("docs/team");
  });

  test("no footprint at all → clean {ok:false} envelope, exit 1", async () => {
    root = mkdtempSync(resolve(tmpdir(), "anthill-nomig-"));
    sh(["git", "init", "-q"], root);
    const { code, stderr } = await runCli(["migrate", "--format", "json"], root);
    expect(code).toBe(1);
    const env = firstJson(stderr);
    expect(env?.ok).toBe(false);
  });
});
