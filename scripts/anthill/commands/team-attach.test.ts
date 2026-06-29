import { describe, expect, it } from "bun:test";
import { resolveAttachAction } from "./team-attach.ts";

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
