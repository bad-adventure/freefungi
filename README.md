<div align="center">

# 🍬 SourCode

**A deliberately vulnerable sweet shop for practising web application security.**

_A FreeFungi vulnerable app._

[![CI](https://github.com/bad-adventure/freefungi/actions/workflows/ci.yml/badge.svg)](https://github.com/bad-adventure/freefungi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-informational.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A520-43853d.svg?logo=node.js&logoColor=white)](package.json)
[![Container](https://img.shields.io/badge/ghcr.io-freefungi-2496ed.svg?logo=docker&logoColor=white)](https://github.com/bad-adventure/freefungi/pkgs/container/freefungi)
[![Walkthroughs](https://img.shields.io/badge/walkthroughs-freefungi.com-c0324b.svg)](https://freefungi.com/challenges/)
[![Intentionally vulnerable](https://img.shields.io/badge/⚠-intentionally%20vulnerable-red.svg)](SECURITY.md)

</div>

> [!WARNING]
> **SourCode is insecure on purpose.** Run it on your own machine only. Never deploy it
> on a network you care about, beside real data, or against anything you are not
> authorised to test.

It looks and behaves like a small e-commerce app: browse the counter, search, log in,
fill a bag, check out, and (if you are staff) open the back office. Somewhere in here are
real flaws, from classic injection to broken access control. Your job is to find them.

## ✅ Prerequisites

- **[Docker](https://docs.docker.com/get-docker/)** for the one-command run below, **or**
  **[Node 20+](https://nodejs.org/)** to run [from source](#from-source). One or the other.
- A free port `3000` (map another with `-p`).

Nothing else. It is self-contained: no database, services or config to set up, and it
runs the same on macOS, Linux and Windows.

## 🚀 Get started

```bash
docker run -d --name SourCode -p 3000:3000 ghcr.io/bad-adventure/freefungi
docker logs SourCode
```

Open **http://localhost:3000**. `docker logs SourCode` prints a welcome with the
URL and the grey-box test logins. (Run it in the foreground, without `-d`, to see
that live. No Docker? See [From source](#from-source).)

**To update** to the newest build, force a fresh registry check (`docker run`
reuses a cached image otherwise):

```bash
docker rm -f SourCode
docker run -d --pull always --name SourCode -p 3000:3000 ghcr.io/bad-adventure/freefungi
```

Or with **Docker Compose**, which adds a healthcheck, resource caps and clean
shutdown out of the box:

```bash
docker compose up          # from a clone; add --build to build locally
```

The container runs as a non-root user, ships a `/healthz` liveness probe, and
stops instantly on a signal. The compose file caps it at 256 MB / 1 CPU so a
runaway request can never eat your host.

## 🎯 Two ways to play

- **Hunt it yourself.** Point your tools at `http://localhost:3000` and find the flaws
  with no hints. By hand, through a proxy, or with a scanner, whatever you prefer.
- **Learn how it works.** Each exercise has a step-by-step walkthrough on the website:
  **[freefungi.com/challenges](https://freefungi.com/challenges/)**.

There are **no answers in this repo** on purpose, so a tool has to find things rather
than read a cheat sheet in the source.

## 🔑 Test accounts (grey-box)

Two regular customer accounts you can log in with straight away, handy for grey-box
testing and for probing what one account can do to another's data:

| Email | Password | Role |
| --- | --- | --- |
| `alice@example.com` | `Password123!` | customer |
| `bob@example.com` | `Hunter2day!` | customer |

Need more? **Register your own** at `/register` (as many as you like). There is also an
administrator account and other customers in the database, but those passwords are not
listed here. Finding them is part of the fun.

## 🧪 Testing it

SourCode is a plain, self-contained HTTP app with a real login, so every kind of testing
works on the same target: by hand, through a proxy, with a scanner, or white-box by
reading the source. More detail: **[freefungi.com/docs](https://freefungi.com/docs/)**.

<a name="from-source"></a>
## 🛠️ From source

```bash
git clone https://github.com/bad-adventure/freefungi
cd freefungi
npm install
npm start        # http://localhost:3000
npm test         # smoke tests (boots, routes respond)
```

Requires Node 20+. The shop reseeds a fresh SQLite database on every boot. All accounts
and data are fabricated (`@example.com`).

## 📁 Layout

| Path | What's there |
| --- | --- |
| `src/routes/` | shop, auth, account, cart (one file per feature) |
| `src/lib/` | config, sessions, cart, the safety boot-check |
| `src/db/` | schema and the fabricated seed data |
| `src/views/` | the shopfront, login, account, admin, bag, order |

## 🔒 Safety

Binds to `127.0.0.1` by default and refuses to start on what looks like a public cloud
instance without `FF_I_KNOW_WHAT_IM_DOING=1`. These are seatbelts, not permission.
See **[SECURITY.md](SECURITY.md)**.

---

<div align="center">

SourCode, a FreeFungi project · Built by [Shakel Ahmed](https://shakelahmed.com) · MIT licensed
· [freefungi.com](https://freefungi.com)

</div>
