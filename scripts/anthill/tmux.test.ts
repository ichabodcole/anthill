import { describe, expect, it } from "bun:test";
import {
  attachArgs,
  capturePaneArgs,
  hasSessionArgs,
  killSessionArgs,
  listPanesArgs,
  newSessionArgs,
  paneBorderArgs,
  paneBorderFormatArgs,
  paneSeatArgs,
  sanitizeSessionName,
  sendLineArgs,
  splitWindowArgs,
  switchClientArgs,
  tileArgs,
} from "./tmux.ts";

// Pure arg-builders: each asserts the exact tmux argv. These are the unit-test
// target — the async composers just shell `execTmux` out over these arrays.
describe("tmux arg builders", () => {
  it("newSessionArgs builds a detached, printing new-session", () => {
    expect(newSessionArgs("ah-team", "/proj")).toEqual([
      "new-session",
      "-d",
      "-s",
      "ah-team",
      "-c",
      "/proj",
      "-P",
      "-F",
      "#{session_name}",
    ]);
  });

  it("splitWindowArgs splits and prints the new pane id", () => {
    expect(splitWindowArgs("ah-team", "/proj")).toEqual([
      "split-window",
      "-t",
      "ah-team",
      "-c",
      "/proj",
      "-P",
      "-F",
      "#{pane_id}",
    ]);
  });

  it("tileArgs re-tiles the layout", () => {
    expect(tileArgs("ah-team")).toEqual(["select-layout", "-t", "ah-team", "tiled"]);
  });

  it("sendLineArgs types a single shell line then Enter", () => {
    expect(sendLineArgs("%3", 'claude "/anthill:join loom"')).toEqual([
      "send-keys",
      "-t",
      "%3",
      'claude "/anthill:join loom"',
      "Enter",
    ]);
  });

  it("paneSeatArgs stamps the seat into a pane user-option (survives a TUI redraw)", () => {
    expect(paneSeatArgs("%3", "loom")).toEqual(["set-option", "-p", "-t", "%3", "@seat", "loom"]);
  });

  it("paneBorderArgs enables the top pane border", () => {
    expect(paneBorderArgs("ah-team")).toEqual([
      "set-option",
      "-t",
      "ah-team",
      "pane-border-status",
      "top",
    ]);
  });

  it("paneBorderFormatArgs renders each pane's @seat user-option in its border", () => {
    expect(paneBorderFormatArgs("ah-team")).toEqual([
      "set-option",
      "-t",
      "ah-team",
      "pane-border-format",
      " #{@seat} ",
    ]);
  });

  it("killSessionArgs targets the session", () => {
    expect(killSessionArgs("ah-team")).toEqual(["kill-session", "-t", "ah-team"]);
  });

  it("hasSessionArgs targets the session", () => {
    expect(hasSessionArgs("ah-team")).toEqual(["has-session", "-t", "ah-team"]);
  });

  it("capturePaneArgs prints the pane buffer", () => {
    expect(capturePaneArgs("%3")).toEqual(["capture-pane", "-t", "%3", "-p"]);
  });

  it("listPanesArgs lists pane ids in index order", () => {
    expect(listPanesArgs("ah-team")).toEqual(["list-panes", "-t", "ah-team", "-F", "#{pane_id}"]);
  });

  it("attachArgs targets the session", () => {
    expect(attachArgs("ah-team")).toEqual(["attach", "-t", "ah-team"]);
  });

  it("switchClientArgs targets the session", () => {
    expect(switchClientArgs("ah-team")).toEqual(["switch-client", "-t", "ah-team"]);
  });
});

describe("sanitizeSessionName", () => {
  it("keeps alnum, dash, and underscore", () => {
    expect(sanitizeSessionName("ah-team_2")).toBe("ah-team_2");
  });

  it("maps everything else (incl. a whole emoji code point) to a single dash", () => {
    expect(sanitizeSessionName("My Team! 🎉")).toBe("My-Team---");
  });

  it("maps slashes and dots to dashes", () => {
    expect(sanitizeSessionName("a/b.c")).toBe("a-b-c");
  });
});
