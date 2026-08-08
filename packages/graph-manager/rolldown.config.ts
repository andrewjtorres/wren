import { defineConfig } from 'rolldown'
import { dts as dtsPlugin } from 'rolldown-plugin-dts'

import packageJson from './package.json' with { type: 'json' }

const dependencyNameList = Object.keys({ ...packageJson.devDependencies }).join('|')

const builtinModuleNamePattern = /^node:/
const dependencyNamePattern = new RegExp(`^(?:${dependencyNameList})(?:/.+)?$`)

const config = defineConfig({
  external: [builtinModuleNamePattern, dependencyNamePattern],
  input: {
    'database/cache/index': 'src/database/cache/index.ts',
    'database/state/index': 'src/database/state/index.ts',
    condition: 'src/condition.ts',
  },
  plugins: [
    dtsPlugin({
      tsconfig: 'config/typescript/tsconfig.rolldown.json',
    }),
  ],
  output: {
    dir: 'dist',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'src',
  },
})

export default config
