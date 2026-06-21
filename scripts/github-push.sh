#!/bin/sh
# Kalunez — push to GitHub (baardonsum71/kalunez)
# Run from project root after creating the repo and setting up auth.

set -e
cd "$(dirname "$0")/.."

REMOTE="https://github.com/baardonsum71/kalunez.git"

echo "→ Remote: $REMOTE"
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE"

echo "→ Branch: main ($(git rev-list --count HEAD) commits)"
echo ""
echo "Before pushing:"
echo "  1. Create repo: https://github.com/new?name=kalunez&owner=baardonsum71"
echo "     (leave empty — do NOT add README/license; we already have commits)"
echo "  2. Auth — pick one:"
echo "     • SSH: add key at https://github.com/settings/keys"
echo "       then: git remote set-url origin git@github.com:baardonsum71/kalunez.git"
echo "     • HTTPS: use Personal Access Token as password"
echo "       https://github.com/settings/tokens (scope: repo)"
echo ""
read -r -p "Press Enter to push to origin main (Ctrl+C to cancel)..."

git push -u origin main

echo ""
echo "✓ Pushed. Next: deploy on Vercel → https://vercel.com/new"
echo "  Import: baardonsum71/kalunez — see docs/DEPLOYMENT.md for env vars."
