import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/web.config.ts', 'src/apps/**/*.ts' , 'src/root.ts'],      // 入口文件
  format: ['esm'],       // ESM格式
  dts:  true,                  // 清理dist目录
  minify: true,                 // 压缩生产环境代码
  target: 'node22',             // 指定ECMAScript目标版本
  sourcemap: false,              // 生成sourcemap
  treeshake: true,              // 启用树摇优化
  platform: 'node',            // 指定为Node.js环境
  outDir: 'lib',               // 指定输出目录
  external: [
    "node-karin",
    "canvas"
]                 // 外部依赖, 不打包进输出文件中
})
