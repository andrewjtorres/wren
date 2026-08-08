import type { Configuration } from 'lint-staged'

const config: Configuration = {
  '!(packages/**)*.[jt]s'(filePaths) {
    const filePathsList = filePaths.join(' ')

    return [`eslint --cache --cache-location=node_modules/.cache/eslint/ --fix ${filePathsList}`, 'tsc --build']
  },
  '!(packages/**)*.@(json|md|yml)': [
    'prettier --cache=node_modules/.cache/prettier/ --ignore-path=.prettierignore --log-level=warn --write',
  ],
}

export default config
