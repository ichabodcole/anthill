# Backlog

This directory contains **backlog items** — small, self-contained work items that don't warrant a full project folder. Bugs, minor refactors, papercuts, and clear tasks that can be described and completed without a proposal.

## Purpose

The backlog provides a lightweight path for tracking work that would otherwise go undocumented or be forced through the full proposal/plan pipeline. It bridges the gap between "too small for a project" and "do it without any documentation."

### Why Use Backlog Items?

- **Low ceremony** - Create a short file, describe the task, do the work
- **Discoverable** - Small tasks are tracked rather than forgotten or scattered across commit messages
- **Archivable** - Completed items move to `_archive/` for history without cluttering the active list
- **Clear threshold** - See _Backlog, plan-only project, or full project?_ below. The short version: a backlog item is work you can do without a **plan**.

## When to Create a Backlog Item

- **Known bug** with a clear fix
- **Minor refactor** - rename, restructure, clean up
- **Small feature** - add a field, update a label, tweak behavior
- **Papercut** - something annoying that just needs fixing
- **Chore** - dependency update, config change, tooling tweak

## When NOT to Create a Backlog Item

- **Needs a proposal** - If the work requires design decisions or option exploration, create a project
- **Will span multiple sessions** - If it's complex enough to need a plan, it's a project
- **Still investigating** - If you're unsure what to do, create an investigation first
- **Incomplete thought** - If it's just an observation or hunch, use a fragment

**Rule of thumb:** If you can describe the work in a few sentences and someone could complete it without further discussion, it's a backlog item. If it needs design, exploration, or scoping, it's a project.

## Backlog, plan-only project, or full project?

**The discriminator is not "does it need a proposal" — it's these two questions, in order:**

1. **Are there decisions to make, or only work to do?** Options to weigh, a design to settle, a
   trade-off someone could reasonably argue → **full project** (`proposal.md` + `plan.md`).
2. **If it's only work: does it need sequencing?** Multiple surfaces, an order that matters, or more
   than one session → **plan-only project** (`plan.md` + `sessions/`, no proposal, sourcing its
   backlog items by link). Otherwise → **stay a backlog item and work it in place.**

| shape                             | what it contains                                                      |
| --------------------------------- | --------------------------------------------------------------------- |
| **Backlog item, worked in place** | the item **is** the proposal, plan and record — stamp status, archive |
| **Plan-only project**             | `plan.md` + `sessions/`; backlog items are cited sources              |
| **Full project**                  | `proposal.md` + `plan.md` + `sessions/`                               |

**A backlog item graduates by growing a PLAN, not a proposal.** That is the answer to _"I want to
write a dev plan for this backlog item — where does it go?"_ It goes in a plan-only project folder,
and the backlog item stays a backlog item: cited as a source, archived when it lands.

**Batching is fine, and there is a rule for it:** group items only when they share **the same file,
the same owner, and the same test surface**. Items grouped that way ship together from one backlog
item without a project. Items grouped only by _when they were noticed_ are a holding pen, not a work
unit — split them before starting, or the "batch" is really several branches wearing one filename.

**Discovering mid-work that you guessed wrong is the system working, not a misfile.** A backlog item
that turns out to contain a real design question becomes an investigation or a project at that
moment. Promote it then; don't try to price it correctly up front.

## File Naming

- `YYYY-MM-DD-short-description.md`
- Examples:
  - `2026-02-09-fix-date-formatting.md`
  - `2026-02-10-rename-sync-endpoint.md`
  - `2026-02-15-add-missing-error-state.md`

## Template

A ready-to-use template is available: **[TEMPLATE.md](./TEMPLATE.md)**

Copy this template to create a new backlog item, replacing the filename with the date and a short description.

## Lifecycle

1. **Create** - Describe the task in a new file
2. **Work** - Pick it up and complete it — _in place_, for the common case. Stamp the outcome in the
   item itself (`**Status:** ✅ SHIPPED <date> (<sha>)`), including anything found while fixing it.
3. **Or promote** - If it grew a plan, move the plan into a project folder and cite this item as a
   source. The item still archives on its own when its part lands.
4. **Archive** - Move the completed file to `backlog/_archive/`

Active backlog items reflect current work that needs doing. Completed items are archived to keep the active list focused.

## Tips

- **Keep it brief** - A backlog item should be quick to write and quick to read
- **Include references** - If you know the relevant files, include them. It saves discovery time later.
- **Don't overthink acceptance criteria** - Include them if the "done" state isn't obvious. Skip them for clear tasks.
- **Remove when done** - Move to `_archive/`, don't leave completed items in the active backlog
