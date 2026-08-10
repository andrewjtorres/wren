# @wren/common

> Shared utilities and primitives

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
- `yarn run test` — perform unit ([Vitest](https://vitest.dev)) tests

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

### Test

Start the unit test development server:

```shell
yarn run test:unit --coverage --ui --watch
```
