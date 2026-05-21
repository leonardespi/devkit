#!/usr/bin/env bash
# Compiles scrape-badges.lua (Lua 5.5) → LuaJIT, then runs it.
# Run from devkit repo root: ./scripts/scrape.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC="$SCRIPT_DIR/scrape-badges.lua"
OUT="$SCRIPT_DIR/scrape-badges-compiled.lua"

# Locate valua binary: PATH first, then sibling project fallback
if command -v valua &>/dev/null; then
    VALUA="valua"
elif [[ -x "$HOME/git/myProjects/Personal/valua/target/debug/valua" ]]; then
    VALUA="$HOME/git/myProjects/Personal/valua/target/debug/valua"
elif [[ -x "$HOME/git/myProjects/Personal/valua/target/release/valua" ]]; then
    VALUA="$HOME/git/myProjects/Personal/valua/target/release/valua"
else
    echo "error: valua not found. Build it with: cargo build in the valua repo." >&2
    exit 1
fi

echo "valua: $VALUA"
"$VALUA" build --target luajit "$SRC" -o "$OUT"
echo "compiled: $OUT"

cd "$REPO_ROOT"
luajit "$OUT"
