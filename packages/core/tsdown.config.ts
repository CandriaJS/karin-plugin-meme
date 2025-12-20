import { defineConfig } from 'tsdown'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filePath = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  entry: ['src/index.ts'],
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
  dts: true,
  clean: true,
  minify: true,
  target: 'node22',
  sourcemap: false,
  treeshake: true,
  platform: 'node',
  outDir: path.join(filePath, 'dist'),
  external: [/^node-karin/],
})
