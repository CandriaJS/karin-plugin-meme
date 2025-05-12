# 变更日志

## [2.2.0](https://github.com/CandriaJS/karin-plugin-meme/compare/v2.1.0...v2.2.0) (2025-05-12)


### ✨ 新功能

* **server:** 添加服务端资源下载地址配置项 ([68d462a](https://github.com/CandriaJS/karin-plugin-meme/commit/68d462ae1f3f9aed22c7bdd93afc93ffc46da93d))


### 🐛 错误修复

* **resources:** 修复 emoji 字体格式和样式 ([b2db493](https://github.com/CandriaJS/karin-plugin-meme/commit/b2db493dbbed89a68f52cc63896e22f066964c07))
* **server:** 修复 Linux 系统下表情服务端无法运行的问题 ([9b6b52b](https://github.com/CandriaJS/karin-plugin-meme/commit/9b6b52b542925995881324045a78e70924549848))
* **server:** 修复配置文件目录创建逻辑 ([1a0adfc](https://github.com/CandriaJS/karin-plugin-meme/commit/1a0adfc39ad279d97165c02702de57f6a87eb19d))
* **src:** 修正服务模式 ([6f98a85](https://github.com/CandriaJS/karin-plugin-meme/commit/6f98a85bd8bd49051b3d496011520ff8ed13c5cb))
* **webui:** 修复webui的代理地址配置 ([49313cc](https://github.com/CandriaJS/karin-plugin-meme/commit/49313cc64fdeda36de3d6c19951444d6c1eff1b2))
* 优化背景图大小 ([036f5b7](https://github.com/CandriaJS/karin-plugin-meme/commit/036f5b74c41356e009f947dfb2e706d6b9ec4860))
* 修复字体加载 ([db5e3ec](https://github.com/CandriaJS/karin-plugin-meme/commit/db5e3ece70b0c44744496a8f3839473b8deef64f))


### ♻️ 代码重构

* **meme:** 移除废弃配置项 ([75963ff](https://github.com/CandriaJS/karin-plugin-meme/commit/75963ff7fb04d6b22ccb365f41ec2c4b263bdc79))
* **models:** 修改表情服务端资源下载提示信息 ([c8b73b7](https://github.com/CandriaJS/karin-plugin-meme/commit/c8b73b77ec67ead594c68a069a9c090da7f12b7f))


### 🎡 持续集成

* 修复 pkg.pr.new URL 中的仓库路径 ([f61ea19](https://github.com/CandriaJS/karin-plugin-meme/commit/f61ea19c78661ae1c13acc03f0088d886938eb3a))
* 更新 beta 版本安装命令 ([0d8e387](https://github.com/CandriaJS/karin-plugin-meme/commit/0d8e3879ca3c20b86a00ff51968a5557b0b7e294))
* 更新 release-beta 工作流 ([54bba0c](https://github.com/CandriaJS/karin-plugin-meme/commit/54bba0cc8995805ec3751cec352ef8cad1145b70))

## [2.1.0](https://github.com/CandriaJS/karin-plugin-meme/compare/v2.0.8...v2.1.0) (2025-05-11)


### ✨ 新功能

* **admin:** 添加服务模式、自定义端口和代理地址设置 ([f445fc3](https://github.com/CandriaJS/karin-plugin-meme/commit/f445fc3400075fccc55fb49a852d137367a357e8))
* **server:** 添加本地表情服务端功能 ([#71](https://github.com/CandriaJS/karin-plugin-meme/issues/71)) ([4e538fd](https://github.com/CandriaJS/karin-plugin-meme/commit/4e538fd85d0f3f97e3e86872030c05d062f3f890))


### 🐛 错误修复

* **server:** 修复 Windows 系统下获取 meme 服务器进程 ID 的方法 ([be1fc94](https://github.com/CandriaJS/karin-plugin-meme/commit/be1fc94413866361bc92a9c4996094a9ded1ca93))
* **src:** 优化表情服务端启动流程和错误处理 ([5ad8c0c](https://github.com/CandriaJS/karin-plugin-meme/commit/5ad8c0c5b1bc8c98f3b5ecf306d0fb16e58ef0ca))

## [2.0.8](https://github.com/CandriaJS/karin-plugin-meme/compare/v2.0.7...v2.0.8) (2025-05-09)


### ♻️ 代码重构

* **reply:** 优化消息回复方式 ([cbd8ca2](https://github.com/CandriaJS/karin-plugin-meme/commit/cbd8ca21202eb32a3e3dc15d349e178b4ea068ec))

## [2.0.7](https://github.com/CandriaJS/karin-plugin-meme/compare/v2.0.6...v2.0.7) (2025-05-09)


### ♻️ 代码重构

* 名称从'清语'更名为'柠糖' ([2ee3221](https://github.com/CandriaJS/karin-plugin-meme/commit/2ee32212bd39db16d86717fdcfd5e21a4bf175ea))

## [2.0.6](https://github.com/CandriaJS/karin-plugin-meme/compare/v2.0.5...v2.0.6) (2025-05-09)


### 📝 文档更新

* **README:** 更新项目名称和相关信息 ([0ee1329](https://github.com/CandriaJS/karin-plugin-meme/commit/0ee1329df99b59a40f54556b59d0ef20a8c60916))


### ♻️ 代码重构

* **src:** 优化代码结构和功能 ([0388351](https://github.com/CandriaJS/karin-plugin-meme/commit/0388351c7f52f539f4198dbf2d38b722a1754b34))

## [2.0.5](https://github.com/CandriaJS/karin-plugin-meme/compare/v2.0.4...v2.0.5) (2025-05-09)


### 🐛 错误修复

* **root:** 修正插件配置名称的生成逻辑 ([1d7699d](https://github.com/CandriaJS/karin-plugin-meme/commit/1d7699d82fab30a930da392bc92e085aef804889))


### ♻️ 代码重构

* **update:** 重构更新功能并优化插件配置 ([6c5f266](https://github.com/CandriaJS/karin-plugin-meme/commit/6c5f26687927056b3d52a5e8456bf6f36506da67))
* 更新包信息以适配新组织 ([c5ba1eb](https://github.com/CandriaJS/karin-plugin-meme/commit/c5ba1ebf745e5c1c2066b7ff41f53d1654238d3e))

## [2.0.4](https://github.com/ClarityJS/karin-plugin-meme/compare/v2.0.3...v2.0.4) (2025-05-09)


### 🐛 错误修复

* **apps:** 优化表情列表命令的类型定义 ([2ad201b](https://github.com/ClarityJS/karin-plugin-meme/commit/2ad201b369d520defb5f51a6a61a3445d115c012))
* **db:** 优化 add 函数中的 force 参数逻辑 ([dcaad2b](https://github.com/ClarityJS/karin-plugin-meme/commit/dcaad2be1c0c3857ae35e9bf644baed294f5d326))


### ⚡️ 性能优化

* **config:** 优化数组类配置项的修改逻辑 ([e5050f3](https://github.com/ClarityJS/karin-plugin-meme/commit/e5050f3abe60d881efbb5c5741a21468f31cab17))
* 添加设置默认表情功能 ([967b4a8](https://github.com/ClarityJS/karin-plugin-meme/commit/967b4a8064819eab60bb24e2d3b74804b3068c6d))


### ♻️ 代码重构

* **apps:** 优化表情详情和搜索功能 ([e141a98](https://github.com/ClarityJS/karin-plugin-meme/commit/e141a98543548bb318306998ed74fda27ec80893))
* **models:** 优化表情包数据加载逻辑 ([d5c687b](https://github.com/ClarityJS/karin-plugin-meme/commit/d5c687b6f32c763be60cf94fdd37aee21658493d))
* **models:** 优化请求参数 ([9c0959f](https://github.com/ClarityJS/karin-plugin-meme/commit/9c0959f8d701036d3648c87c86d387240e5d4046))
* 修改 feature request issue 模板标题格式 ([3b3eba8](https://github.com/ClarityJS/karin-plugin-meme/commit/3b3eba848ce550b529cdf1793d62d72b4c030266))


### 🎡 持续集成

* 优化 release-beta 工作流中的包名获取逻辑 ([6706690](https://github.com/ClarityJS/karin-plugin-meme/commit/670669082900a64050bc3c3614cb195d57c0c1fd))

## [2.0.3](https://github.com/ClarityJS/karin-plugin-meme/compare/v2.0.2...v2.0.3) (2025-05-08)


### 🎡 持续集成

* **release:** 移除构建过程中的冗余输出 ([380c6b7](https://github.com/ClarityJS/karin-plugin-meme/commit/380c6b7e6819fbbb4e6b8b7952fa46f9616db46a))

## [2.0.2](https://github.com/ClarityJS/karin-plugin-meme/compare/v2.0.1...v2.0.2) (2025-05-08)


### 📦️ 构建系统

* **release:** 更新包名和发布流程 ([b2768df](https://github.com/ClarityJS/karin-plugin-meme/commit/b2768dff1014d2736e37905958bdb2909d36625e))

## [2.0.1](https://github.com/ClarityJS/karin-plugin-meme/compare/v2.0.0...v2.0.1) (2025-05-08)


### 🎡 持续集成

* **release:** 优化构建产物上传和下载流程 ([3d0d554](https://github.com/ClarityJS/karin-plugin-meme/commit/3d0d5541d3c63ea72d99fe853b8b99c41629a321))

## [2.0.0](https://github.com/ClarityJS/karin-plugin-meme/compare/v1.7.0...v2.0.0) (2025-05-08)


### ⚠ BREAKING CHANGES

* V2版发布

### ✨ 新功能

* V2版发布 ([97b9ef9](https://github.com/ClarityJS/karin-plugin-meme/commit/97b9ef94d9cfc0d810ef6709a3b6a5f886a1e51c))
* 适配rust的表情API ([#53](https://github.com/ClarityJS/karin-plugin-meme/issues/53)) ([42e4dab](https://github.com/ClarityJS/karin-plugin-meme/commit/42e4daba35bf6d35507324e965dbe4882eb9dc45))

## [1.7.0](https://github.com/ClarityJS/karin-plugin-meme/compare/v1.6.2...v1.7.0) (2025-04-28)


### ✨ 新功能

* **config:** 添加高级设置功能并优化头像获取 ([c11af39](https://github.com/ClarityJS/karin-plugin-meme/commit/c11af39cb22363ebd789060125a8215ba0b10758))
