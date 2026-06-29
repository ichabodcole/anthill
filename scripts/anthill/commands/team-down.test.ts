import { describe, expect, it } from "bun:test";
import { shouldBlockTeardown } from "./team-down.ts";

// PURE guard: block a teardown only when seats are still on the vine and the
// human hasn't passed --force.
describe("shouldBlockTeardown", () => {
  it("blocks when seats are present and not forced", () => {
    expect(shouldBlockTeardown(["loom", "mosaic"], false)).toBe(true);
  });

  it("allows when seats are present but forced", () => {
    expect(shouldBlockTeardown(["loom", "mosaic"], true)).toBe(false);
  });

  it("allows when nobody is present and not forced", () => {
    expect(shouldBlockTeardown([], false)).toBe(false);
  });
});
