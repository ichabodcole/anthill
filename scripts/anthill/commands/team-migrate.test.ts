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

/**
 * Seed a temp git repo with a committed v1 footprint (`.team/` + a living-docs dir).
 * `override`: none → the default `docs/team` with no `paths`; "redundant" → `paths` set
 * to the v1 default `docs/team`; "bespoke" → `paths` set to a deliberately custom dir.
 */
function seedV1Repo(opts?: { override?: "redundant" | "bespoke" }): string {
  const root = mkdtempSync(resolve(tmpdir(), "anthill-migrate-"));
  sh(["git", "init", "-q"], root);
  sh(["git", "config", "user.email", "t@t.dev"], root);
  sh(["git", "config", "user.name", "tester"], root);

  const teamDir = opts?.override === "bespoke" ? "team-docs" : "docs/team";

  mkdirSync(join(root, ".team"), { recursive: true });
  const config: Record<string, unknown> = {
    version: 1,
    channel: "demo",
    lead: "lead",
    seats: [{ handle: "lead", role: "lead", scope: "x", spawn: false }],
  };
  if (opts?.override) {
    config.paths = { teamDir, seatDir: `${teamDir}/dev`, seams: `${teamDir}/dev/seams.md` };
  }
  writeFileSync(join(root, ".team/config.json"), `${JSON.stringify(config, null, 2)}\n`);

  mkdirSync(join(root, teamDir, "dev"), { recursive: true });
  writeFileSync(join(root, teamDir, "README.md"), "# SOP\n");
  writeFileSync(join(root, teamDir, "dev/seams.md"), "# seams\n");
  writeFileSync(join(root, teamDir, "dev/lead.md"), "# lead\n");
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

  test("redundant-default paths override consolidates anyway + drops the override", async () => {
    root = seedV1Repo({ override: "redundant" });
    const { code } = await runCli(["migrate", "--format", "json"], root);
    expect(code).toBe(0);

    // The override just repeated the v1 default → docs consolidated into .anthill/.
    expect(existsSync(join(root, ".anthill/README.md"))).toBe(true);
    expect(existsSync(join(root, "docs/team"))).toBe(false);
    // The redundant `paths` block was dropped so config falls to the v2 default.
    const cfg = JSON.parse(readFileSync(join(root, ".anthill/config.json"), "utf8"));
    expect(cfg.version).toBe(2);
    expect(cfg.paths).toBeUndefined();
  });

  test("--keep-paths honors a redundant override — docs stay put", async () => {
    root = seedV1Repo({ override: "redundant" });
    const { code } = await runCli(["migrate", "--keep-paths", "--format", "json"], root);
    expect(code).toBe(0);

    // Docs left at docs/team; only config consolidated; the override is retained.
    expect(existsSync(join(root, "docs/team/README.md"))).toBe(true);
    expect(existsSync(join(root, ".anthill/README.md"))).toBe(false);
    const cfg = JSON.parse(readFileSync(join(root, ".anthill/config.json"), "utf8"));
    expect(cfg.paths.teamDir).toBe("docs/team");
  });

  test("bespoke paths override is honored — a genuinely custom location stays put", async () => {
    root = seedV1Repo({ override: "bespoke" });
    const { code } = await runCli(["migrate", "--format", "json"], root);
    expect(code).toBe(0);

    // The custom team-docs location is left in place; only config consolidated.
    expect(existsSync(join(root, "team-docs/README.md"))).toBe(true);
    expect(existsSync(join(root, ".anthill/README.md"))).toBe(false);
    expect(existsSync(join(root, ".team"))).toBe(false);
    const cfg = JSON.parse(readFileSync(join(root, ".anthill/config.json"), "utf8"));
    expect(cfg.version).toBe(2);
    expect(cfg.paths.teamDir).toBe("team-docs");
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
