#!/bin/sh
# Shared denylists for the SourCode public-repo guard hooks.
#
# THIS REPOSITORY IS PUBLIC (github.com/bad-adventure/freefungi).
# These patterns block secrets and challenge answers from ever being committed
# or pushed. Sourced by pre-commit and pre-push.

# Paths/filenames that must never be committed here (extended regex, matched
# against repo-relative paths). Private files belong in ../internal/; answers
# belong in the private site repo.
DENY_PATHS='(^|/)\.env($|\.|/)|(^|/)CLAUDE\.md$|(^|/)internal/|(^|/)id_(rsa|dsa|ecdsa|ed25519)($|\.|$)|\.(pem|key|p12|pfx|jks|keystore)$|\.(db|sqlite|sqlite3)$|(^|/)ground-truth|walkthrough|(^|/)solve.*\.(test|spec)\.|(^|/)answers?/'

# Content that must never appear in an added line (extended regex).
# FF-0NN is a challenge id and must never be named in the app source.
DENY_CONTENT='-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|FF-0[0-9]{2}'

# scan_paths <newline-separated paths> -> prints offending paths, if any.
# -e guards against a pattern that begins with a dash being read as an option.
scan_paths() {
  printf '%s\n' "$1" | grep -Ei -e "$DENY_PATHS" 2>/dev/null || true
}

# scan_added_content <git diff output> -> prints offending added lines, if any
scan_added_content() {
  printf '%s\n' "$1" | grep -E -e '^\+' | grep -Ev -e '^\+\+\+' | grep -E -e "$DENY_CONTENT" 2>/dev/null || true
}

block() {
  echo ""
  echo "  ✗ BLOCKED by the SourCode public-repo guard ($1)."
  echo ""
  echo "    This repo is PUBLIC. The following looks like a secret, a private"
  echo "    file, or a challenge answer, which must not go in the app repo:"
  echo ""
  printf '%s\n' "$2" | sed 's/^/      /'
  echo ""
  echo "    Private files belong in ../internal/. Answers belong in the private"
  echo "    site repo (site/answers, site/src/pages/challenges)."
  echo ""
  echo "    If this is a genuine false positive, review it carefully and bypass"
  echo "    with:  git $3 --no-verify"
  echo ""
}
