import { describe, expect, test } from "bun:test";
import { summarizeBoard } from "./team-support.ts";

describe("summarizeBoard", () => {
  test("tallies columns and surfaces the board title", () => {
    const summary = summarizeBoard({
      state: {
        title: "anthill · Slice 1",
        tasks: [
          { status: "todo" },
          { status: "todo" },
          { status: "doing" },
          { status: "review" },
          { status: "done" },
          { status: "done" },
          { status: "done" },
        ],
      },
    });
    expect(summary).toEqual({
      counts: { todo: 2, doing: 1, review: 1, done: 3 },
      title: "anthill · Slice 1",
    });
  });

  test("ignores unknown statuses (no extra columns)", () => {
    const summary = summarizeBoard({
      state: { title: "t", tasks: [{ status: "archived" }, { status: undefined }, {}] },
    });
    expect(summary?.counts).toEqual({ todo: 0, doing: 0, review: 0, done: 0 });
  });

  test("title is undefined when the board has none", () => {
    const summary = summarizeBoard({ state: { tasks: [{ status: "todo" }] } });
    expect(summary?.title).toBeUndefined();
    expect(summary?.counts.todo).toBe(1);
  });

  test("returns null when there is no task list (board unreadable)", () => {
    expect(summarizeBoard(null)).toBeNull();
    expect(summarizeBoard({})).toBeNull();
    expect(summarizeBoard({ state: {} })).toBeNull();
  });
});
