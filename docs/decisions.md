# Wren Decisions

Version: 1.2
Companion documents: [`docs/plan.md`](./plan.md), [`docs/invariants.md`](./invariants.md)

> **This document is permanent and append-only.** [`docs/plan.md`](./plan.md) is transient and will be deleted once
> executed. This record must therefore be self-sufficient: it carries the reasoning behind every significant
> choice, the alternatives rejected and why, the findings withdrawn and why, and the externally verified facts
> those choices rest on. If a future reader needs to know _why_ Wren is built this way, the answer is here.
>
> Add entries; do not rewrite them. When a decision is reversed, add a new entry that supersedes the old one and
> mark the old one superseded.

## Decision Register

| ID  | Decision                                                                                                  | Status |
| --- | --------------------------------------------------------------------------------------------------------- | ------ |
| D1  | Four packages: `common`, `console-portal`, `mail-agent`, `graph-manager`                                  | Active |
| D2  | `graph-manager` name retained; means interconnected data, not a property graph                            | Active |
| D3  | Storage is relational                                                                                     | Active |
| D4  | Engine is `@tursodatabase/database` with Drizzle, local files only, exact-pinned                          | Active |
| D5  | Database encryption deferred                                                                              | Active |
| D6  | Atlas is sole owner of migrations; the documented readme workflow is correct                              | Active |
| D7  | Migrations may declare Turso-specific functions but must not execute them at apply time                   | Active |
| D8  | `WREN_DATA_DIR=~/.wren`                                                                                   | Active |
| D9  | 1Password dedicated vault; bootstrap token in macOS Keychain as the sole Keychain exception               | Active |
| D10 | age identity escrowed offline and decrypt-verified                                                        | Active |
| D11 | Single OAuth client, Production-unverified, fresh full-scope authorization at P5                          | Active |
| D12 | Windowed re-list sync with frozen window and periodic full reconcile; `account_id` everywhere             | Active |
| D13 | INV-17 system-label denylist plus write ceiling counted in message-label effects                          | Active |
| D14 | Lazy and selective reprocessing on version bump                                                           | Active |
| D15 | Tone profile is a versioned style card plus recipient-bucketed exemplars                                  | Active |
| D16 | Deterministic alert grouping in v1                                                                        | Active |
| D17 | Drafts are context-only grounded with no verifier pass                                                    | Active |
| D18 | Confidence thresholds are placeholders pending P4 calibration                                             | Active |
| D19 | `VACUUM INTO` snapshot, age encrypt, PGP sign, atomic single-object publication, local receipt            | Active |
| D20 | Bench goldens stored in state and backed up; sole exception to cache-only raw bodies                      | Active |
| D21 | Shadow labelling gate precedes any write scope                                                            | Active |
| D22 | Plaintext-only UI in v1                                                                                   | Active |
| D23 | Boundary enforcement is mechanical from P0                                                                | Active |
| D24 | Wren supervises its own Ollama instance with cloud disabled; shared model directory                       | Active |
| D25 | Exact pinning plus Dependabot governance for privileged dependencies, with defined bump processes         | Active |
| D26 | Document lifecycle: plan transient, decisions and invariants permanent; retirement is a procedure         | Active |
| D27 | Bucket-administrator rollback is out of scope for v1                                                      | Active |
| D28 | PGP signing subkey lives in the local GPG keyring, not 1Password                                          | Active |
| D29 | Triggers are hand-authored; Atlas is trigger-blind, and a test asserts per-table coverage                 | Active |
| D30 | Failure handling is notification plus banner plus a launchd-routed manual trigger and remediation actions | Active |
| D31 | Keychain read is wrapped in a hard timeout; unlocked session is a stated precondition                     | Active |
| D32 | INV-19 and INV-20 added: label-resource protection and scope-escalation protection                        | Active |
| D33 | Write ceiling is 200 message-label effects per run; the weekly reconcile is read-only                     | Active |
| D34 | Backup counter is allocated before the snapshot; a failed pending retry does not block its successor      | Active |
| D35 | Model digests are pinned in an allowlist; provisioning is explicit                                        | Active |
| D36 | `age` and `gpg` are treated as pinned dependencies with doctor presence checks                            | Active |
| D37 | `cleanup` is UI-only in v1; label vocabulary is a closed enum under a `Wren/` namespace                   | Active |
| D38 | P1 is delivered as sub-phases P1a–P1f; phases are never renumbered                                        | Active |
| D39 | Documentation states versions as provenance only, never as current dependency state                       | Active |
| D40 | Content rule: record decisions and rejected alternatives, not the narrative of reaching them              | Active |

## Rationale

### D2, D3 — `graph-manager` and relational storage

The name is deliberate and means "an interconnected association of durable local data." It does not imply a
property-graph model, node/edge traversal, or graph query semantics. Storage is ordinary relational tables. The
placeholder `graphs`/`nodes` schemas carried no design intent and are discarded.

Recorded because the name will otherwise mislead every future reader into inferring a graph database. A later
review argued that needing this paragraph is itself the argument for renaming. Noted and declined.

### D4 — Turso engine and the drizzle channel

Chosen for database-owned `uuid7()` IDs and timestamps, avoiding drift across future workers, scripts, and CLIs.
Accepted knowingly: the engine is pre-1.0, Drizzle's support for it is documented as beta.

An earlier framing called this "drizzle-orm is on a release candidate," which reads as an external constraint.
It is not: drizzle's `latest` is 0.45.x and 1.0 has never had a stable release. The 1.0 RC is
a _parallel prerelease channel_ this project opted into. The exit is not "wait for 1.0" — it is "drop to stable
0.45.x today." Sharper still: `@tursodatabase/database` pins drizzle 0.x in its own devDependencies, so Turso
integration-tests its Node binding against 0.x and nobody upstream tests this exact pair.

The `1.0.0-rc.4` pin also began as an accident — dependabot PRs moved to rc.5 and a later patch-group PR built
from a stale base silently reverted them. It is now deliberate.

Risk is bounded because databases are unencrypted, so files remain standard SQLite format. An exit requires
replacing the `DEFAULT` expressions **and** the `updated_at` triggers, both of which call Turso-specific functions.

### D1, D8 — Package structure and the data directory

**D1 — four packages, and no integrations package.** Rejected: extracting concrete adapters (Gmail, Ollama, S3,
age, PGP) into their own package. At one consumer that is structure without benefit; the boundary that earns its
keep is ports-defined-in-the-domain, not a separate artifact. The extraction trigger is a second consumer — a CLI
or a second agent — not a growing file count. `common` exists because three packages needed the same primitives,
which is that trigger already met once.

**D8 — `~/.wren` rather than a repo-local `.data`.** Rejected: keeping runtime data inside the working tree. A
repo-local directory is one `.gitignore` mistake from committing a mailbox to a public repository, and it inherits
whatever sync or backup tooling covers the projects folder. `~/.wren` is outside the repo and outside anything
that syncs it; `WREN_DATA_DIR` keeps relocation available without re-deriving paths.

### D5 — Encryption deferred

Turso's at-rest encryption is cryptographically real but operationally unfinished: key rotation unreleased,
encrypting an existing database unreleased, the feature behind an experimental flag, and `VACUUM INTO` writing
plaintext so every snapshot would defeat it.

Marginal protection is small — FileVault covers at-rest, `0700`/`0600` covers other local users, age covers
everything leaving the machine, and the residual same-user attacker could read the key from the process
environment.

**Correction to an earlier rationale:** encryption would _not_ make Turso a "one-way door." `VACUUM INTO` always
yields a plaintext escape path. The deferral rests on the four operational points, not on lock-in.

### D6, D7, D29 — Migrations and triggers

Atlas owns migrations. `drizzle-kit push` populates a separate, new, empty database used only as the diff target;
it never touches `~/.wren/db/`.

**The workflow is correct as documented**, challenged twice and refuted twice — see the withdrawals below for
the naming artifact that caused it.

**D29 — triggers are hand-authored.** Atlas gates trigger support behind a paid Pro tier: `atlas schema inspect`
returns zero triggers against a database containing two. This makes the arrangement _stable_ rather than broken,
because triggers are invisible on both sides of the diff and Atlas therefore never proposes dropping them.

Three options were considered:

1. **A Pro seat per developer and CI runner.** Rejected: ariga/atlas#2700 — open since 2024, SQLite, reproduced
   with an `updated_at` trigger — reports that triggers are not re-created after a column change even with support
   enabled, because Atlas emits SQLite's table-rebuild sequence and SQLite drops triggers with the table. Pro is
   necessary but not sufficient, so paying does not remove the guard we would need anyway.
2. **Application-level `updated_at`.** Rejected: contradicts D4's stated reason for choosing Turso.
3. **Hand-authored triggers plus a test asserting every table has one.** Chosen — the only option that does not
   depend on a vendor fix.

The residual is that Atlas-emitted table rebuilds silently drop triggers. Generated migrations are scanned for
`new_*`, `DROP TABLE`, and `RENAME TO`; the per-table trigger test is the backstop. An earlier revision attributed
this risk solely to Drizzle; it is Atlas-side too, and it is **not** "self-detecting in the generated migration"
as that revision claimed, because Atlas cannot see triggers at all.

**Rejected alternative: `drizzle-kit export` + Atlas `external_schema`.** Verified to emit a full table rebuild of
every table on a _no-op_ diff, which in SQLite destroys every trigger. Disqualified empirically. `drizzle-kit
export` does support the turso dialect and Atlas's Drizzle guides are Postgres-only, but the failure is a DDL
normalization mismatch, not a documentation gap.

### D9, D28, D31 — Secret custody and the Keychain

1Password is the source of truth, in a dedicated vault — mandatory rather than optional, because service accounts
cannot access built-in Personal, Private, Employee, **or default Shared** vaults.

The service-account token is a bootstrap credential that cannot live in 1Password. It goes in the macOS Keychain,
the single Keychain exception. Rejected: a `0600` file (same at-rest posture as the OAuth token despite being a
master credential) and the launchd plist (world-readable, visible in `launchctl print`).

**D31 — the timeout is the load-bearing part.** On a locked keychain `security find-generic-password` **blocks on
an interactive dialog rather than failing**, and the CLI has no no-interaction flag — `nm -u /usr/bin/security`
shows zero `UserInteraction` symbols. Unmitigated, a scheduled run wedges while holding the run lock and nothing
reports it. Wrapping every `security` call in a hard timeout converts that into a failed run, which D30 then
surfaces. Once that is true the remaining exposure is a documented operational precondition rather than a defect.

**`-T /usr/bin/security` buys nothing and is dropped.** `security(1)` states the creating application is trusted
by default, and the creator _is_ `/usr/bin/security`, so the flag reproduces the default ACL exactly — verified
four ways on a scratch keychain. It also hangs when combined with `-U` on the update path. Keychain gives no
caller identity either way; it is chosen for at-rest protection.

Options considered and rejected for the unlock story: a dedicated Wren keychain with non-interactive unlock, which
requires a plaintext keychain password on disk to protect a token — strictly worse than the file we rejected.

The PGP signing subkey stays in the local GPG keyring, passphrase-less, because it is used by an unattended daily
process. 1Password's agent does not fit: SSH-only, defaults to vaults service accounts cannot reach, and
desktop-app-gated. Its approvals are _cached_ ("until 1Password locks", or 4/12/24 hours) rather than
per-request, which does not change the conclusion.

Severity is **Medium**: a conditional failure on a non-default configuration, with a cheap mitigation that makes
it loud.

### D11 — OAuth

Production-unverified avoids the 7-day refresh-token expiry. **That rule is scope-agnostic**, not Gmail-specific:
it applies to any external-user-type project except one requesting only basic identity scopes, and it expires the
whole authorization. An earlier revision attributed it to Gmail scopes, which would have failed to predict that any
future scope addition inherits it.

**Incremental consent was planned and is not possible.** Google states plainly that incremental authorization is
unsupported for installed apps, because the client cannot keep the client secret confidential. P5 therefore
performs a fresh authorization for the complete scope set.

Consequent flow requirements: PKCE `S256`, one-use validated `state`, random loopback port, verification of
returned account and exact granted scopes before replacing any token, atomic replacement. `invalid_grant` recovery
must be general — Google documents seven causes, not just password change.

Both Gmail scopes are **restricted**, so the "unverified app" screen appears at every authorization including
every recovery. Irrelevant at one user; the screen must still be in the runbook.

### D12, D14 — Incremental sync and reprocessing

**D12 — windowed re-list over `history.list`.** Rejected: `history.list` incremental sync, which is what the Gmail
API is designed for. Windowed re-list is idempotent by construction, has no `historyId`-expiry edge case to handle,
and costs nothing at 500 threads. The price is that it cannot detect user-side archive, read, or relabel — which is
why the weekly full reconcile exists rather than being optional. `history.list` is deferred to P5, where label
reconciliation is what finally makes it pay for itself.

**D14 — lazy and selective reprocessing.** Rejected: full re-run on every version bump, which costs hours of local
inference and churns the review queue each iteration; and decide-per-bump, which sets no default and invites drift.
Existing decisions keep their version stamps and remain valid; an explicit action re-runs only review-queue or
low-confidence items.

### D15 — Tone profile representation

Rejected: exemplars only, and deferring the shape until a P2 spike. Exemplars alone make prompts long and the
resulting tone hard to steer — there is nothing to edit when a draft comes out wrong. A distilled style card is
inspectable and correctable by hand, and the exemplars stay as grounding. Sent bodies are purged after extraction
because Gmail remains the source of truth, so re-extraction on a version bump is cheap.

### D16 — Deterministic alert grouping

Rejected: embedding or LLM clustering. Deterministic grouping — `List-Id`, normalized subject, severity from list
name, time bucket — is inspectable, costs nothing per run, and has no model dependency, so it cannot regress when
a model changes. Clustering is deferred until the deterministic version demonstrably fails, and note it would need
its own INV-4 analysis first: neither `/api/embed` nor `/api/embeddings` has a `:local` guard.

### D13, D32, D33 — Write-path controls

Gmail models mailbox state as labels: removing `INBOX` is archiving, removing `UNREAD` is marking read, adding
`TRASH` is trashing. A permitted-method allowlist cannot prevent this because legitimate labelling and destructive
state changes share `messages.batchModify`. Without INV-17, INV-2 and the deferral of auto-archive are both
bypassable through ordinary label writes.

**D32** added INV-19 and INV-20 late, in response to a review. Both carry their full rationale in
`invariants.md` and it is not repeated here. The historical point worth keeping: `labels.delete` was named by no
enumeration in any of the three documents despite being the most destructive method the requested scope
authorizes, and INV-2's entire argument about permanent deletion rested on `mail.google.com` never being
requested — a premise protected only by a runtime doctor check, which change control could not see.

**D33 — the ceiling is 200 message-label effects per run**, counted per message-label pair rather than per API
call, since one `batchModify` can affect 500 messages. The weekly full reconcile is a **read** and consumes none of
it. Neither the value nor an override mechanism had previously been specified anywhere.

### D17 — Draft grounding, and the accepted residual

Drafts are constrained to thread context plus the tone profile. There is no verifier pass in v1; the UI always
displays source context beside the draft, and human review is the safety net.

**"Drafts must not invent facts or commitments" is an accepted residual, not an enforced requirement.** No
mechanism enforces it and no test detects a violation. It is recorded here deliberately, because a review
observed it reads in `plan.md` as a requirement someone is meant to enforce, when in fact it is a property the
design hopes for and does not guarantee. Stating it as a residual is the honest form.

Why no mechanism: a verifier pass would need a second model call per draft, its own prompt version, its own
failure mode, and its own calibration — and it would still be a model checking a model. Human review at the
point of use is cheaper and stronger, and drafts never leave Wren's UI in v1 (INV-7, INV-18), so an invented
commitment cannot reach a recipient without a person choosing to send it by hand.

Revisit if Gmail draft creation is ever enabled, because that removes the human step this residual depends on.

### D19, D27, D34 — Backup and rollback

`VACUUM INTO` is the correct snapshot primitive now that databases are unencrypted (D5).

Publication is atomic: ciphertext and detached signature bundled into one object. Two objects would leave a window
where a crash exposes unsigned ciphertext. The S3 client is reachable only through the signing module, so INV-14's
"no code path uploads without a signature" is structural rather than a property of one call site.

**D34 — the counter is allocated and committed before the snapshot.** Allocating afterward means the snapshot
carries its predecessor's number, which breaks the anti-rollback property the counter exists for. And **a failed
pending retry does not block its successor**: blocking would let one broken signer stop all backups indefinitely
with only a "days since" counter to notice, which is the worse of the two failure modes.

The manifest carries no upload timestamp: it is sealed before upload, so an upload time cannot be known.
`VersionId` and upload time go in the local receipt. Restore order is verify signature → decrypt → read manifest →
check counter, since the manifest is inside the ciphertext. Counter gaps are a signal, not noise — an offline
machine allocates none.

**Freshness after total machine loss** relies on S3 version history, not the local receipt, which dies with the
machine. Enumerate every object version, decrypt each manifest, confirm counters increase in S3's own version
order. An adversary replaying an older signed artifact necessarily creates a newer version carrying a lower
counter; forging a higher one requires the signing subkey. Circularity would only apply to a single artifact in
isolation, not to the ordered set. The escrow envelope also carries the last known counter.

D27: bucket-administrator rollback stays out of scope. It requires compromised AWS credentials, at which point the
attacker still cannot decrypt or forge; deleting newer versions requires `DeleteObject`, which Wren's credentials
lack.

**PGP is retained, and the reason matters.** D27 accepts **rollback** — replaying an older genuine version, worst
case stale data. **Forgery is a different attack.** age
encrypts to a _public_ recipient — the recipient is itself a manifest field — so anyone with bucket write can
produce a decryptable, attacker-authored `state.sqlite` that restore would accept into the trusted local store.
Dropping PGP would replace an origin control with a freshness check. They are not substitutes.

### D20, D22 — Content-exposure trade-offs

**D20 — goldens live in `state.sqlite` and are backed up.** Rejected: pinning them in `cache.sqlite` and accepting
their loss in a disaster. The hand-labelled corpus is the single most expensive artifact in the project to
recreate, and losing it also loses threshold calibration and every benchmark comparison. Storing it in state is the
sole sanctioned exception to raw bodies living only in cache, bounded by the curation checklist rather than by
volume.

**D22 — plaintext-only rendering.** Rejected: sanitized HTML in a sandboxed iframe. Email HTML is untrusted input
to a privileged local application, and remote content leaks IP address and read time to senders — sanitization is a
treadmill against both, where plaintext removes the class outright. Revisit only if plaintext proves genuinely
unusable in practice, not because HTML would be nicer.

### D24, D35 — Ollama

INV-4 originally asserted locality by targeting loopback. That is insufficient: cloud models are invoked through
the same loopback API and proxied to `https://ollama.com`.

Two mechanisms were rejected before landing here. **Disabling cloud on the machine-global install** — ambient
machine-global state that degrades Ollama for every other consumer to make Wren's guarantee true.
**Client-side gates alone** — every gate is advisory, defeated by a stub fabricating local-looking metadata, and
subject to a TOCTOU race where `ollama cp` repoints a name between validation and use.

Adopted: Wren runs its own `ollama serve` with `OLLAMA_NO_CLOUD=1` in that process's environment only, on a
dedicated loopback port. The machine-global instance is untouched and stays cloud-capable. Gates are retained as
defence in depth, and Gate A remains necessary because it is the only control catching a _local_ model carrying a
cloud-routing name.

`OLLAMA_MODELS` is shared to avoid duplicating tens of gigabytes. Safe because the process-level cloud disable
closes the egress path regardless of what a name points at; an externally repointed name yields a fail-safe 403.

**D35 — digests are pinned because locality is not integrity.** Every INV-4 gate asserts locality, and a
_substituted local_ model satisfies all of them: repoint an allowlisted name at a backdoored local GGUF and Gates
A through F pass. INV-4 is not violated — the model genuinely is local — which is precisely why a separate control
is required. `invariants.md` previously asked doctor to check "digest matching" with no baseline to match against.
Digests are now recorded in the model allowlist via explicit `wren models add` provisioning, never implicitly on
first use. Note the digest is the manifest hash, not a hash of the weights, so it detects repointing rather than
weight tampering.

### D30 — Failure handling

The documents promised loud failure in five places and provided no channel for any of it. Logs go to a file nobody
watches, hosted telemetry is banned by INV-5, and Wren cannot email by INV-1. "Alarm" was used as a verb with no
referent. Realistic steady state of a broken Wren was: nothing happens, nothing is reported, discovery weeks later.

Chosen: a local `osascript` notification on non-zero worker exit, plus a persistent banner on every view when the
last run failed or the last success exceeds 36 hours. Both, because they fail differently — the notification is
push, the banner is the backstop when notifications are suppressed. Wren's consumption model is already pull, so a
stale Today page is itself a weak signal; the banner makes it explicit rather than inferred.

**Notification without remediation is not actionable**, so each doctor check declares a remediation string and,
where possible, an action: re-authenticate, retry, restart Wren's Ollama, re-pin a digest, override the ceiling for
one run, retry pending backups, force-release a dead run lock.

**The manual trigger routes through `launchctl kickstart`, not a direct spawn from the SSR server.** The server's
environment came from however it was started and is not the launchd environment, so a directly-spawned "Run now"
could succeed while the 10:00 run fails, or the reverse — giving false confidence in the exact mechanism under
test. Routing through launchd exercises the identical path.

Two gaps accepted deliberately: no same-day automatic retry after an in-session failure, and a LaunchAgent the user
disables in System Settings is not detectable by `kickstart` succeeding, so doctor checks registration separately.

### D36 — `age` and `gpg`

The documents governed npm dependencies meticulously — exact pins, bump processes, a paragraph on Atlas's checksum
coverage — and said nothing about the two binaries performing every encryption and signature in the system.
Neither was installed. They are now pinned dependencies with recorded versions in the backup manifest and doctor
presence and version checks.

### D37 — Classification outputs and the label vocabulary

`cleanup` is UI-only and may never drive a Gmail mutation. Letting a classification write to the mailbox would
bypass the shadow-labelling gate (D21) and pre-empt the auto-archive deferral — `archive_candidate` exists to
populate a list a human acts on, nothing more.

The label vocabulary is a closed enum under a `Wren/` namespace rather than free-form model output, so INV-17's
positive allowlist has something finite to derive from. A key outside the enum routes the decision to review and
applies no label, which fails closed. Semantic keys must not shadow Gmail system label names.

### D25 — Dependency governance

Exact pinning is hygiene, not a security control; the lockfile already determines resolution. `ignore` with a
version ceiling means "deliberately staying on this line"; auto-merge exclusion means "notify me, let me decide."
Both are used for different dependencies.

Group exclusion accompanies auto-merge exclusion because `patterns: ['*']` would otherwise let one privileged
dependency hold a group of unrelated updates hostage — the auto-merge guard would correctly hold the PR, and the
28 safe updates inside it with no way to merge them separately. Demonstrated in practice: `@ariga/atlas` reached
1.3.1 inside a 29-update patch group.

Secret-consuming Actions are excluded for an independent reason: auto-merged action code receives the 1Password
service-account token and GitHub App private key on the next run.

The engine bump process is a **compatibility check**, not a disaster-recovery drill — the data does not change, but
the engine is the code that reads it, and at 0.x there is no stability contract at all. Turso publishes no semver
policy and its changelog has no entries for 0.7.1 or 0.7.2 despite both being published, so "patch is safe" has no
basis; 0.7.0 landed write-statement serialization with transaction poisoning inside a minor. The compatibility
check is the only signal.

Atlas is **not** a dev-time tool under this plan's own rules, since it is the only thing permitted to write
`~/.wren/db/`. Its installer fetches a remote shell script, writes it executable, runs it, and then downloads a
binary — two unverified hops, with the lockfile covering only the npm tarball, and the Socket Firewall mitigation
scoped to CI rather than the laptop where the write-capable binary runs. Accepted residual, recorded rather than
mitigated. It is also EULA-licensed rather than Apache-2.0, so installation constitutes acceptance.

### D38 — Sub-phases, and why phases are never renumbered

P1 had grown to roughly twice the size of any other phase — 599 words and 29 task bullets against a median near
150 and 4 — spanning six largely independent subsystems: persistence, machine provisioning, runtime safety, local
inference, Gmail authorization, and the operator surface. Its acceptance gate had twelve criteria.

Size alone would be tolerable. The real defect was that **P1 had no intermediate provable state**: nothing could be
demonstrated until all of it landed, so the phase gated nothing. A phase boundary exists to answer "may I proceed
yet," and a gate that can only be evaluated at the very end does not answer it.

Split into P1a (persistence), P1b (machine provisioning), P1c (runtime safety), P1d (local inference), P1e (Gmail
authorization), P1f (operator surface). Each has a one-line demonstrable end state and its own acceptance gate.
Ordering is `P1a → P1c → P1b → P1f`. RunLock needs P1a's `runs` table; **P1c precedes P1b so the redaction-capable
logger exists before P1b loads a service-account token into a configuration that is otherwise dumped whole at
`info`** — a window an audit flagged and two verifiers refuted on the grounds that the redaction list is
schema-tied, which is true but does not help, because that list does not exist until P1c builds it. P1d is
independent; P1e needs P1b for client credentials.

**Renumbering was rejected**, and the reason generalises to any future restructuring. Ninety-nine phase references
exist across the three documents, roughly eighty of them in `invariants.md` and `decisions.md`. Shifting P2→P6 and
so on would edit historical entries in this document, which is **append-only by its own rule** — a decision
recorded in the past would silently acquire a phase number that did not exist when it was made. Sub-phases preserve
every existing reference: `P1` remains valid as an umbrella meaning P1a through P1f complete. Precedent already
existed in P4.5.

**Phase numbers and decision numbers are not the same case.** Phase numbers are referenced from `invariants.md`,
which is permanent and operative, so renumbering them breaks live pointers as well as rewriting history. Decision
numbers are internal to this document and, before the D26 baseline, referenced from nowhere else — so they were
renumbered once to close a gap, and become fixed at the first commit of implementation code along with everything
else here.

`invariants.md`'s "Enforced from" column was refined to sub-phase granularity at the same time, which is where the
change pays for itself: "Enforced from P1" was too coarse to tell an implementer which gate blocks, whereas
"P1c secrets, P2 content, P3 artifacts" names them exactly. Every bare `P1` in that document now resolves to a
sub-phase.

**Observation not acted on:** P2 is 184 words and 7 bullets, but several bullets bundle three or four distinct
pieces of work, so it is probably comparably large and merely under-described rather than genuinely smaller.
Splitting it well requires knowing more about the pipeline than the plan currently specifies. Revisit after P1a
lands and the real schema exists, rather than inventing a split now.

### D26 — Document lifecycle

The durable artifacts are decisions and invariants, not the plan. Review artifacts are transient evidence: once
every finding is dispositioned into a decision, an invariant, or a code change, the review file is archaeology.
The test is whether a reader of this document alone understands why. Consequently the decision register lives here
rather than inside `plan.md`, so it survives the plan's deletion.

**Append-only takes effect at the first commit of implementation code.** Until then this document records the
history of _planning_, not of a system, and there is no system whose evolution needs preserving. This revision is
the baseline: it was consolidated once, deliberately, before P0 began. After that first commit, entries are added
and never rewritten — a reversed decision gets a new entry superseding the old one.

**Retiring `plan.md` is a procedure, not a deletion.** `invariants.md` is permanent and _operative_ — it states
what must be true now — and it carries 61 references to the plan's phase structure, 30 of them in the "Enforced
from" column the acceptance-gating rule depends on. Deleting the plan without addressing those would leave a
permanent document pointing at nothing, failing the very test above. In order:

1. **Convert "Enforced from" into "Enforced by."** Replace each phase with the name of the test that enforces the
   invariant. During execution the useful question is _when does this land_; afterwards it is _where do I look_.
   The `test:invariants` registry built in P0 (D40) already maps invariant ID → test name → owning sub-phase, so
   this is mechanical rather than archaeological.
2. **Strip the `Pn` prefixes** from enforcement bullets and the `_Pn:_` labels from tests. They disambiguate the
   two halves of a split invariant during execution and are noise once both halves exist.
3. **Rewrite the Verification section's** phase references the same way.
4. **Only then delete `plan.md`** and publish the architecture document.

This document's own ~57 phase references are exempt, and the distinction is **operative versus historical**: a
document saying what must be true _now_ cannot carry dangling references, while one recording what was decided
_then_ can. "Needed before P6" stays true as a statement about a decision made at a point in time.

The procedure is recorded here rather than in `plan.md` for the obvious reason: a retirement procedure stored
inside the artifact being retired dies with it.

### D39 — Version numbers in documentation are provenance, never current state

A stale `>=24.18` in `plan.md` against a repo that had moved to `>=24.19` produced an audit finding. The value was
authoritative in five manifests and `.tool-versions`; the document restated it and drifted. Restating any value
that lives authoritatively in a repo file guarantees eventual drift, and each restatement is a latent finding.

The rule:

- **Permanent documents state versions only as provenance** — "verified at Ollama 0.32.6", "the npm client at
  0.6.3 contains no references to…", "triggers stopped being experimental in Turso 0.6". These _must_ keep their
  numbers, because the fact's validity is scoped to the version it was measured against. A provenance claim does
  not decay; it becomes historical.
- **Neither permanent document states a current dependency version.** Where the current version matters, cite the
  manifest. Tasks and acceptance criteria say "the pinned Atlas version", not a literal.
- `plan.md`'s "Current Repo" section is an explicitly **dated snapshot** and says so in its own heading, with the
  authoritative file cited for each value. A stale number there is an observation that aged, not a defect in the
  repo — and the section is deleted with the plan anyway.
- Wren's own document version numbers are self-referential and unaffected.

A CI drift-check was considered and rejected as disproportionate: the exposure is confined to one transient
snapshot section, and not restating the value is cheaper than detecting that the restatement went stale.

### D40 — What belongs in this document

Append-only does not make a document grow; writing things that do not belong does. Periodic consolidation treats
the symptom. This rule is the durable fix, adopted at the D26 baseline.

**Record:**

- The decision, stated once.
- The alternatives rejected, and why — this is the part a future reader cannot reconstruct.
- Constraints discovered along the way that bound the decision, with their evidence.
- A claim refuted **more than once**. That is a guard, not a story: the entry is what prevents a third round.

**Do not record:**

- The narrative of how a decision was reached, or which reviewer said what.
- Severity ratings that were later adjusted, unless the adjustment itself changed a decision.
- Corrections to intermediate drafts that no longer exist. If the current text is right, the wrong version it
  replaced is not interesting — unless someone acted on it, in which case it belongs in the withdrawal log.

**The test:** would a competent engineer joining at P4 need this to avoid repeating a mistake or re-opening a
settled question? If not, it is archaeology. Verified external facts are exempt — they are an appendix of
primary-source claims, and their whole value is saving someone the re-verification.

## Superseded, Retracted, and Adjusted

Recorded so these are not re-raised.

### Withdrawn twice: "the documented migration workflow does not run"

**Claim:** the workflow in `packages/graph-manager/readme.md` fails, destroys triggers, and emits a phantom
migration. Raised by two independent reviews; wrong both times.

**Correct position:** the workflow uses **two distinct databases**. `atlas migrate apply` builds the application
database; `drizzle-kit push` populates a _separate, new, empty_ throwaway that is the diff target. Verified under
that reading — the application database keeps both triggers and its revision table, and a no-op diff reports
_"The migration directory is synced with the desired state, no changes to be made."_

**Why it looked true:** reading `<database>` as one placeholder used consistently makes push target the database
Atlas just built. Under _that_ reading every reported symptom is real. The readme now uses distinct
`<database-dsn>` and `<desired-database-dsn>` placeholders.

**Also withdrawn:** that D6 is false; that push destroys triggers in normal use; the `exclude =
["atlas_schema_revisions"]` remedy; the first round's `triggers.sql` artifact; and the claim that a triggerless
scratch database makes Atlas emit `DROP TRIGGER` — Atlas cannot see triggers at all (D29).

**Corrected, not withdrawn:** an earlier revision of this document explained the retraction as _"push converges
tables on that existing database … both sides of the diff have them."_ That describes the misreading. Push targets
a separate database, and triggers are absent from both sides because Atlas is trigger-blind.

**Process lesson.** The first round was criticised here for propagating a finding without executing it. The second
round _did_ execute it — faithfully, in scratch directories, with reproducible output — and reached the same wrong
conclusion, because it executed the wrong interpretation. **Carefully reproducing a misreading is worse than not
testing, because the output looks like evidence.** Establish what a documented process was intended to mean before
concluding it is broken. Now an execution rule in `plan.md`.

### Adjusted: severity of the INV-3/INV-7 contradiction

Rated Critical by a review; recorded as High and since fixed. The contradiction was real and had to be resolved
before P5, but it had zero exploitability — `mail-agent` was a scaffold and P5 was five phases out. Rating it
alongside an active egress path flattened the severity scale.

### Adjusted: cache deletion remediation

A finding correctly noted that SQLite does not zero deleted pages and that Turso may not support `secure_delete` —
verified, it does not. The recommended remediation (byte-level residue tests, `umask 077`, private temp
directories, WAL scrubbing) was trimmed to `PRAGMA temp_store = MEMORY` plus a documented delete-and-rebuild
procedure. Disproportionate to the threat on a FileVault'd single-user machine where the cache is rebuildable by
design.

### Adjusted: scaffold-stage test and logging findings

Two findings recommended removing `--passWithNoTests` from `mail-agent` and adding logger redaction there
immediately. Both were rescoped: `mail-agent` has no tests and handles no sensitive data, so acting then would
break CI and add configuration with no subject. Retained substance: the flag is removed when its first real test
lands in P2; redaction lands where data lands, secrets in `console-portal` at P1 and email content in `mail-agent`
at P2; and no phase may cite a vacuous suite as acceptance evidence.

The generalized rule: **an invariant's enforcement phase tracks when the data it protects first exists**, not when
the document was written. `invariants.md`'s "Enforced from" column now splits by mechanism where they differ.

### Withdrawn: vendoring the Atlas binary

Suggested committing a checksum-verified binary, or replacing the npm dependency with `.tool-versions`. Withdrawn:
Atlas is a devDependency CLI in the same category as eslint and prettier, npm installation is more ergonomic, and
committing binaries is worse than the risk it mitigates. The genuine distinction is checksum coverage — eslint's
tarball contains the executing code, Atlas's contains an installer — not implementation language. See D25 for the
accepted residual.

### Adjusted: `experimental: ['triggers']`

The state-database branch dropped the `'triggers'` flag while the cache branch preserved it, and this was
described as a latent data-integrity defect. It is inert: the JS binding has no match arm for the value and does
not validate the array — `experimental: ['bogus_feature']` is silently accepted — and triggers work with no flag
at all. Removing it is still correct; calling a no-op a data-integrity defect would misrank the fix. Triggers
stopped being experimental in Turso **0.6**, not 0.7 — Turso's own documentation carries the 0.7 error.

### Rejected: 1Password for the PGP signing key

1Password provides an agent, but it is SSH-only, defaults to built-in vaults service accounts cannot access, and
requires an unlocked desktop app. Switching from PGP to SSH signatures was also considered and not adopted, since
the key would still need to be local and passphrase-less for an unattended job.

## Open — Requires the Author

One item cannot be defaulted, because it is infrastructure the author owns rather than a design choice.

| Item                                     | Blocks                                                                                                                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S3 bucket name, region, and endpoint** | INV-3's egress allowlist cannot be completed without the exact endpoint, and P6 cannot be executed. Needed before P6; harmless to leave open through P0–P5. Everything else the plan needs has a provisional value. |

Values marked **provisional** in `plan.md` are deliberate defaults, not oversights: the write-ceiling override
(1000 effects), `busy_timeout` (5000 ms), sync overlap margin (48 h), 429/5xx backoff (base 1 s, factor 2, cap
60 s, five attempts), alert-grouping buckets (6 h) and severity mapping, S3 lifecycle (90-day noncurrent
expiry), log retention (14 days or 50 MB), and the thirteen-key label enum. Each is written down so no
implementer has to invent one, and each is expected to be revised by P3/P4 calibration or P4.5 shadow results. A
written-and-wrong value is cheaper to correct than a blank.

## Accepted But Deferred

Findings acknowledged as valid and consciously not addressed in v1. Recorded so they are not re-raised as new.

| Item                                                                         | Reason                                                                               |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| No same-day automatic retry after an in-session run failure                  | Notification plus **Run now** is the recovery path; a retry scheduler is P8 at best  |
| Service-account token rotation runbook and recorded creation parameters      | Rotation is manual and web-UI-only; no automation exists to document                 |
| Atlas installer's two unverified network hops                                | Vendoring rejected; accepted residual, see D25                                       |
| `graph-manager`'s permissive `drizzle-orm` peer range                        | Peer ranges are intentionally permissive; the exact-pin _claim_ was narrowed instead |
| Long-held `VACUUM INTO` read snapshot potentially starving WAL checkpointing | Mechanism plausible, unmeasured, and Turso does not document it either way           |
| Gmail `after:` operator granularity                                          | Unverified; the overlap margin absorbs a full day if it rounds                       |
| Grammar-constrained decoding interacting with `temperature 0`                | Officially recommended combination; repetition-loop risk unmeasured                  |
| Storybook, three-browser Playwright matrix, two-locale i18n                  | Inherited template weight; retained rather than pruned                               |
| The separate probe server on its own port                                    | Inherited Kubernetes ergonomics in an app that is never deployed                     |
| Background Task Management: a user-disabled LaunchAgent                      | Doctor checks registration state; no way to prevent the user disabling it            |

## Verified External Facts

Verified against primary sources or by on-machine execution. Recorded so the review and research documents can be
deleted.

### Gmail API and OAuth

- `gmail.modify` authorizes `messages.send`, `messages.trash`, `drafts.create/update/delete`, `messages.insert`,
  `messages.import`, and `labels.delete` in addition to labelling. Permanent deletion of messages and threads
  requires `mail.google.com`.
- **No scope narrower than `gmail.modify` can attach a label to a message.** `messages.modify`,
  `messages.batchModify`, and `threads.modify` each accept only `mail.google.com` or `gmail.modify`;
  `gmail.labels` manages label resources and cannot apply one.
- Every Gmail **settings** mutation requires a settings scope, so all are unreachable under `gmail.modify`.
- `users.watch` is authorized by `gmail.readonly` and creates a persistent server-side push registration.
- Testing publishing status issues refresh tokens expiring in 7 days. The rule is **scope-agnostic** except for
  basic-identity-only requests, requires external user type, and expires the whole authorization.
- Both Gmail scopes are **restricted**, so unverified-production shows the warning screen at every authorization
  and carries a lifetime 100-user cap.
- **Incremental authorization is not supported for installed apps or devices**, stated twice in Google's
  native-app guide.
- `invalid_grant` has seven documented causes, including six months unused and exceeding max live refresh tokens.
- Gmail list methods return at most 500 results per page with a page token.
- Gmail refuses to apply or remove the `DRAFT`/`SENT` labels on messages, so those denylist entries are inert.

### Ollama

- Cloud models are offloaded to Ollama's cloud service and invoked through the local API. The FAQ states: _"When
  using cloud-hosted models, we process your prompts and responses to provide the service."_
- Verified at 0.32.6: `ollama pull gpt-oss:120b-cloud` succeeded **with no sign-in** and `/api/chat` returned a
  real completion. "Not signed in" is not protection.
- The name suffix is a **routing directive, not a description**: a fully local model copied to
  `myqwen:0.5b-cloud` sent its prompt upstream, and `ollama cp` produces cloud-routing models with innocuous
  names. `-cloud` matching is wrong in both directions.
- `digest` is the SHA-256 of the **manifest file**, not the weights. Cloud stubs have one.
- Positive local evidence: populated `layers[]`, `size` in hundreds of MB rather than ~307 bytes,
  `details.format === "gguf"`, populated `model_info`, a `tensors` array, absent `remote_host`/`remote_model`.
  `remote_*` are `omitempty`, so absence rather than emptiness is the signal.
- `GET /api/status` returns `{"cloud":{"disabled":<bool>,"source":"none|env|config|both"}}`. Undocumented and
  internally marked experimental, verified in both states.
- The `:local` suffix returns 404 rather than proxying when the manifest is remote, and 400 when combined with
  `-cloud`. There is no request field or header for local-only execution.
- Cloud disable: `OLLAMA_NO_CLOUD=1` or `disable_ollama_cloud` in `~/.ollama/server.json`; logs show
  `Ollama cloud disabled: true`. A process-scoped env var yields `{"disabled":true,"source":"env"}` and a 403 on
  cloud chat, leaving the machine-global instance untouched.
- The `ollama` npm client (0.6.3) contains zero references to `remote_host`, `remote_model`, or `/api/status`.
- Structured outputs are grammar-enforced: the schema is passed to llama-server's `json_schema` field for
  sampler-level enforcement. **But the MLX runner defines no `Format` field and never copies it**, so the request
  succeeds with unconstrained prose and no error. Every current library model publishes `-mlx` tags.
- llama.cpp's schema-to-grammar converter silently ignores `patternProperties`, `not`, `if/then/else`,
  `uniqueItems`, `multipleOf`, and `propertyNames`, and degrades `pattern` to any string. Post-validation is
  mandatory.
- `/api/show` populates `tensors` unconditionally only for GGUF; safetensors/MLX require `verbose: true`.
- Neither `/api/embed` nor the legacy `/api/embeddings` has a `:local` guard.
- **Non-inference egress exists by design.** The Ollama server itself polls `ollama.com` roughly every 4 hours
  (`server/model_recommendations.go`) and hydrates a show cache at startup (`server/model_show_cache.go`). Neither
  carries email content, and `OLLAMA_NO_CLOUD=1` is not claimed to stop either — so Wren's supervised instance
  makes periodic outbound connections, and observing them is not an INV-3 or INV-4 breach.
- `/api/ps` residency with `size_vram > 0` is a reliable **post-hoc** positive locality signal: cloud requests
  return before `s.scheduleRunner` and never enter the scheduler, so they never appear there. It is useless as a
  pre-flight gate, since the model is not resident until after a request. Evaluated and not adopted.
- `remote_host` and `remote_model` on `/api/tags` are documented in Ollama's own `openapi.yaml` (`ModelSummary`),
  so INV-4 Gate B's primary signal rests on a published API contract rather than an incidental implementation
  detail. This is the durability argument for keeping Gate B across Ollama upgrades.

### Turso

- At-rest encryption is **experimental**; key rotation and encrypting existing databases are unreleased.
- `VACUUM INTO` **does not carry encryption to the destination**. Encrypted files are Turso-only format — the magic
  bytes are `Turso`, not `SQLite format 3`.
- **Triggers stopped being experimental in 0.6.** The flag is inert regardless: the JS binding has no match arm and
  does not validate the `experimental` array.
- **`PRAGMA secure_delete` is not supported** — absent from the complete PRAGMA reference.
- In-place `VACUUM` is experimental; `VACUUM INTO` is not, and it leaves a zero-length `-wal` sidecar.
- **`PRAGMA auto_vacuum` read through `prepare().all()` panics the Rust binding and aborts the process** (`index
out of bounds`, SIGABRT). Use `exec()`. This is on P6's path because `VACUUM INTO` requires the source not be
  `auto_vacuum = incremental`.
- **Every query blocks the event loop.** The promise wrapper loops on `stepSync()` awaiting a microtask. Measured:
  `SELECT COUNT(*)` over 294 MB blocked ~63 ms with zero ticks; `VACUUM INTO` ~1.1 s.
- Only WAL and MVCC journal modes; only `synchronous` `OFF` and `FULL`. `PRAGMA require_where = 1` rejects
  `UPDATE`/`DELETE` without a `WHERE` clause.
- The changelog has no `0.7.1` or `0.7.2` section despite both being published, and Turso publishes no semver or
  stability policy. 0.7.0 landed write-statement serialization with transaction poisoning.

### Atlas

- **Atlas gates trigger support behind the Pro plan.** Verified unauthenticated at 1.3.1: `atlas schema inspect`
  reports zero triggers against a database containing two, and dropping both produces a diff mentioning none.
  Failure mode is a clean, successful, silently incomplete migration.
- ariga/atlas#2700 — open, SQLite, `updated_at` trigger — reports triggers are not re-created after a column change
  even with support enabled, because Atlas emits the table-rebuild sequence and SQLite drops triggers with the
  table.
- `migrate diff` has **no `--exclude` flag**; exclusion belongs in an `atlas.hcl` env.
- Atlas's URL reference documents `sqlite://` for local files and `libsql+ws://`/`libsql://` for libSQL servers.
  **`libsql+file://` is not documented** but works; affirmative evidence is the driver registration in
  `sql/sqlite/driver.go` (`RegisterFlavours("libsql+ws", "libsql+wss", "libsql+file")`).
- `drizzle-kit export` supports the turso dialect, but Atlas `external_schema` against it emits a **full table
  rebuild of every table on a no-op diff** — verified — which destroys triggers. Atlas's `composite_schema` is
  itself Pro-gated.

### 1Password

- Service accounts authenticate via `OP_SERVICE_ACCOUNT_TOKEN` and **cannot access built-in Personal, Private,
  Employee, or default Shared vaults**. Vault access is fixed at creation. Service accounts **are** available on
  Individual/Families plans.
- Limits: 1,000 read/write per 24 h per account (shared across service accounts) and 1,000/hour per token. A 429
  says _"Please retry in 59 minutes"_, so ordinary backoff cannot recover in-run.
- `op read` costs 3 requests per name-based reference, 1 with item and vault IDs.
- `op run` **conceals secrets printed to stdout by default**, which rewrites log lines containing secret values.
- `OP_CONNECT_HOST`/`OP_CONNECT_TOKEN` **take precedence over** `OP_SERVICE_ACCOUNT_TOKEN`.
- The 1Password agent is **SSH-only**, defaults to built-in vaults, requires an unlocked desktop app, and caches
  approvals rather than prompting per request.

### macOS

- `security find-generic-password` **blocks on an interactive dialog** when the keychain is locked; the CLI imports
  no `UserInteraction` symbols and cannot suppress it. It also does not import `SecKeychainGetStatus`, which is why
  it hangs rather than reporting.
- `-T /usr/bin/security` **reproduces the default ACL exactly** — `security(1)`: _"By default, the application
  which creates an item is trusted to access its data without warning."_ `-A` sets `applications: <null>` and
  Apple flags it as insecure. `-U` combined with `-T` hangs even when unlocked.
- `SecKeychainGetStatus` separates `0x7` unlocked from `0x2` locked non-interactively; a missing item returns
  `-25300` even on a locked keychain. Apple documents this as the way to verify lock state.
- launchd `StartCalendarInterval` coalesces missed firings across sleep and skips them across power-off;
  `RunAtLoad` covers boot and login. `StartInterval` and `StartCalendarInterval` are documented as unaware of each
  other, so behaviour must not be inferred across them.
- **launchd has no dependency model.** `OtherJobEnabled` is a `KeepAlive` sub-key evaluating whether a job is
  _loaded_, not running, and is documented as highly discouraged. Readiness must be polled.
- **`ProcessType` left unspecified applies light resource limits, throttling CPU and I/O.**
- LaunchAgents receive a minimal `PATH`, so binaries must be invoked by absolute path.
- Since macOS 13, a newly installed LaunchAgent appears in Login Items where the user can disable it.
- Docker Desktop on macOS has no GPU passthrough, so containerized inference cannot use Metal.
- Node ≥17 resolves `localhost` with `verbatim` ordering, offering `::1` first, but `autoSelectFamily` (Happy
  Eyeballs) is on by default — so a server bound only to `127.0.0.1` is still reachable via `localhost`. The Host
  allowlist must therefore cover both forms.

### AWS

- Inspecting object version history requires `s3:ListBucketVersions`; `s3:ListBucket` alone is insufficient.
- S3 Object Lock can prevent versions being overwritten or deleted, if rollback protection comes into scope.

### Tooling

- `dependabot/fetch-metadata` joins `dependency-names` with **`', '`** (comma-space), verified in
  `src/dependabot/output.ts` at the pinned SHA. Guard logic that splits on the separator must tolerate both forms,
  since splitting on comma-space alone fails **open** if the format ever changes.
