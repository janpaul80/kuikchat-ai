#!/usr/bin/env bash
# KuikChat rule: NO LONG DASHES anywhere we author text. Fails the build if found.
set -euo pipefail
PATTERN='[\xE2\x80\x94\xE2\x80\x93]'
inc=(--include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.html" --include="*.md" --include="*.mdx" --include="*.css" --include="*.json")
HITS=$(grep -rInP "${inc[@]}" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude-dir=dist '[\x{2014}\x{2013}]' . || true)
if [ -n "$HITS" ]; then
  echo "FAILED: long dashes found. KuikChat copy must use a comma, period, or plain hyphen."
  echo "$HITS"
  exit 1
fi
echo "OK: no long dashes in source."
