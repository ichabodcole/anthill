#!/bin/sh
# The outside round trip: anthill's OWN emitted declaration, against what its
# parser accepts at every path, read by the agent-cli-conformance kit.
#
# The in-repo census (manifest.census.test.ts) is the commit gate. This is the
# audit it cannot be: a differential between two derivations of define.ts
# agrees when define.ts itself is wrong, and only an outside instrument with
# its own reader sees that. Run it before a release and after any change to
# cli.ts / define.ts / manifest.ts. Needs the kit (`bun add -d` pinned in
# package.json) and ~2 seconds.
#
#   bun run acc:census            # report to the terminal
#   bun run acc:census -- DIR     # keep the artefacts in DIR (default .acc-census)
set -eu
ROOT=$(cd "$(dirname "$0")/.." && pwd)
CLI="$ROOT/plugin/scripts/anthill/cli.ts"
ACC="$ROOT/node_modules/.bin/acc"
OUT=${1:-"$ROOT/.acc-census"}
mkdir -p "$OUT"

# 1. The declaration the binary emits about itself.
bun "$CLI" help --declaration >"$OUT/declaration.json"

# 2. The paths to record: every declared path below the root. The kit probes
#    the root itself, so a root record would give one census line two observers.
#    (Our own gate probes the root too — see manifest.census.test.ts for why.)
bun -e '
  const d = JSON.parse(await Bun.file(process.argv[1]).text());
  console.log(JSON.stringify(d.commands.map((c) => c.path).filter((p) => p.length > 0)));
' "$OUT/declaration.json" >"$OUT/paths.json"

# 3. The harness the kit generates, run from the artefact dir so batch.json lands there.
"$ACC" probe-plan "$CLI" --paths "$OUT/paths.json" --out "$OUT/capture.sh" --force --format json >/dev/null
(cd "$OUT" && ACC_RECORDED_BY="${ACC_RECORDED_BY:-acc-census.sh}" sh ./capture.sh >/dev/null)

# 4. The check: L0 at the root, the recorded surfaces below it, and the diff.
"$ACC" check "$CLI" --config-dir "$ROOT" \
  --recorded-surfaces "$OUT/batch.json" \
  --declaration "$OUT/declaration.json" \
  --format text
