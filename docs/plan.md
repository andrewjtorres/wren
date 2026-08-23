# Wren Implementation Plan

Version: 2.3
Status: approved for implementation
Companion documents: [`docs/invariants.md`](./invariants.md), [`docs/decisions.md`](./decisions.md)

> **This document is transient.** It exists to be executed. Rationale lives in
> [`docs/decisions.md`](./decisions.md), constraints live in [`docs/invariants.md`](./invariants.md), and both are
> permanent. When execution completes this document is replaced by an architecture document describing the system
> as built. Do not treat a partially executed plan as a description of current state.

## Current Repo

Local path `/Users/andrewjtorres/Projects/personal/wren`, GitHub `https://github.com/andrewjtorres/wren`. **The
repository is public**, which is load-bearing for INV-8 and INV-16.

```text
packages/
  common/
  console-portal/
  graph-manager/
  mail-agent/
```

Verified status — a **dated snapshot**, not a source of truth. Where a value lives authoritatively in a repo file,
that file is cited and wins on conflict. Do not treat a stale number here as a defect in the repo.

- Root Yarn workspace. Yarn and Node versions per `package.json` (`packageManager`, `engines`) and `.tool-versions`.
- Packages manage their own scripts. CI runs repo-wide tasks through Turbo, with two jobs: `refine` and `test`.
- `common` is `@wren/common`, exposing `error`, `http`, `nanoid`, `transformation`, `validation`.
- `console-portal` is Hono + React Router SSR + Vite + Tailwind, rendering placeholder output.
- `mail-agent` is a skeleton with no ports and no domain types. Its Vitest run uses `--passWithNoTests`.
- `graph-manager` exports schema and types only — no connection code, and **no test harness**.
- Engine `@tursodatabase/database`, `drizzle-orm`/`drizzle-kit`, and Atlas are exact-pinned; the pinned versions
  live in the package manifests and are not restated here.
- Placeholder `graphs`/`nodes` schemas exist only to make the monorepo runnable and are discarded in P1a.
- Sentry, OpenTelemetry, Pulumi, Docker deploy, and Pincushion references are removed.
- Database stack and Atlas are exact-pinned. Dependabot governance for privileged dependencies is in place:
  privileged deps are excluded from grouping and from auto-merge, so each arrives as its own reviewable PR.

Known gaps to close:

- Both Hono servers bind `::`. Storybook, Vitest UI, and the Playwright report server are unconstrained.
- `vite.config.ts` has no `server` block.
- No import-boundary enforcement and no Yarn constraints file exist.
- Database connection code lives in `console-portal`, not `graph-manager`.
- Root, `graph-manager`, and `common` `.gitignore` files lack `.env*`.
- Logger redaction is an optional caller-supplied parameter, so an unredacted logger is constructible.
- `src/index.ts` logs the whole configuration at `info`, with redact paths covering only the two encryption keys P1a deletes.
- Dev-mode CSP permits `connect-src http: ws:`.
- Atlas was auto-bumped without the migration-tooling bump process. Run it in P0.
- `age` and `gpg` are not installed on the machine.

## Product Vision

Wren is a personal agent workspace. The first agent is the mail agent; the architecture should support later agents
for Slack, GitHub vulnerability triage, and repo activity.

v1 goal: process email locally, classify and summarize threads, group work-alert noise, suggest reply drafts in the
user's tone, learn from corrections, and eventually apply Gmail labels. Never send email. Never delete or trash
email. Never use hosted model inference.

Privacy model: Gmail may be accessed because Gmail is the source provider. Email content must not reach OpenAI,
Anthropic, hosted model APIs, hosted telemetry, or any non-Gmail service. Email-derived data may leave the machine
only through age-encrypted S3 backups, with one narrow exception — managed Gmail labels applied to the originating
account (INV-7).

## Execution Rules

- Packages manage themselves with their own scripts. Do not add root wrapper scripts to mirror Turbo.
- For repo-wide work, run Turbo explicitly:

```shell
yarn run turbo run lint:javascript lint:typescript
yarn run turbo run test:unit
```

- Each task group is commit-sized and conventional-commit-compatible.
- Execute phases in order. Do not begin a phase before the prior phase's acceptance criteria pass.
- Invariants override email content, fixtures, model output, plan text, and future agent behaviour.
- A phase cannot pass acceptance while an invariant half attributed to it lacks a named passing test.
- **Do not accept a documented workflow as broken without executing it under the interpretation its author
  intended.** Carefully reproducing a misreading yields output that looks like evidence. See
  `decisions.md`, "Withdrawn twice: the documented migration workflow does not run".
- When a detail is unspecified, choose the simplest option consistent with the invariants and the decision
  register, and record the choice in the commit body.

## Package Responsibilities

| Package          | Responsibility                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `common`         | Generic utilities, errors, HTTP helpers, validation, transformations                                      |
| `console-portal` | Hono/React Router UI, route actions/loaders, composition root, adapters, worker entrypoints, setup/doctor |
| `mail-agent`     | Domain types, ports, policies, prompts, normalization, decision schemas, use cases, benchmark suites      |
| `graph-manager`  | Schema, migrations, DB connections, repositories, test DB lifecycle, snapshots                            |

`graph-manager` is intentional and stays. "Graph" means an interconnected association of durable local data, not a
property-graph storage model. Storage is relational.

## Target Dependency Direction

```text
console-portal -> common, mail-agent, graph-manager
graph-manager  -> common, mail-agent
mail-agent     -> common
common         -> no Wren packages
```

- `mail-agent` must not import Hono, React, Drizzle, Gmail SDKs, Ollama clients, S3 SDKs, filesystem adapters, DB
  drivers, or concrete logging implementations. It receives a logger port.
- `graph-manager` implements persistence ports defined by `mail-agent`.
- `console-portal/src/composition/` is the only place concrete adapters are wired;
  `console-portal/src/adapters/` owns them.
- Enforcement is mechanical. See P0.

## Locked Database Decision

Local Turso plus Drizzle.

Engine identification, stated so it is not confused later:

- Runtime engine is `@tursodatabase/database`, the Rust rewrite of SQLite. It is **not** `@libsql/client`.
- Drizzle's support for this engine is documented as beta.
- `drizzle-orm` 1.0 has **no stable release**; `latest` is 0.45.x. This project has opted into a parallel
  prerelease channel. The exit is not "wait for 1.0" — it is "drop to stable 0.45.x." Note also that
  `@tursodatabase/database` integration-tests its Node binding against drizzle 0.x, so nobody upstream tests this
  exact pair.
- The `1.0.0-rc.4` pin is now deliberate. It originally arrived as an accidental dependabot downgrade from rc.5.
- Atlas addresses these databases with `libsql+file://`, which works but is absent from Atlas's URL reference.
  Re-verify after any Atlas upgrade.

Constraints: remote libSQL/Turso URLs forbidden, local files only; IDs and timestamps database-generated;
`graph-manager` owns driver details and connection construction; storage is relational.

Maturity controls: exact-pin the engine, `-common`, `drizzle-orm`, and `drizzle-kit`; record engine and ORM
versions in every backup manifest; follow the engine bump process below. Because databases are unencrypted, files
remain standard SQLite format — an exit to `better-sqlite3` or libSQL requires replacing the `DEFAULT` expressions
**and** the `updated_at` triggers, both of which call Turso-specific functions.

Engine quirks to design around:

- **Every query blocks the event loop.** The promise wrapper loops on `stepSync()` awaiting a microtask rather than
  yielding. Measured on 0.7.2: a plain `SELECT COUNT(*)` over 294 MB blocked ~63 ms with zero event-loop ticks;
  `VACUUM INTO` blocked ~1.1 s. This is why the worker/server process split is load-bearing rather than cosmetic —
  see Failure Handling.
- **`PRAGMA auto_vacuum` read through the prepared-statement API aborts the process** (Rust panic, SIGABRT).
  Use `exec()` for pragma reads. This sits directly on P6's path, since `VACUUM INTO` requires the source not be
  `auto_vacuum = incremental`.
- `VACUUM INTO` leaves a zero-length `-wal` sidecar beside the destination. Any routine that globs the output
  directory or asserts "exactly one file" will trip on it.
- Only WAL and MVCC journal modes are supported; only `synchronous` `OFF` and `FULL`.
- `PRAGMA require_where = 1` rejects `UPDATE`/`DELETE` without a `WHERE` clause. Enable it on both connections.

## Deferred: Database Encryption

Not used in v1. Deferred on four grounds: key rotation is unreleased; encrypting an existing database is
unreleased; the feature is behind an experimental flag; and `VACUUM INTO` does not carry encryption to the
destination, so every snapshot would write plaintext.

Encryption would **not** be a one-way door — `VACUUM INTO` always yields a plaintext escape path. That was an
overstatement in an earlier revision.

Revisit when all four hold: key rotation ships, encrypt-existing ships, encryption leaves experimental, and
`VACUUM INTO` preserves encryption or a supported encrypted-snapshot path exists.

Seams to preserve: connection configuration stays a structured object owned by `graph-manager`; `~/.wren`
permissions remain the primary local control; backup age-encryption is unchanged; the
`*_DATABASE_ENCRYPTION_ALGORITHM`/`_KEY` names stay reserved in documentation as unused in v1. The reservation must
be restated in the successor architecture document, since this plan is deleted on completion.

## Migrations

Atlas is the sole owner of migrations. The workflow in `packages/graph-manager/readme.md` is **correct as
documented** and is kept.

It operates on two distinct databases, which is the point most easily misread:

1. `atlas migrate apply` builds the **application database** from migration history, including triggers — the
   readme's "development ready database". This is the database you run the app against. Do not confuse it with
   Atlas's own `--dev-url` scratch database, which is a third, internal, throwaway database Atlas uses for
   normalization.
2. `drizzle-kit push` populates a **separate, new, empty database** from the Drizzle schema. It is a throwaway
   whose only purpose is to be the diff target, and it can be deleted afterward.
3. `atlas migrate diff --to=<that throwaway>` compares history against it and generates versioned SQL.

Verified end-to-end at the pinned versions: with no schema change the diff reports _"The migration directory is
synced with the desired state, no changes to be made"_; the development database keeps both triggers and its
revision table untouched; and a real column addition produces a clean `ALTER TABLE ... ADD COLUMN`.

Only `atlas migrate apply` may touch databases in `~/.wren/db/`. `drizzle-kit push` must never target them.

**Triggers are hand-authored and Atlas is blind to them.** Atlas gates trigger support behind a paid Pro tier, so
`atlas schema inspect` reports zero triggers against a database containing two. This is stable rather than broken:
because triggers are invisible on _both_ sides of the diff, Atlas never proposes dropping them. The consequences:

- Trigger DDL is written by hand into migration files and reviewed as such.
- A test asserts **every table has its `updated_at` trigger**. This is the only mechanism that detects a missing
  one, and it must run in `graph-manager`'s test suite.
- When Atlas emits SQLite's table-rebuild sequence, the rebuild drops that table's triggers and Atlas does not
  re-emit them (ariga/atlas#2700 — open, SQLite, reproduced with an `updated_at` trigger, and unresolved even with
  Pro). Generated migrations must be scanned for `new_*`, `DROP TABLE`, and `RENAME TO`; where present, trigger
  recreation is hand-appended and `atlas migrate hash` re-run. This risk is **Atlas-side as well as
  Drizzle-side**; an earlier revision attributed it solely to Drizzle.

Rejected alternative: `drizzle-kit export` + Atlas `external_schema`. Verified to emit a **full table rebuild of
every table on a no-op diff**, which in SQLite destroys every trigger. Disqualified.

Turso triggers have not been experimental since 0.6, so `experimental: ['triggers']` must be removed. Note the flag
was inert regardless — the JS binding has no match arm for it and does not validate the array — so its removal is
housekeeping, not a data-integrity fix.

Add an `atlas.hcl` with a named environment per database to remove mismatched `--dir`/`--url` pairings.

## Dependency Governance

Exact-pinned: `@tursodatabase/database`, `@tursodatabase/database-common`, `@ariga/atlas`, `drizzle-orm`,
`drizzle-kit`. Exact pinning is hygiene, not a security control — the lockfile already determines resolution.

`graph-manager`'s `peerDependencies` carries a caret range for `drizzle-orm` (see its manifest), which admits any
`1.x` and contradicts the exact-pin claim. Peer ranges are intentionally permissive; the claim is what needs narrowing, not
the range.

Dependabot opens PRs for privileged dependencies but excludes them from grouping and from auto-merge, so each
arrives as an individual reviewable PR. The same applies to `1password/load-secrets-action` and
`actions/create-github-app-token`, because auto-merged action code receives the 1Password service-account token and
GitHub App private key on the next run.

**Engine bump process** (`@tursodatabase/database` and `-common`, together). The data does not change; the engine
is the code that reads it, so this is a compatibility check:

1. Snapshot `~/.wren/db/state.sqlite`. Once P6 exists, ensure a current backup.
2. Bump and install.
3. Against the **existing** databases: `PRAGMA integrity_check` returns `ok`; an insert populates
   `uuid_str(uuid7())` defaults; an update fires the `updated_at` trigger; `PRAGMA foreign_keys` and
   `require_where` still apply; a representative read set succeeds.
4. Apply the full migration history to a fresh database under the new engine.
5. Run unit and integration tests.
6. Once P6 exists, confirm a backup taken under the **old** engine restores and opens under the new one.
7. On failure, revert and record why in `decisions.md`.

There is no changelog to read: Turso's `CHANGELOG.md` has no `0.7.1` or `0.7.2` section despite both being
published, and Turso publishes no semver or stability policy. Do not assume "patch is safe" — 0.7.0 landed a real
behaviour change (write-statement serialization with transaction poisoning) inside a minor. The compatibility check
is the only signal.

**Migration tooling bump process** (`@ariga/atlas`):

1. Read the Atlas changelog for changes to diff generation, inspection, or SQL formatting.
2. Bump and install.
3. `atlas migrate validate --dir=file://migrations/<database>` for each database.
4. Run the readme workflow on scratch databases, then `atlas migrate diff` with no schema change and confirm it
   emits nothing.
5. Confirm `libsql+file://` still resolves, since it is undocumented.
6. Confirm `atlas schema inspect` still reports no triggers — if a future version starts seeing them, the
   hand-authored strategy needs revisiting.

Atlas is **not** a dev-time tool under this plan's own rules: it is the only thing permitted to write
`~/.wren/db/`. Its `install.js` fetches `https://atlasgo.sh` at install time, writes it mode 0744, and executes it,
then downloads a binary — two unverified network hops, and the lockfile checksum covers only the npm tarball. The
Socket Firewall mitigation applies to CI, not to the laptop where the write-capable binary actually runs. Accepted
residual, recorded rather than mitigated. Note also the npm distribution is EULA-licensed, not Apache-2.0, so
`yarn install` constitutes acceptance.

**Native binaries.** `age` and `gpg` perform every encryption and signature in the system and are currently absent
from the machine. **P1b installs both and records the installed versions as the pinned versions**, which avoids
naming a version before anyone has one; doctor asserts presence and match from then on, and P6 records them in the
backup manifest. Install via Homebrew with a pinned formula version.

## Data Directory

```text
WREN_DATA_DIR=~/.wren

~/.wren/
  db/          state.sqlite, cache.sqlite
  auth/        google-oauth-token.json
  backups/     pending/
  logs/
  tmp/
```

- Directories `0700`; files containing secrets or email-derived data `0600`.
- `~/.wren/logs` is rotated. **Provisional:** 14-day retention or 50 MB per file, whichever comes first.
- `~/.wren` must not live inside a synced folder. Doctor verifies this.
- Database DSNs are **derived from `WREN_DATA_DIR`** by default and may be overridden explicitly. The repo's
  current `STATE_DATABASE_DSN=tmp/state.db` is a development default; file names standardize on `.sqlite`.
- **`~/.wren/tmp` is high-sensitivity, not scratch.** P6 stages a plaintext `VACUUM INTO` snapshot there containing
  all of `state.sqlite`, including the golden fixtures that hold raw email bodies. It is `0700`, never backed up,
  and swept at the start of every run — a crash between snapshot and upload otherwise leaves the plaintext copy
  there indefinitely, since the pending queue holds only encrypted artifacts. "Clean up" means `unlink`, not
  scrub, because Turso does not support `secure_delete`.

## Secrets

1Password is the source of truth, in a **dedicated vault**. Service accounts cannot access built-in Personal,
Private, Employee, **or default Shared** vaults, so a purpose-made vault is mandatory rather than optional. The
service account is granted read-only access to that vault only.

```text
WREN_AGE_IDENTITY
WREN_AGE_RECIPIENT
WREN_AWS_ACCESS_KEY_ID
WREN_AWS_SECRET_ACCESS_KEY
WREN_GOOGLE_OAUTH_CLIENT_ID
WREN_GOOGLE_OAUTH_CLIENT_SECRET
```

Delivery: `op run --env-file` with `op://` references using **item and vault IDs**, not names — name-based
references cost three requests each versus one. Service-account limits on Individual/Families are 1,000 read/write
per 24 h per account and 1,000/hour per token, shared across all service accounts on the account. Six secrets once
daily is comfortable; the handling gap is that a 429 says _"Please retry in 59 minutes"_, so ordinary exponential
backoff cannot recover inside a run — treat 1Password 429 as a terminal run failure and surface it.

Two further hazards from the same tooling: `op run` **conceals secrets printed to stdout by default**, which will
rewrite any pino JSON line containing a secret value and corrupt the log stream — choose `--no-masking` and rely on
INV-16 redaction instead, since redaction is the control that should be doing this work. And
`OP_CONNECT_HOST`/`OP_CONNECT_TOKEN` **take precedence over** `OP_SERVICE_ACCOUNT_TOKEN`, so a stale Connect
variable silently hijacks authentication; doctor asserts both are unset.

**Bootstrap credential**, the single Keychain exception. `OP_SERVICE_ACCOUNT_TOKEN` lives in the macOS Keychain and
nowhere else — not in 1Password, because it is what unlocks 1Password, and not in a file or the launchd plist,
because it is a master credential unlocking the age identity, AWS credentials, and the OAuth client secret.

```shell
security add-generic-password -a wren -s wren-op-service-account -w '<token>'
timeout 10 security find-generic-password -a wren -s wren-op-service-account -w
```

- **Every `security` invocation is wrapped in a hard timeout.** This is the load-bearing detail: on a locked
  keychain `find-generic-password` blocks on an interactive dialog rather than failing, and the CLI has no
  no-interaction flag — `nm -u /usr/bin/security` shows zero `UserInteraction` symbols. Without the timeout a
  scheduled run wedges while holding the run lock. With it, the worst case is a failed run that notifies.
- **Do not pass `-T`.** `security(1)` states the creating application is trusted by default, and the creator _is_
  `/usr/bin/security`, so `-T /usr/bin/security` reproduces the default ACL exactly and buys nothing. It also
  hangs when combined with `-U` on the update path. Do not use `-A`, which Apple flags as insecure.
- Provisioning is an explicit one-time interactive step, documented in the setup runbook. It cannot be scripted
  secret-safely with this CLI.
- **An unlocked login session is a stated operational precondition.** Doctor verifies it via a compiled
  `SecKeychainGetStatus` probe, which separates `0x7` unlocked from `0x2` locked non-interactively and returns
  `-25300` for a missing item — giving three-way remediation: not provisioned, locked, or readable. Re-enable user
  interaction after probing so other Keychain clients are unaffected.
- Do not enable "Lock after N minutes" or "Lock when sleeping" for the login keychain.

**PGP signing subkey** lives in the local GPG keyring (`~/.gnupg`), passphrase-less, not in 1Password. It is used
by an unattended local process; routing a private key through `op run` every day would widen exposure for no gain.
1Password's agent does not fit: it is SSH-only, defaults to vaults service accounts cannot reach, and is
desktop-app-and-human-gated. Note its approvals are _cached_ rather than per-request — an earlier revision
overstated that — but it still requires an unlocked desktop app.

**Credentials outside the Wren runtime**, recorded so the chain is auditable: a **second** 1Password service
account (`ONEPASSWORD_GITHUB_ACTIONS_SERVICE_ACCOUNT_ACCESS_TOKEN`) and a GitHub App private key
(`WREN_AUTO_MERGE_PRIVATE_KEY`) with `contents: write` and `pull-requests: write`, both used only by the
dependabot auto-merge workflow. Rotation for either is manual and web-UI-only, with old-token grace of
now / 1 hour / 3 days.

**Offline escrow**, required before P6 completes. The envelope contains:

- the **age identity** — the only thing that can decrypt S3 backups;
- the **PGP verification key**, because a detached signature carries a key ID, not the key, so minting a new subkey
  lets you sign future artifacts but never verify existing ones;
- the **last known backup counter**, so rollback detection survives total machine loss.

Store offline and physically separate — paper in a safe is sufficient. Never in S3, in the repo, or anywhere
depending on what it protects. Verify once by transcribing and performing a real decrypt.

## Invariants

Defined with enforcement and tests in [`docs/invariants.md`](./invariants.md).

| ID     | Invariant                                                                               |
| ------ | --------------------------------------------------------------------------------------- |
| INV-1  | Wren never sends email.                                                                 |
| INV-2  | Wren never deletes or trashes a message or thread.                                      |
| INV-3  | Email content reaches only Gmail, Wren's Ollama, and encrypted S3 backups.              |
| INV-4  | Inference runs on pinned local weights in a Wren-controlled Ollama instance.            |
| INV-5  | No hosted telemetry.                                                                    |
| INV-6  | Raw bodies live only in `cache.sqlite`, except curated benchmark golden fixtures.       |
| INV-7  | Derived content leaves only via encrypted backups, except managed Gmail labels.         |
| INV-8  | Secrets are never committed and never included in backups.                              |
| INV-9  | Every HTTP listener binds loopback only.                                                |
| INV-10 | Host validation on all requests; Origin and CSRF on mutating actions.                   |
| INV-11 | Email and model output render as plaintext only in v1.                                  |
| INV-12 | Email content is untrusted prompt input.                                                |
| INV-13 | Model output is schema-constrained and schema-validated.                                |
| INV-14 | Never publish an unsigned backup.                                                       |
| INV-15 | Run history stores template versions, message refs, and hashes, never rendered prompts. |
| INV-16 | Logs and test artifacts redact secrets and email-derived content.                       |
| INV-17 | Wren modifies only Gmail label assignments it created.                                  |
| INV-18 | Wren never creates messages or drafts in Gmail.                                         |
| INV-19 | Wren never deletes or alters a Gmail label resource it did not create.                  |
| INV-20 | Wren never requests a scope broader than the current phase requires.                    |

## Data Classification

| Data                                            | Store                   | Backed up      |
| ----------------------------------------------- | ----------------------- | -------------- |
| Raw inbox body/MIME                             | `cache.sqlite`          | No             |
| Raw sent body during tone extraction            | `cache.sqlite`          | No             |
| Canonicalized temporary thread text             | `cache.sqlite`          | No             |
| Bench golden fixtures                           | `state.sqlite`          | Yes, encrypted |
| Decisions, reasons, summaries                   | `state.sqlite`          | Yes, encrypted |
| Draft suggestions                               | `state.sqlite`          | Yes, encrypted |
| Corrections and rules                           | `state.sqlite`          | Yes, encrypted |
| Tone style card and exemplars                   | `state.sqlite`          | Yes, encrypted |
| Label mappings, mutation intent, audit log      | `state.sqlite`          | Yes, encrypted |
| Backup counter and local receipt                | `state.sqlite` + escrow | Yes, encrypted |
| OAuth token                                     | `~/.wren/auth`          | No             |
| Plaintext snapshot in flight (high-sensitivity) | `~/.wren/tmp`           | No             |
| Logs                                            | `~/.wren/logs`          | No             |
| age identity                                    | 1Password + escrow      | No Wren backup |
| age recipient, AWS credentials                  | 1Password               | No Wren backup |
| 1Password service account token                 | macOS Keychain          | No Wren backup |
| PGP signing subkey                              | `~/.gnupg`              | No Wren backup |
| PGP verification key                            | `~/.gnupg` + escrow     | No Wren backup |

"Backed up, encrypted" means age-encrypted in the artifact. Databases are unencrypted on disk in v1.

Cache retention: inbox bodies TTL 30 days; sent bodies purged immediately after tone extraction unless pinned;
purge runs in the agent loop and doctor reports the oldest entry's age so a loop failing before that step is
visible. `PRAGMA temp_store = MEMORY` on both connections. `secure_delete` is unsupported, so compaction means
delete-and-rebuild from Gmail.

## Gmail Plan

**Why `gmail.modify` is required**, which is the part that justifies everything else: `users.messages.modify`,
`users.messages.batchModify`, and `users.threads.modify` are each authorized by exactly `mail.google.com` or
`gmail.modify`. `gmail.labels` manages label _resources_ and cannot apply one to a message. **No scope narrower
than `gmail.modify` can attach a label to a message at all.** Narrowing to `gmail.readonly + gmail.labels` would
eliminate 15 of `gmail.modify`'s write methods but cannot label anything, so it is not an option. Therefore the
method allowlist is not defence in depth — it is the primary control.

OAuth:

- Google OAuth Desktop app, **Production-unverified** consent screen. Testing status issues refresh tokens
  expiring in 7 days. That rule is **scope-agnostic** — it applies to any external-user-type project except one
  requesting only basic identity scopes, and it expires the whole authorization, not just the refresh token. Any
  future scope addition inherits it.
- Both Gmail scopes are **restricted**, Google's highest tier. Production-unverified therefore shows the
  "unverified app" warning screen at every authorization, including P5's re-auth and every `invalid_grant`
  recovery, and carries a lifetime non-resettable 100-user cap. Irrelevant at one user; the screen is not, and the
  setup runbook must show it.
- Single OAuth client. The exact scope set per phase, which doctor asserts granted scopes equal:

```text
P1e through P4.5:
  https://www.googleapis.com/auth/gmail.readonly

P5 (both requested together in one fresh authorization):
  https://www.googleapis.com/auth/gmail.readonly
  https://www.googleapis.com/auth/gmail.modify
```

Both must be listed at P5 — `gmail.modify` does not subsume `gmail.readonly` in the granted-scope string, so an
equality assertion against a one-element set would fail.

- **P5 performs a fresh full-scope authorization**, not incremental consent. Google states incremental
  authorization is not supported for installed apps, because the client cannot keep the client secret confidential.
- Never request `gmail.compose`, settings scopes, or `mail.google.com` (INV-20).
- Do not treat the desktop client secret as confidential.

Flow requirements: PKCE `S256`; one-use random `state`, validated on return; loopback redirect on a random
available port; validate returned account identity and exact granted scopes before replacing any stored token;
atomic token replacement via write-and-rename.

`invalid_grant` recovery must be **general**, not password-change-specific. Google documents seven causes including
six months unused, exceeding max live refresh tokens per account, `admin_policy_enforced`, and time-based access
expiry. Recovery is a UI action (see Failure Handling).

Sync:

- Backfill 500 recent inbox threads and 500 sent messages.
- Steady state uses windowed re-list. Each run **freezes an upper bound** at start, uses a lookback of
  time-since-last-successful-run plus an overlap margin, and **paginates to exhaustion** — Gmail list methods
  return at most 500 results per page with a page token.
- The watermark advances **only after a durable run commit**, never mid-run. This property is also P7's catch-up
  mechanism.
- Idempotence uses a complete decision fingerprint: `account_id`, `message_id`, `thread_id`, normalized content
  hash, `prompt_version`, `schema_version`, `policy_version`, `model_digest`. A partial key silently reuses stale
  decisions.
- Confirm whether Gmail's `after:` operator accepts second-level precision or rounds to days; if it rounds, the
  overlap margin must absorb a full day. **Provisional overlap margin: 48 h**, chosen to absorb day-rounding
  either way; narrow it once the operator's granularity is confirmed.
- Defer `history.list` until label reconciliation is mature.
- A **full inbox reconcile** runs at least weekly. Windowed re-list cannot detect user-side archive, read, or
  relabel actions. The reconcile is a **read** and consumes no write ceiling.
- `account_id` on all Gmail-keyed tables from day one.
- Back off on 429 and 5xx with exponential delay and full jitter. **Provisional:** base 1 s, factor 2, cap 60 s,
  five attempts, then fail the run.

Mutation safety (P5):

- Gmail calls and SQLite writes cannot share a transaction. Persist mutation **intent** before calling Gmail, then
  reconcile desired versus observed labels after any ambiguous outcome, so a Gmail success followed by a database
  failure neither loses its audit row nor gets blindly retried.
- **Write ceiling: 200 message-label effects per run.** One add or remove against one message is one unit, so a
  500-message `batchModify` is 500 units. Exceeding it aborts the run before any mutation and surfaces a
  remediation action offering a one-run override (**provisional ceiling: 1000 effects**, explicitly confirmed and
  written to the audit log). The weekly reconcile is a read and does not count.

Label vocabulary:

- Managed namespace is `Wren/`. Semantic keys are a closed enum, versioned with the decision schema, mapping to
  display names such as `Wren/Needs Reply`. **Provisional enum:** the ten `topic` values, plus `needs_reply`,
  `high_attention`, and `cleanup_candidate` — thirteen keys, each with a `Wren/` display name. Revise at P4.5 when
  shadow labelling shows which keys are actually worth applying.
- A model-emitted key outside the enum routes the decision to review and applies no label (INV-13).
- Semantic keys must not shadow Gmail system label names. The decision-record example in an earlier revision
  emitted `important`, which shadows `IMPORTANT`; use `high_attention`.

## Model Plan

Wren supervises **its own** Ollama instance. Full enforcement chain in INV-4.

- A dedicated LaunchAgent runs `ollama serve` with `OLLAMA_NO_CLOUD=1` in that process's environment only, on
  `127.0.0.1:11435` by default. The setting name is **`WREN_OLLAMA_PORT`**; the host is fixed at loopback and not
  configurable.
- The machine-global instance on `11434` is never contacted or reconfigured, and remains fully cloud-capable for
  unrelated use. No `~/.ollama/server.json` is written; nothing is set via `launchctl setenv`.
- `OLLAMA_MODELS` points at the default `~/.ollama/models`, shared with the machine-global instance. Reads are safe
  across processes and this avoids duplicating tens of gigabytes. An externally repointed name yields a fail-safe
  403 rather than a leak. Revisit a dedicated directory only if that collision occurs in practice.
- No Docker for inference — Docker Desktop on macOS has no GPU passthrough.
- Structured outputs with JSON-schema constrained generation, validated with Zod. **Models must be GGUF**: on the
  MLX runner the `format` field is silently ignored and output is unconstrained prose with no error. Every current
  library model publishes `-mlx` tags and MLX is the natural Apple Silicon choice, so this is a live hazard.
- Temperature `0` for classification and benchmarks.
- **Model allowlist with pinned digests.** `wren models add <name>` resolves and records the expected digest;
  inference refuses on mismatch. The digest is the manifest hash, not a hash of the weights, so it detects
  repointing rather than weight tampering.
- Use raw `fetch` for `/api/tags`, `/api/show`, `/api/status`. The `ollama` npm typed client cannot surface
  `remote_host`, `remote_model`, or cloud status. Call `/api/show` with `verbose: true`.
- Never assume "listed in `/api/tags`" implies local; Ollama's source carries a TODO to integrate cloud models
  there.

Candidate models are benchmark-selected. **Refresh the list before P3** rather than calibrating thresholds against
two-year-old weights, and note the interaction with the GGUF requirement — modern models' natural Apple Silicon
tags are `-mlx`, which is exactly the variant where schema enforcement disappears.

## Pipeline And Decisions

```text
scheduled or manual run
  -> acquire run lock
  -> sweep ~/.wren/tmp
  -> load config and durable state
  -> verify Gmail auth, Wren Ollama health, cloud-disabled status, model digests
  -> retry pending backups
  -> freeze listing window
  -> fetch new or changed threads, paginating to exhaustion
  -> fetch sent sample when the tone profile needs rebuilding
  -> normalize threads
  -> purge expired cache entries
  -> apply deterministic rules
  -> run local model classification
  -> generate UI-only draft suggestions where warranted
  -> persist decisions and audit records
  -> allocate backup counter, commit run, advance watermark
  -> update review queues
  -> apply Gmail labels when enabled (P5+)
  -> snapshot, encrypt, sign, publish backup
```

Decision record, versioned Zod schema owned by `mail-agent`:

```json
{
  "topic": "work_alert",
  "attention": "high",
  "replyState": "no_reply_needed",
  "cleanup": "keep",
  "draft": { "shouldSuggest": false },
  "labels": ["work_alert", "high_attention"],
  "confidence": 0.91,
  "reason": "P1 alert from known work group; no direct response expected.",
  "reviewRequired": false
}
```

Every persisted decision additionally carries `account_id`, `thread_id`, content hash, `schema_version`,
`prompt_version`, `policy_version`, and `model_digest`.

Closed enums:

```text
topic:      personal, work_alert, support, security, newsletter,
            cold_sales, marketing, receipt, account_notification, unknown
attention:  low, normal, high
replyState: no_reply_needed, reply_expected, reply_overdue
cleanup:    keep, archive_candidate, noise
```

`cleanup` is **UI-only in v1** and may never drive a Gmail mutation. Auto-archive is deferred and `archive_candidate`
exists to populate the Today view's cleanup list, nothing more.

Confidence policy: `>= 0.85` firm, `0.65-0.84` review, `< 0.65` review. These are placeholders — uncalibrated model
self-reports, not probabilities. Calibrate against corrections in P4 and set per-category thresholds. Personal-mail
caution is categorical. Agreement between a deterministic signal and the model raises certainty more than any
self-reported score.

Reprocessing on version bump: lazy and selective. New mail uses the new version; existing decisions keep their
stamps; an explicit action re-runs only review-queue or low-confidence items. Never bulk-reprocess.

Work alert grouping, deterministic in v1: `List-Id`, normalized subject (strip `Re:`/`Fwd:`, digits, incident
identifiers), severity from list name, time bucket. **Provisional:** 6-hour buckets; severity by list-name prefix,
`p0`/`p1` → critical, `p2` → high, `security` → high, everything else → normal. No embeddings, no LLM clustering.

Tone profile: a versioned style card (greeting and sign-off conventions, brevity, formality, punctuation) plus
curated few-shot exemplars bucketed by recipient type, both in `state.sqlite`, both versioned. Sent raw bodies are
purged after extraction; re-extract on version bump.

Draft grounding: constrained to thread context plus tone profile, no verifier pass in v1, UI always shows source
context, human review is the safety net. "Drafts must not invent facts or commitments" is an **accepted residual**
recorded in `decisions.md`, not an enforced requirement — there is no mechanism and no test.

Model-emitted `reason` and `summary` are length-clamped but not content-bounded, so a verbatim body quotation can
reach `state.sqlite` and the backups. INV-6's test defines "body text" as a contiguous 12-word match precisely to
catch this.

## UI Plan

```text
Today   Review   Drafts   Bench   Setup
```

`Today`: summary, important items, alert groups, draft suggestions, cleanup candidates, recent activity, system
status. `Review`: uncertain classifications, high-impact decisions, correction controls. `Drafts`: suggested
replies, source context, feedback controls (Good, Too Formal, Too Long, Wrong Tone, Not Needed). `Bench`: model
comparison, per-item diffs, confusion matrix, injection suite status. `Setup`: OAuth and scope status, Wren Ollama
status and cloud-disabled posture, model availability and digests, DB migration status, data directory
permissions, `age`/`gpg` presence, backup and restore freshness, doctor checks.

Every view renders a **failure banner** when the last run failed or is stale. See Failure Handling.

## Failure Handling

The documents previously promised loud failure in five places with no channel for any of it. Detection,
notification, and remediation are specified together because a notification without a fix is not actionable.

**Detection.** Doctor checks are the single source of failure state. Each check declares an identifier, a
human-readable remediation string, and an optional remediation action. Run outcomes are persisted so state
survives a page reload.

**Notification.** On non-zero worker exit the launchd wrapper emits a local notification:

```shell
osascript -e 'display notification "<summary>" with title "Wren"'
```

No hosted telemetry (INV-5), and Wren cannot email (INV-1). Verify during setup that this fires from a LaunchAgent
— it runs in the user's Aqua session, but TCC may prompt once.

**Banner.** Every view shows a persistent banner when the last run failed, or when the last success exceeds 36
hours. This is the backstop when notifications are suppressed, and it lands on the surface the user already opens.

**Manual trigger.** Setup exposes **Run now**, which invokes:

```shell
launchctl kickstart -k gui/$(id -u)/<worker-label>
```

It must go through launchd, **not** spawn the worker from the SSR server. The server's environment came from
however it was started and is not the launchd environment — a "Run now" that spawns directly could succeed while
the 10:00 run fails, or the reverse, giving false confidence in exactly the mechanism being tested.

**Remediation actions.** Each failure class maps to a named action:

| Failure                                      | Remediation                                                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `invalid_grant` / scopes wrong               | **Re-authenticate** — starts the OAuth flow in the browser                                      |
| Keychain locked                              | Instructions plus **Retry** once unlocked; doctor distinguishes locked from not provisioned     |
| 1Password unreachable or 429                 | **Retry**, with the retry-after interval shown, since backoff cannot recover in-run             |
| Wren Ollama down, or `cloud.disabled: false` | **Restart Wren Ollama** — kickstarts its LaunchAgent                                            |
| Model digest mismatch                        | Shows expected versus observed; **Re-pin** requires explicit confirmation                       |
| Write ceiling exceeded                       | **Override for one run** with a raised ceiling, recorded in the audit log                       |
| Pending backup unsigned                      | **Retry pending backups**                                                                       |
| Migration pending                            | Instructions; migrations are never applied automatically from the UI                            |
| Run lock held                                | Shows the holder's identity and age; **Force release** only when the owner is demonstrably dead |

Two gaps this does not close, recorded deliberately: a run that fails while the machine is awake gets no
same-day automatic retry — recovery is the notification plus **Run now**. And a LaunchAgent disabled by the user in
System Settings → Login Items is not detectable by `launchctl kickstart` succeeding, so doctor checks registration
state separately.

**Process separation.** The worker runs as its own process, never inside the SSR server. Every Turso query blocks
the event loop, so a backup inside the server process would freeze all HTTP handling for the duration. This is
recorded because it is a property nobody would rediscover before "simplifying" the two back together.

## Backup And Recovery

```text
allocate and commit backup counter
  -> VACUUM INTO snapshot of state.sqlite
  -> seal manifest
  -> age encrypt
  -> PGP detached sign with dedicated subkey
  -> bundle ciphertext + signature into one container
  -> upload the container as a single S3 object
  -> record VersionId and counter in the local receipt
```

The counter is **allocated and committed before the snapshot**, so the snapshot contains the counter value that
describes it. Allocating afterward would mean every backup carries its predecessor's number, which breaks the
anti-rollback story the counter exists for.

Rules: `state.sqlite` is backed up, `cache.sqlite` excluded. Publication is atomic — ciphertext and signature in
one object, so a crash cannot expose unsigned ciphertext. The S3 client is reachable only through the signing
module. Signing failure queues the already-encrypted artifact in `~/.wren/backups/pending/`; pending predecessors
are retried before a successor is created, and a **failed retry does not block the successor** — both publish in
counter order and the failure surfaces through Failure Handling. Snapshot destination must not already exist; write
to `~/.wren/tmp` and unlink after upload.

Signing uses a dedicated passphrase-less PGP subkey; the primary key stays protected.

S3: private bucket, versioning enabled, lifecycle retention (**provisional:** noncurrent versions expire at 90
days, current versions retained indefinitely). Backup principal has `PutObject` and constrained
`ListBucket`. Restore credentials have `GetObject`, `ListBucket`, and **`ListBucketVersions`** — required to
inspect version history. No `DeleteObject` for Wren credentials.

Manifest: monotonic counter, created timestamp, app version, schema versions, engine version, ORM version, `age`
and `gpg` versions, included tables, state DB hash, age recipient, PGP signing fingerprint, previous backup
reference. **No upload timestamp** — the manifest is sealed before upload, so an upload time cannot be known; the
`VersionId` and upload time go in the local receipt.

Restore, in this order:

1. Download the latest container; read the local receipt if available.
2. **Verify the PGP signature.**
3. **Decrypt with the age identity.**
4. **Read the manifest** and check counter continuity. Counters are strictly increasing with no gaps — an offline
   machine allocates none, so a gap is a signal.
5. Place `state.sqlite` in `~/.wren/db/`.
6. Run migrations; an older schema version must be migrated forward before use.
7. Re-authenticate Gmail.
8. Mark cached threads as needing body re-fetch. Decisions survive in state; body previews and review context live
   in `cache.sqlite`, which is not backed up.
9. Resume processing.

**Freshness after total machine loss.** The local receipt dies with the machine, so the fallback is S3 version
history: enumerate every object version, decrypt each manifest, and confirm counters increase monotonically in
S3's own version order. An adversary replaying an older signed artifact necessarily creates a newer version
carrying a lower counter, which is detectable, and cannot forge a higher one without the signing subkey. The
escrow envelope also carries the last known counter. The circularity concern applies to a single artifact in
isolation, not to the ordered set.

**Bucket-administrator rollback is out of scope for v1**, documented as accepted risk. It requires compromised AWS
credentials, at which point the attacker still cannot decrypt or forge; deleting newer versions outright requires
`DeleteObject`, which Wren's credentials lack. S3 Object Lock is the mitigation if this ever comes into scope.

Drills: `restore --verify-only` quarterly and after any engine upgrade. Doctor reports days since last successful
backup and last verified restore.

## Benchmarking

Golden corpus: 100-200 real hand-labelled threads, stratified by category, stored in `state.sqlite` as bench
fixtures and included in backups — the sole sanctioned exception to raw bodies living only in cache. Curation
checklist before a thread becomes a golden: cap the count, review for live credentials, and exclude or redact
password reset links, 2FA codes, and account numbers. These become permanent copies in every backup. Plus
adversarial synthetic injection fixtures.

Determinism: temperature `0`, pinned model digests, versioned prompts and sample sets, frozen fixture bodies.

Stored per run: model name and digest, prompt version, sample set version, engine and ORM versions, per-item
output, per-item score or correction, latency.

Metrics: per-category precision and recall plus confusion matrix; needs-reply tuned for recall; noise and cleanup
tuned for precision; draft quality via a human rubric reusing the Drafts feedback tags; latency p50/p95 and tokens
per second; JSON validity as a smoke check; injection suite as a pass/fail gate. Not measured in v1: memory and
thermal impact.

```shell
yarn bench --models qwen2.5:14b,llama3.1:8b
yarn bench --suite inbox-triage-v1 --sample golden-v1
```

## Implementation Phases

### P0: Finish Scaffold

- Add `docs/plan.md`, `docs/invariants.md`, `docs/decisions.md`.
- `.gitignore`: root, `graph-manager`, and `common` gain `.env*` with `!.env.example`; root gains `tmp`, `*.db`,
  `*.db-wal`, `*.db-shm`, `*.sqlite*`. Patterns must cover extensionless database filenames the documented
  workflows produce — `tmp` is the pattern that does, since the readme workflow puts scratch databases there.
- Bind both Hono servers to `127.0.0.1`; pin Vite, Storybook, Vitest UI, and the Playwright report server to
  loopback.
- Add Host allowlist middleware ordered ahead of Vite, static, health, and application routing, covering both
  `localhost` and `127.0.0.1` at every configured port. Add Origin validation and a CSRF foundation for actions.
- Remove the dev-mode `connect-src http: ws:` CSP wildcard.
- Add a Yarn constraints file with three distinct constraints: the `mail-agent` import boundary, a ban on hosted
  model SDKs in any workspace's dependency tree (INV-4), and an explicit
  `@sentry/*` / `@opentelemetry/*` dependency ban. Add matching ESLint restrictions, **including a rule banning
  global `fetch`, `node:http`, and `node:https` outside `src/adapters/`** (INV-3).
- Remove `pino` from `mail-agent`; introduce a logger port.
- Add the `test:invariants` task. It reads every invariant ID from `docs/invariants.md` and asserts each has a
  registry entry naming its test and the sub-phase that owns it; for any entry whose owning sub-phase has already
  passed, it additionally asserts the named test exists and passes. At P0 most entries are declared-but-pending,
  which is the point — the task fails when an invariant is added with no declared home, which is what makes
  change-control clause 3 mechanical instead of self-reviewed. Wire it into CI.
- Run the Atlas bump process against the currently pinned Atlas version, which was auto-merged without it.

Acceptance:

- No source or config references to Pincushion, Sentry, or OTel, other than the Yarn constraint and ESLint rule
  that ban the latter two by name.
- **Actual bound socket addresses** of every listener are loopback, **and configuration rejects `::`, `0.0.0.0`,
  and any external address** rather than accepting with a warning.
- A foreign `Host` header is rejected on a `GET`, including against the dev server with Vite mounted.
- The CSRF middleware rejects a mutating request carrying no valid token, exercised against the middleware
  directly — no application action exists yet, so the end-to-end half of this is gated at P1f.
- Adding `@sentry/node` to a workspace manifest fails the Yarn constraint.
- A deliberate boundary violation in `mail-agent` fails lint.
- No tracked file matches the sensitive patterns, and every ignore rule for a sensitive path originates inside the
  repository.
- The composed CSP contains no wildcard scheme in `connect-src` under any `NODE_ENV`.
- `test:invariants` runs in CI, covers all 20 invariant IDs, and fails when an invariant is added to
  `docs/invariants.md` without a registry entry.
- `atlas migrate validate` passes and a no-op `atlas migrate diff` emits nothing under the pinned Atlas version.

### P1: Foundations

P1 is delivered as six sub-phases. Each has an independently demonstrable end state and its own acceptance gate,
so progress is provable before the whole of P1 lands. "P1" remains a valid umbrella term meaning P1a through P1f
complete, and every reference to `P1` elsewhere in these documents resolves to that umbrella unless it names a
sub-phase.

Ordering is `P1a → P1c → P1b → P1f`, because RunLock needs the database, **P1c's logger must exist before P1b
loads a service-account token into configuration** that would otherwise be dumped whole at `info`, and the
operator surface aggregates everything. `P1d` is independent of all of them; `P1e` needs `P1b` for the OAuth
client credentials.

#### P1a: Persistence

_End state: the real schema exists, migrations apply idempotently, triggers fire._

- Remove all database encryption code and configuration; `experimental` becomes `[]`. Remove `encryptionSchema`
  and the four `*_DATABASE_ENCRYPTION_*` variables from `config.server.ts` and `.env.example`.
- Move connection construction from `console-portal` into `graph-manager`; composition injects configuration only.
  Derive DSNs from `WREN_DATA_DIR`, validate that they are local file paths, and reject remote URLs.
- Set `foreign_keys = ON`, `temp_store = MEMORY`, `require_where = 1`, and `busy_timeout` (**provisional: 5000 ms**)
  on both connections. Read
  pragmas with `exec()`, never the prepared-statement API.
- **Add a test harness to `graph-manager`** — Vitest, config, and a `test:unit` script. This sub-phase's own
  acceptance depends on tests in a package that currently has none.
- Replace placeholder schemas with the real relational schema: accounts, threads, messages, decisions, drafts,
  corrections, rules, tone profile, labels, label mutation intent, label mutation audit, runs, bench suites, bench
  results, backups. All Gmail-keyed tables carry `account_id`. Decisions carry the full fingerprint. Hand-author
  `updated_at` triggers.
- Generate migrations via Atlas; add `atlas.hcl` with a named environment per database.
- Add three `graph-manager` tests: migration smoke (Atlas applies, then Turso evaluates `uuid7()` defaults and
  fires triggers at runtime); phantom-diff (readme workflow then no-op diff emits nothing); and **every table has
  its `updated_at` trigger**.

Acceptance: migrations are idempotent on fresh databases; all three `graph-manager` tests pass, including
trigger coverage; remote DSNs are rejected; no encryption code or configuration remains.

#### P1b: Machine provisioning

_End state: secrets resolve on a cold start, and a locked keychain fails fast rather than hanging._

- Add 1Password service-account config loading with `op://` item+vault ID references; assert `OP_CONNECT_*` are
  unset.
- Read the bootstrap token from Keychain through a hard timeout; fail loudly on unavailability.
- Add the compiled `SecKeychainGetStatus` probe with three-way remediation: not provisioned, locked, readable.
- Create the data directory `0700` with operational files `0600`; sweep `~/.wren/tmp` on start.
- Install `age` and `gpg`; **record the installed versions as the pinned versions**; add presence and
  version-match checks.
- Write the provisioning runbook, including the one-time interactive Keychain step.

Acceptance: secrets resolve from a cold shell; **a locked keychain produces a fast, loud failure — tested by
actually locking it**, not only by exercising the happy path; the probe distinguishes all three states;
directory and file permissions are as specified; `age` and `gpg` are present and match the recorded pins.

#### P1c: Runtime safety

_End state: a non-allowlisted host throws, a token never reaches a log, and two runs cannot overlap._

- Add the INV-3 egress allowlist with exact hosts.
- Add token and secret log redaction in `console-portal`, baked into the logger with no opt-out. Fix the
  configuration dump at `info` and tie the redaction list to the config schema.
- Add RunLock: a process-lifetime advisory lock plus a durable fenced run journal. A lease-and-PID scheme alone is
  insufficient — leases expire while a process is merely suspended and PIDs are reused. Record an unguessable owner
  token, boot identity, process start identity, and a monotonic fencing token; never steal from a live owner.
- Add the CI repository scan for sensitive tracked files.

Acceptance: a non-allowlisted outbound host throws, including `generativelanguage.googleapis.com`; a logged
payload containing a known token emits nothing sensitive at default level, and no call site can construct an
unredacted logger; two concurrent run attempts cannot both hold the lock and a suspended holder is not stolen
from; CI fails when a file matching the sensitive patterns is tracked.

#### P1d: Local inference

_End state: a cloud-routed or substituted model is refused before any prompt leaves the process._

- Add the Wren Ollama LaunchAgent with `OLLAMA_NO_CLOUD=1` in that process's environment only, and
  `WREN_OLLAMA_PORT` configuration rejecting non-loopback values.
- Add the INV-4 gate chain (Gates A through F).
- Add the model allowlist and `wren models add` digest provisioning.

Acceptance: a `-cloud` or `:cloud` name is rejected before any HTTP call; a digest mismatch refuses the run;
`/api/status` reporting `cloud.disabled: false` or returning 404 refuses the run; a `/api/tags` fixture carrying
`remote_host`, and one with `size: 307` and empty `format`, are both rejected.

#### P1e: Gmail authorization

_End state: a readonly token exists, granted scopes exactly match, and forbidden scopes are unrepresentable._

- Add the OAuth readonly flow: PKCE `S256`, one-use `state`, random loopback port, account and exact-scope
  validation, atomic token replacement.
- Add general `invalid_grant` recovery covering all documented causes, not only password change.
- Add the phase scope constant and forbidden-scope denylist (INV-20).
- Define the Gmail port surface with no send, trash, delete, draft, insert, or import method (INV-1, INV-2,
  INV-18 P1e halves).

Acceptance: a readonly token is obtained and stored `0600` with atomic replacement; granted scopes exactly equal
the phase set and a broader grant is rejected; the authorization URL builder rejects `mail.google.com` and every
other forbidden scope; the adapter surface exposes none of the forbidden methods.

#### P1f: Operator surface

_End state: doctor is green, failures notify, and every failure offers a fix._

- Add the Setup/Doctor UI aggregating every check from P1a–P1e.
- Add the failure banner across all views.
- Add **Run now** via `launchctl kickstart`, routed through launchd rather than spawned from the SSR server.
- Add the remediation actions defined in Failure Handling.

Acceptance: doctor verifies data dir permissions and sync-folder absence, in-repo ignore rules, databases and
migrations, OAuth status and exact granted scopes, Wren Ollama reachability with `cloud.disabled: true` and
`source: env`, model digests matching pinned values with no `remote_*`, Keychain three-way state, and `age`/`gpg`
presence; **Run now** triggers a real launchd run and the banner clears on success; a forced failure in each class
produces a notification and offers its named remediation; **a real mutating action — `Run now` or a remediation —
rejects a request without a valid CSRF token** (INV-10's second half, which P0 could only prove at the
middleware).

### P2: Dry-Run Pipeline

- Fetch 500 inbox threads and 500 sent messages; implement windowed re-list with frozen window, exhaustive
  pagination, and post-commit watermark advance.
- Normalize MIME/HTML to canonical plaintext as pure functions in `mail-agent`, with fixture tests. Strip quoted
  replies and tracking clutter.
- Build the tone profile; purge sent raw bodies after extraction. Implement cache TTL purge and the oldest-entry
  doctor metric.
- Deterministic rules, then structured-output classification through the INV-4 gates; deterministic alert grouping;
  UI-only draft suggestions; persist decisions with the full fingerprint.
- Add Today/Review/Drafts, plaintext only.
- Add the snapshot command producing an age-encrypted local export of `state.sqlite`.
- Strip URLs from generated drafts unless the URL is present in the source thread (INV-12).
- Make Node Inspector opt-in: remove `--inspect` from the default `dev` scripts, since mailbox data first flows
  here (INV-16).
- Add the minimum injection gate; add email-derived log redaction in `mail-agent`; remove `--passWithNoTests` once
  the first real test lands.

Acceptance: end-to-end dry run completes on the real mailbox; re-run creates no duplicate decisions; no body text
in non-cache state tables except goldens, by the 12-word rule; UI renders plaintext only and loads no remote
content; snapshot decrypt and verify works; minimum injection gate passes; malformed and out-of-enum model output
routes to review and is absent from the decisions table.

### P3: Bench

- Create 100-200 hand-labelled goldens following the curation checklist; add adversarial injection fixtures and
  expand the P2 gate into the full suite; add benchmark CLI, tables, per-item results, and Bench UI with diffs.
- Implement the INV-16 artifact controls: snapshots written outside `src/`, tracing disabled for mail-view tests,
  CI artifact globs excluding mail-view outputs.
- Refresh the candidate model list before benchmarking.

Acceptance: at least two models benchmarked; injection suite gates; per-item diff inspectable; metrics complete;
no tracked snapshot originates from a mail-view test and CI globs exclude mail-view outputs.

### P4: Corrections

Review correction actions and Draft feedback actions; corrections stored with decision refs; deterministic sender
and List-Id rule generation; few-shot retrieval from corrections; confidence calibration report setting
per-category thresholds.

Acceptance: a correction changes a future matching classification; calibration view renders and thresholds derive
from observed accuracy.

### P4.5: Shadow Labelling

Record would-apply labels without Gmail writes; display label deltas; track precision against corrections.

Acceptance: shadow report covers at least one week and meets a **stated numeric precision bar per semantic key**,
recorded at sign-off; no write scope granted; approval recorded per semantic key, since P5 gates on it.

### P5: Gmail Labels

- Fresh full-scope authorization including `gmail.modify`.
- `LabelWriter` port; the exhaustive permitted-method matrix; INV-17 denylist plus `type: "system"` check plus
  positive allowlist; INV-18 and INV-19 exclusions including `labels.delete`; INV-20 scope assertion.
- Mutation intent table and post-hoc reconciler; write ceiling in message-label effects with the override action;
  mutation audit table.
- Create managed labels under `Wren/`; store semantic-key to label-ID mapping; apply only above calibrated
  thresholds and only where shadow labelling was approved for that key; namespace rename via `labels.patch` by ID;
  per-run reconciliation and self-healing; weekly full inbox reconcile.

Acceptance: `users.watch` is absent from the permitted-method allowlist (INV-20 P5 half); labels visible in Gmail
with an audit row per mutation; allowlist rejects send, trash, delete, draft,
insert, import, **and `labels.delete`**; every ID in the INV-17 denylist rejected in both positions, plus a label
carrying `type: "system"` and a user-created label Wren did not create; a 500-message batch counts 500 units and
exceeding 200 aborts before mutating; Gmail success followed by a simulated DB failure is reconciled, not retried;
rename touches labels by ID; doctor verifies granted scopes equal the phase set.

### P6: Backups And DR

Counter allocation before snapshot; `VACUUM INTO`; manifest without upload timestamp; age encrypt; PGP sign with
the dedicated subkey; bundle and upload atomically with the S3 client reachable only through the signer; record
`VersionId` and counter in the local receipt; pending retry queue ordered before new backups; `restore
--verify-only` with signature-then-decrypt-then-manifest ordering, counter continuity, and the version-history
fallback; migration-on-restore; lazy cache re-fetch marking; `~/.wren/tmp` reaper; pin and doctor-check `age` and
`gpg`; backup and restore runbooks; complete and decrypt-verify the offline escrow envelope.

Acceptance: the upload function rejects an artifact that is not age-encrypted (INV-7 P6 half); the backup manifest
excludes `~/.wren/auth`, `~/.wren/logs`, and `~/.wren/tmp` (INV-8 P6 half); a signed encrypted container lands as
a single S3 object; the S3 client is not importable outside the
signing module; verify-only restore passes including counter continuity from version history alone with no local
receipt; a simulated signing failure leaves an encrypted pending artifact and blocks no successor; the escrow
envelope is decrypt-verified and contains identity, verification key, and counter.

### P7: Scheduling

Worker entrypoint without React or Vite imports; launchd installer whose wrapper reads the Keychain token under
timeout and invokes `op run`; `RunAtLoad=true` plus a daily 10:00 schedule; **`ProcessType` set to `Standard`**,
since an unspecified value makes launchd throttle CPU and I/O for a job whose purpose is local inference; absolute
binary paths; worker ordered after Wren's Ollama with doctor gating on cloud-disabled status; stdout and stderr to
`~/.wren/logs`, distinguishing `op` failures from application failures; notification on non-zero exit; pending
backup retry each run; RunLock preventing overlap.

Acceptance: `launchctl kickstart` runs the full loop; an overlap attempt is blocked; Keychain read succeeds under
launchd without a prompt, and fails fast when locked; doctor shows last run, next run, last backup, and **agent
registration state**, since a user can disable the LaunchAgent in System Settings without `kickstart` failing; the
catch-up criterion asserts the **lookback window covers the missed interval** — with last-success two days ago,
exactly one run occurs and its window reaches back two days.

## Deferred

- Gmail draft creation; auto-archive.
- Auto-delete and auto-send, permanently forbidden.
- Database encryption, pending Turso feature maturity.
- `history.list` incremental sync.
- Dedicated `OLLAMA_MODELS` directory, if a name collision occurs in practice.
- Same-day automatic retry after an in-session run failure.
- Fine-tuning; Temporal; Slack agent; GitHub vulnerability agent.
- Smarter alert clustering. This would likely use embeddings, and **neither `/api/embed` nor the legacy
  `/api/embeddings` has a `:local` guard**, so both need their own INV-4 analysis first.
- Multi-model routing; hosted backend; hosted telemetry.
- Service-account token rotation runbook, and recording the creation parameters.
- Storybook, the three-browser Playwright matrix, and two-locale i18n are inherited template weight, retained for
  now.
