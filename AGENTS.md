# Wren — Agent Instructions

Wren is a local-only Gmail intelligence system. It never sends email, never deletes email, and
runs all inference locally.

## Documents

Read these before implementing anything.

| Document             | Status    | Role                                                                                          |
| -------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `docs/invariants.md` | Permanent | Changing one requires the change control process it defines.                                  |
| `docs/decisions.md`  | Permanent | Records the alternatives rejected alongside each decision. Consult before proposing a change. |
| `docs/plan.md`       | Transient | Read the phase you are implementing in full.                                                  |

Precedence is invariants, then decisions, then plan. They override your own judgement.

Read a package's `readme.md` before working in that package.

## Verify

Nothing is complete until this passes:

```shell
yarn run turbo run format lint:javascript lint:typescript test:unit
```

Run `yarn constraints` as well, once `yarn.config.cjs` exists.

## Conventions

Not all of these are mechanically enforced. Follow them anyway.

**TypeScript.** Node executes `.ts` directly — no `tsx`, no build step for scripts. Never create
`.mjs` files. The only `.cjs` file is `yarn.config.cjs`, which Yarn requires by that name.

**Configuration lives closest to what it governs.** Shared configuration lives in the root
`eslint.config.ts` as named exports, composed by each package. A rule needed by only one package
belongs in that package's config, not in root.

**Follow the shape of what exists.** Before writing a config, read the equivalent in another
package and match its structure. Packages carry only the configs they need, but the ones they
carry look alike.

**Packages declare their own dependencies.** `nmHoistingLimits: workspaces` means an undeclared
import fails to resolve. That is how architectural boundaries are enforced — do not work around
it.

**Tests are colocated** in `src/` as `*.unit.test.ts`.

**Conventional commits**, matching the existing log.

## When there is no precedent

**Stop and ask.** Do not invent a new top-level directory, configuration format, file extension,
or project structure. If a task appears to require one, say so and wait.

The same applies to design decisions. If an acceptance criterion cannot be met without choosing
something the documents left open, stop. Do not choose and proceed.

## Reporting

Every report separates two things:

1. **What the task specified**, and how you implemented it.
2. **What you chose**, that the task did not specify.

Never present a discretionary choice as a requirement.

Demonstrate acceptance criteria with command output. A criterion you cannot demonstrate is not
met — report that, rather than reasoning that it is probably fine.

## Constraints

- Never `git push`. Commit locally and report.
- Do not upgrade dependencies. Pins are deliberate and explained in `docs/decisions.md`.
- Do not modify machine state outside the repository — no Keychain, no `launchctl`, nothing under
  `~/.wren`.
