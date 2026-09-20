# Contributing

## This repository is PUBLIC

`bad-adventure/freefungi` is public on purpose: the whole point is that a person
or a scanner can point at the app and find the flaws for themselves. So two kinds
of thing must never land here:

- **Secrets** of any sort: real credentials, API keys, private keys, `.env` files.
- **Answers**: walkthroughs, solutions, an answer key, `FF-0NN` challenge ids, or
  anything that says *where* a flaw is or *how* to solve it.

The walkthroughs and solutions live in a separate **private** repo. Nothing that
reveals a solution belongs in this one.

## The guard hooks

This repo ships pre-commit and pre-push hooks in `.githooks/` that block secrets,
private files and answers automatically. Activate them once after cloning:

```bash
npm install          # runs "prepare", which sets core.hooksPath to .githooks
```

That is it. From then on a commit or push that includes a secret, a private key,
a `.env`, an `internal/` file, a database, or a challenge answer is refused with a
message explaining why. If you ever hit a genuine false positive, review it
carefully and bypass that one action with `--no-verify`.

## Keeping the app honest

- Flaws are written as ordinary-looking code, never labelled. No comments naming a
  bug, its class, or a CWE.
- Tests in `test/` are smoke tests only (the app boots, routes respond). No
  exploits.
- British English, no em dashes.

## Safety

The app is intentionally vulnerable. It binds to localhost and refuses to boot on
a public cloud instance without `FF_I_KNOW_WHAT_IM_DOING=1`, and it seeds only
fabricated data (`@example.com`). Never weaken these, never seed real data, and
never add a payload that does harm beyond demonstrating the flaw.
