import { defineConfig } from 'rolldown'

import packageJson from './package.json' with { type: 'json' }

const dependencyNameList = Object.keys({ ...packageJson.devDependencies }).join('|')

const builtinModuleNamePattern = /^node:/
const dependencyNamePattern = new RegExp(`^(?:${dependencyNameList})(?:/.+)?$`)

const config = defineConfig({
  external: [builtinModuleNamePattern, dependencyNamePattern],
  input: {
    index: 'src/index.ts',
  },
  output: {
    dir: 'dist',
    format: 'esm',
  },
})

export default config
