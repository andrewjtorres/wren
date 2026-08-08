# @wren/console-portal

> Control surface and runtime

[![Code Style](https://flat.badgen.net/badge/code%20style/prettier/ff69b4)](https://github.com/prettier/prettier)

## Setup

The following external dependencies are needed to perform the various tasks
defined within the package configuration files (package.json). Please follow the
installation instructions for each dependency to get started.

- [Node.js](https://nodejs.org/en/download)
- [Yarn](https://yarn6.netlify.app/getting-started)
- [Docker](https://docker.com/get-started)
- [1Password](https://developer.1password.com/docs/cli/get-started)

## Getting Started

Install the project dependencies:

```shell
yarn install
```

## Environment

### 1Password

Run a command with secrets injected into the environment:

```shell
op run --account=<account> --env-file=.env -- yarn run <script>
```

## Scripts

- `yarn run clean` — remove artifacts, compiled output, and logs
- `yarn run dev` — start the application in development mode
- `yarn run format` — perform stylization ([Prettier](https://prettier.io))
- `yarn run lint` — perform static analysis ([ESLint](https://eslint.org), [Stylelint](https://stylelint.io),
  and [TypeScript](https://typescriptlang.org))
- `yarn run refine` — perform stylization and static analysis
- `yarn run studio` — start the UI development server ([Storybook](https://storybook.js.org))
- `yarn run test` — perform unit ([Vitest](https://vitest.dev)), component, and
  end-to-end ([Playwright](https://playwright.dev)) tests

### Style

Edit unformatted files in-place:

```shell
yarn run format --write
```

### Static Analysis

Automatically fix CSS problems:

```shell
yarn run lint:css --fix=strict
```

Automatically fix JavaScript problems:

```shell
yarn run lint:javascript --fix
```

### Test

Start the unit test development server:

```shell
yarn run test:unit --coverage --ui --watch
```

Start the component test development server:

```shell
yarn run test:component --ui
```

Start the end-to-end test development server:

```shell
yarn run test:end-to-end --ui
```

Update component and end-to-end screenshots in an emulated Continuous
Integration environment:

```shell
docker run --env=CI=true --interactive --network=host --platform=linux/amd64 --rm --tty --volume="$(pwd)/../..:/work" --workdir=/work mcr.microsoft.com/playwright:v1.62.1-resolute /bin/bash
corepack enable yarn
yarn install
yarn workspace @wren/console-portal run playwright install --with-deps chrome firefox webkit
yarn workspace @wren/console-portal run concurrently --group --passthrough-arguments --raw 'yarn run test:component {@}' 'yarn run test:end-to-end {@}' -- --grep='@visual' --update-snapshots
```
