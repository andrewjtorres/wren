import { defineConfig } from 'rolldown'
import { dts as dtsPlugin } from 'rolldown-plugin-dts'

import packageJson from './package.json' with { type: 'json' }

const dependencyNameList = Object.keys({ ...packageJson.devDependencies }).join('|')

const builtinModuleNamePattern = /^node:/
const dependencyNamePattern = new RegExp(`^(?:${dependencyNameList})(?:/.+)?$`)

const config = defineConfig({
  external: [builtinModuleNamePattern, dependencyNamePattern],
  input: {
    error: 'src/error.ts',
    http: 'src/http.ts',
    nanoid: 'src/nanoid.ts',
    transformation: 'src/transformation.ts',
    validation: 'src/validation.ts',
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
