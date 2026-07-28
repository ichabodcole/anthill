import { describe, expect, it } from "bun:test";
import {
  formatMultiSessionHint,
  formatNoProjectHint,
  relatedSessions,
  resolveAttachAction,
} from "./team-attach.ts";

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

// PURE: which running tmux sessions belong to this team (anthill#45). A team
// legitimately spans several sessions via staged spawns; attaching to the first
// and hiding the rest strands the human away from half their own team.
describe("relatedSessions", () => {
  const all = ["operator", "operator-p2", "operator-p3", "operator2", "unrelated", "op"];

  it("matches the base session and its -suffix siblings", () => {
    expect(relatedSessions(all, "operator")).toEqual(["operator", "operator-p2", "operator-p3"]);
  });

  it("does NOT treat a name that merely shares a prefix as a sibling", () => {
    // `operator2` is a different team, not `operator`'s sibling.
    expect(relatedSessions(all, "operator")).not.toContain("operator2");
  });

  it("puts the base session first, then siblings alphabetically", () => {
    expect(relatedSessions(["operator-p3", "operator-p2", "operator"], "operator")).toEqual([
      "operator",
      "operator-p2",
      "operator-p3",
    ]);
  });

  it("finds a sibling even when the base session is not running", () => {
    expect(relatedSessions(["operator-p2"], "operator")).toEqual(["operator-p2"]);
  });

  it("is empty when nothing is bound to the channel", () => {
    expect(relatedSessions(["other"], "operator")).toEqual([]);
  });
});

describe("formatMultiSessionHint", () => {
  it("lists every bound session and refuses to guess", () => {
    const msg = formatMultiSessionHint("operator", ["operator", "operator-p2"]);
    expect(msg).toContain("spans 2 tmux sessions");
    expect(msg).toContain("not guessing");
    expect(msg).toContain("  - operator");
    expect(msg).toContain("  - operator-p2");
    // Suggests a sibling, since the base is the one they'd have gotten anyway.
    expect(msg).toContain("anthill attach --session operator-p2");
  });
});
