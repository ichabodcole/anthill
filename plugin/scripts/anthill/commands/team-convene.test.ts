import { describe, expect, it } from "bun:test";
import { bountyOpenArgs } from "./team-convene.ts";

describe("bountyOpenArgs", () => {
  it("composes the keyed, pinned, headless-safe open argv for the team channel", () => {
    expect(bountyOpenArgs("anthill")).toEqual([
      "open",
      "--session-key",
      "anthill",
      "--pin",
      "--no-open",
    ]);
  });

  it("passes the channel through verbatim as the session key", () => {
    expect(bountyOpenArgs("dreamwood-dev")).toEqual([
      "open",
      "--session-key",
      "dreamwood-dev",
      "--pin",
      "--no-open",
    ]);
  });
});
