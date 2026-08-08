# @wren/graph-manager

> Schema management and utilities

[![Code Style](https://flat.badgen.net/badge/code%20style/prettier/ff69b4)](https://github.com/prettier/prettier)

## Setup

The following external dependencies are needed to perform the various tasks
defined within the package configuration files (package.json). Please follow the
installation instructions for each dependency to get started.

- [Node.js](https://nodejs.org/en/download)
- [Yarn](https://yarn6.netlify.app/getting-started)

## Getting Started

Install the project dependencies:

```shell
yarn install
```

## Scripts

- `yarn run build` — build artifacts and compiled output ([Rolldown](https://rolldown.rs))
- `yarn run clean` — remove artifacts, compiled output, and logs
- `yarn run format` — perform stylization ([Prettier](https://prettier.io))
- `yarn run lint` — perform static analysis ([ESLint](https://eslint.org) and [TypeScript](https://typescriptlang.org))
- `yarn run refine` — perform stylization and static analysis

### Style

Edit unformatted files in-place:

```shell
yarn run format --write
```

### Static Analysis

Automatically fix JavaScript problems:

```shell
yarn run lint:javascript --fix
```

## Database

Initialize a development ready database:

```shell
# Apply database migrations
yarn run atlas migrate apply --dir=file://migrations/<database> --url='libsql+file://<database>'
```

Capture the desired state of the database:

```shell
# Push the current schema directly to the database
yarn run drizzle-kit push --dialect=turso --schema=src/database/<database>/schema.ts --url='<database>'

# Create a database migration file
yarn run atlas migrate diff --dev-url='libsql+file://dev?mode=memory' --dir=file://migrations/<database> --format='{{ sql . "    " }}' --to='libsql+file://<database>' <name>
```
