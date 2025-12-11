import { defineConfig } from 'tsdown'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filePath = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  entry: ['src/index.ts', 'src/web.config.ts', 'src/apps/**/*.ts'],
  format: 'esm',
  outExtensions: (_) => {
    return {
      js: '.js',
      dts: '.d.ts',
    }
  },
  nodeProtocol: true,
  unbundle: false,
  fixedExtension: true,
  dts: false,
  clean: true,
  minify: true,
  target: 'node22',
  sourcemap: false,
  treeshake: true,
  platform: 'node',
  noExternal: ['@candriajs/utils'],
  outDir: path.join(filePath, 'lib'),
  external: [/^node-karin/],
})