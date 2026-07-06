import { describe, expect, it } from "bun:test";
import { formatNoProjectHint, resolveAttachAction } from "./team-attach.ts";

// PURE decider: maps {isTty, insideTmux} → how to reach the session.
describe("resolveAttachAction", () => {
  it("prints the command when not a TTY (an agent can't attach)", () => {
    expect(resolveAttachAction({ isTty: false, insideTmux: false })).toBe("print");
    // Not-a-TTY wins even if TMUX happens to be set.
    expect(resolveAttachAction({ isTty: false, insideTmux: true })).toBe("print");
  });

  it("switches client when a TTY is already inside tmux (can't nest attach)", () => {
    expect(resolveAttachAction({ isTty: true, insideTmux: true })).toBe("switch");
  });

  it("attaches when a TTY is outside tmux", () => {
    expect(resolveAttachAction({ isTty: true, insideTmux: false })).toBe("attach");
  });
});

// PURE no-project hint: the friendly fallback shown when `attach` runs outside a
// project with no `--session`.
describe("formatNoProjectHint", () => {
  it("names the searched cwd and points at the two ways forward", () => {
    const msg = formatNoProjectHint("/tmp/x", []);
    expect(msg).toContain("no .anthill/config.json found searching up from /tmp/x");
    expect(msg).toContain("cd into your project");
    expect(msg).toContain("--session <name>");
  });

  it("lists running sessions when there are any", () => {
    const msg = formatNoProjectHint("/tmp/x", ["alpha", "beta"]);
    expect(msg).toContain("Running tmux sessions:");
    expect(msg).toContain("  - alpha");
    expect(msg).toContain("  - beta");
  });

  it("says so when no sessions are running", () => {
    const msg = formatNoProjectHint("/tmp/x", []);
    expect(msg).toContain("(no tmux sessions are currently running)");
  });
});
