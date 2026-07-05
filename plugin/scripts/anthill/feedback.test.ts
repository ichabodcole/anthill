import { describe, expect, it } from "bun:test";
import {
  buildIssueUrl,
  composeFeedbackBody,
  type FeedbackBodyParams,
  feedbackTitle,
  interpretGhResult,
} from "./feedback.ts";

// ---- feedbackTitle ---------------------------------------------------------

describe("feedbackTitle", () => {
  it("prefixes with the category and uses the first message line", () => {
    expect(feedbackTitle("friction", "scan misreads pnpm globs")).toBe(
      "[feedback/friction]  scan misreads pnpm globs",
    );
  });

  it("collapses whitespace and takes only the first non-blank line", () => {
    expect(feedbackTitle("bug", "  first   line \n\n second line ignored")).toBe(
      "[feedback/bug]  first line",
    );
  });

  it("keeps the prefix intact and ellipsizes an over-long summary at ≤72c", () => {
    const long = "x".repeat(200);
    const title = feedbackTitle("idea", long);
    expect(title.length).toBeLessThanOrEqual(72);
    expect(title.startsWith("[feedback/idea]  ")).toBe(true);
    expect(title.endsWith("…")).toBe(true);
  });
});

// ---- composeFeedbackBody ---------------------------------------------------

const ENV: Omit<FeedbackBodyParams, "message" | "category" | "skill"> = {
  version: "1.2.0",
  platform: "darwin",
  osRelease: "25.5.0",
  bunVersion: "1.1.30",
};

describe("composeFeedbackBody", () => {
  it("carries the message plus the non-sensitive env footer", () => {
    const body = composeFeedbackBody({
      message: "the docs token misled me",
      category: "docs",
      skill: "bootstrap",
      ...ENV,
    });
    expect(body).toContain("the docs token misled me");
    expect(body).toContain("**Category:** docs");
    expect(body).toContain("**Skill:** bootstrap");
    expect(body).toContain("**anthill:** 1.2.0");
    expect(body).toContain("**Platform:** darwin 25.5.0");
    expect(body).toContain("**Bun:** 1.1.30");
  });

  it("omits the Skill line when no skill is given", () => {
    const body = composeFeedbackBody({ message: "x", category: "friction", ...ENV });
    expect(body).not.toContain("**Skill:**");
  });

  it("PRIVACY: never leaks a repo name, path, or cwd", () => {
    const body = composeFeedbackBody({
      message: "something broke",
      category: "bug",
      skill: "convene",
      ...ENV,
    });
    expect(body).not.toContain("/Users/");
    expect(body).not.toContain(process.cwd());
    // Only the message + the fixed env footer keys — no ambient repo identity.
    expect(body).not.toMatch(/\bichabodcole\b/);
  });
});

// ---- buildIssueUrl ---------------------------------------------------------

describe("buildIssueUrl", () => {
  it("builds a prefilled new-issue URL with encoded title, body, and label", () => {
    const url = buildIssueUrl(
      "ichabodcole/anthill",
      "[feedback/idea]  add a thing",
      "hello world & more",
      "anthill-feedback",
    );
    expect(url.startsWith("https://github.com/ichabodcole/anthill/issues/new?")).toBe(true);
    expect(url).toContain(`title=${encodeURIComponent("[feedback/idea]  add a thing")}`);
    expect(url).toContain(`body=${encodeURIComponent("hello world & more")}`);
    expect(url).toContain("labels=anthill-feedback");
    // Reserved chars are percent-escaped, not left raw.
    expect(url).not.toContain("hello world & more");
  });
});

// ---- interpretGhResult -----------------------------------------------------

describe("interpretGhResult", () => {
  it("parses the created issue URL on success (exit 0)", () => {
    const out = interpretGhResult({
      status: 0,
      stdout: "https://github.com/ichabodcole/anthill/issues/42\n",
      stderr: "",
    });
    expect(out.issueUrl).toBe("https://github.com/ichabodcole/anthill/issues/42");
    expect(out.warnings).toEqual([]);
  });

  it("fails to null + warning on a non-zero status (gh error)", () => {
    const out = interpretGhResult({ status: 1, stdout: "", stderr: "not authenticated" });
    expect(out.issueUrl).toBeNull();
    expect(out.warnings.length).toBe(1);
    expect(out.warnings[0]).toMatch(/nothing was lost/);
  });

  it("fails to null + warning when the binary is missing (status null)", () => {
    const out = interpretGhResult({ status: null, stdout: "", stderr: "" });
    expect(out.issueUrl).toBeNull();
    expect(out.warnings.length).toBe(1);
  });

  it("treats an exit-0 with no URL in stdout as a soft failure", () => {
    const out = interpretGhResult({ status: 0, stdout: "created something\n", stderr: "" });
    expect(out.issueUrl).toBeNull();
    expect(out.warnings.length).toBe(1);
  });
});
