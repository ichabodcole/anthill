/**
 * Help rendering — the surface a confused user reads FIRST.
 *
 * The case under test is the `refused` arg: a flag the CLI registers with the
 * parser precisely so that passing it produces "refused, and here is why"
 * rather than "unknown option". That machinery only pays off if help does NOT
 * advertise the flag. `comms read` shipped listing `--as=<as>` in its OPTIONS
 * block — on the exact verb that rejects it, with an empty description — which
 * taught the very mistake `refused` exists to correct.
 */
import { describe, expect, test } from "bun:test";
import { type AnyCommand, defineCommand } from "./define.ts";
import { renderCommandUsage } from "./help-renderer.ts";

// `AnyCommand` is the erased type the real `--help` path uses (`cli.ts` renders
// whatever `resolveSubCommand` hands back), so the test goes through the same
// shape rather than a narrower inferred one.
const cmd: AnyCommand = defineCommand({
  meta: { name: "read", description: "Print history and exit", version: "0.0.0" },
  args: {
    channel: { type: "string", description: "Channel", valueHint: "name" },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
    as: {
      type: "string",
      refused: "reads are not attributed to a seat",
    },
  },
  run() {},
});

describe("renderCommandUsage — a refused arg is never advertised", () => {
  const out = renderCommandUsage(cmd);

  test("the refused flag is absent from OPTIONS", () => {
    expect(out).not.toContain("--as");
  });

  test("the accepted flags are still listed", () => {
    // Guards the obvious wrong fix: dropping the OPTIONS block altogether, or
    // filtering on something broader than `refused`, would also pass the
    // assertion above.
    expect(out).toContain("--channel");
    expect(out).toContain("--format");
  });

  test("a refused arg does not leave an empty row behind", () => {
    // The original symptom was cosmetic-looking — a flag with a blank
    // description — which is exactly why it survived review.
    for (const line of out.split("\n")) {
      if (line.includes("--")) expect(line.trim()).not.toMatch(/^--\S+\s*$/);
    }
  });
});
