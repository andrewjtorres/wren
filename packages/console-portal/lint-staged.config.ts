import type { Configuration } from 'lint-staged'

const config: Configuration = {
  '*.css': ['stylelint --cache --cache-location=node_modules/.cache/stylelint/ --fix=strict'],
  '*.[jt]s?(x)'(filePaths) {
    const filePathsList = filePaths.join(' ')

    return [
      `eslint --cache --cache-location=node_modules/.cache/eslint/ --fix ${filePathsList}`,
      'react-router typegen',
      'tsc --build',
      `vitest --config=config/vitest/vitest.config.unit.ts related ${filePathsList}`,
    ]
  },
  '*.@(json|md|webmanifest|yml)': [
    'prettier --cache=node_modules/.cache/prettier/ --ignore-path=.prettierignore --log-level=warn --write',
  ],
}

export default config
