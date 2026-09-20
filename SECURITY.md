# Security policy

SourCode is **deliberately vulnerable**. The planted flaws are the product.

## Reporting

Please do **not** report the planted vulnerabilities. They are intentional. The
walkthroughs, answer key and fixes live on the project website
([freefungi.com](https://freefungi.com/challenges/)), never in this repo. Reports
about the intended flaws will be closed as "working as intended".

**Do** report, via a GitHub issue:

- A vulnerability in the *harness* that isn't one of the planted flaws (for
  example, a way the safety boot-check can be bypassed, or a supply-chain issue).
- A flaw that no longer works, or a walkthrough that no longer matches the code.
- Anything that could harm someone running SourCode as intended.

If you believe you have found a **real, unintended secret** committed to this
repository (a genuine credential or private key, not the fabricated seed data),
please report it privately rather than opening a public issue: email the address
on the maintainer's site, [shakelahmed.com](https://shakelahmed.com).

## No real secrets here

This repository is public and ships **no real secrets**. All bundled accounts and
data are fabricated (`@example.com`), and seeded passwords are precomputed hashes.
Commits and pushes are screened by guard hooks (`.githooks/`, enabled by
`npm install`) that block secrets, private keys, `.env` files and databases. See
[CONTRIBUTING.md](CONTRIBUTING.md).

If a real secret ever did land here, the fix is to **rotate the credential first**
(a rewrite cannot un-publish it), then purge it from history.

## Running it safely

- Run on a machine you own, ideally isolated. Never on a production network.
- Never seed or point it at real data. All bundled data is fabricated.
- It binds to localhost by default; overriding that is your responsibility.
