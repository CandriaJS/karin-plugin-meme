# 变更日志

## [2.5.2](https://github.com/CandriaJS/karin-plugin-meme/compare/v2.5.1...v2.5.2) (2025-05-27)


### 🐛 错误修复

* **imageTool:** 优化 GIF 分拆功能的文件处理 ([00a2f8f](https://github.com/CandriaJS/karin-plugin-meme/commit/00a2f8f57db4b07c5577d288e92834899c0f330d))


### 🎡 持续集成

* 优化ci流程 ([0ac7501](https://github.com/CandriaJS/karin-plugin-meme/commit/0ac7501dddb1ac625d0a2958dbc97e48650ff0ed))

## [2.5.1](https://github.com/CandriaJS/karin-plugin-meme/compare/v2.5.0...v2.5.1) (2025-05-25)


### ♻️ 代码重构

* **apps:** 重构表情包数据加载逻辑 ([8b6f865](https://github.com/CandriaJS/karin-plugin-meme/commit/8b6f86534cea23fc176e77f87164f55a5cc87c43))

## [2.5.0](https://github.com/CandriaJS/karin-plugin-meme/compare/v2.4.0...v2.5.0) (2025-05-24)


### ✨ 新功能

* 增加gif分解发送合并消息同时发送压缩文件 ([#91](https://github.com/CandriaJS/karin-plugin-meme/issues/91)) ([7559816](https://github.com/CandriaJS/karin-plugin-meme/commit/7559816404bc7e303aa4eadfc8ec9a9775a7b3dc))


### 🐛 错误修复

* **imageTool:** 修复 GIF 分解功能的文件发送问题 ([02ae288](https://github.com/CandriaJS/karin-plugin-meme/commit/02ae288d16bd85109590feedfe66697d192d96a1))
* 修复用户保护失效 ([859f839](https://github.com/CandriaJS/karin-plugin-meme/commit/859f839518bca0569e1de9ab82db3bea03407eed))
* 初始化表情正则萝莉 ([12ff5f3](https://github.com/CandriaJS/karin-plugin-meme/commit/12ff5f328f8e2941f8bf97b9e5d7acd282053fee))
* 预设表情参数传递错误 ([5fd4456](https://github.com/CandriaJS/karin-plugin-meme/commit/5fd4456fcf414796b1828a6cdbac50597de154c9))


### ⚡️ 性能优化

* 优化webui配置 ([f3bdde3](https://github.com/CandriaJS/karin-plugin-meme/commit/f3bdde30068cf6f8247918f614cdf7e354f609ae))
* 优化表情搜索，支持预设表情返回原始表情的关键词 ([1dfd1e2](https://github.com/CandriaJS/karin-plugin-meme/commit/1dfd1e20f431459feff8b8141185b637fd1652af))
* 优化部分回复提示 ([1f8bd3a](https://github.com/CandriaJS/karin-plugin-meme/commit/1f8bd3a8021e590dd8124248659a1de88213cd03))


### ♻️ 代码重构

* **imageTool:** 修改 GIF 分解功能的文件保存路径 ([885fa68](https://github.com/CandriaJS/karin-plugin-meme/commit/885fa681af162871e1a082a7013fe82a753a4efe))
* **models:** 优化 meme 制作逻辑 ([4d20779](https://github.com/CandriaJS/karin-plugin-meme/commit/4d207798a303650117935144c38caf91e54be145))


### 🎡 持续集成

* 优化版本发布流程 ([5ece947](https://github.com/CandriaJS/karin-plugin-meme/commit/5ece9478d1bf5287bac04f86d3219ba8cfb66963))
* 移除预览版Release发布 ([fb03423](https://github.com/CandriaJS/karin-plugin-meme/commit/fb03423f027ad84cbd40c710ec39a71105ae952d))

## [2.4.0](https://github.com/CandriaJS/karin-plugin-meme/compare/v2.3.1...v2.4.0) (2025-05-18)


### ✨ 新功能

* **apps:** 整合预设表情和关键词搜索 ([#87](https://github.com/CandriaJS/karin-plugin-meme/issues/87)) ([d3f8d06](https://github.com/CandriaJS/karin-plugin-meme/commit/d3f8d066c1ce5ecc65624ebeaccd540e9836cd7c))
* **models:** 添加表情统计功能并更新萝莉背景图 ([#89](https://github.com/CandriaJS/karin-plugin-meme/issues/89)) ([7e1b03f](https://github.com/CandriaJS/karin-plugin-meme/commit/7e1b03f4f23ad741002dddd70bd43d5959eebe67))


### 🐛 错误修复

* **meme:** 优化初始化正则失败导致误触发 ([f3c0c4b](https://github.com/CandriaJS/karin-plugin-meme/commit/f3c0c4ba21fb0f37beea8d98f7884f83ac72462b))
* **models:** 优化预设表情更新逻辑 ([ca02a1a](https://github.com/CandriaJS/karin-plugin-meme/commit/ca02a1a3ffab602a254b7fc29f4bf6784357f4c7))


### ♻️ 代码重构

* **imageTool:** 重构图片处理逻辑 ([#85](https://github.com/CandriaJS/karin-plugin-meme/issues/85)) ([0aab61b](https://github.com/CandriaJS/karin-plugin-meme/commit/0aab61bf22ac799dfcf4b15ebcd569379267bfe0))
* **models:** 添加狠撅和狠骑两个新预设 ([4609f32](https://github.com/CandriaJS/karin-plugin-meme/commit/4609f32a35c34746bf705b64036528474e68e660))
* 统一日志输出格式 ([92ca38e](https://github.com/CandriaJS/karin-plugin-meme/commit/92ca38ece110e666c22fe3f1cc182d02402383ef))

## [2.3.1](https://github.com/CandriaJS/karin-plugin-meme/compare/v2.3.0...v2.3.1) (2025-05-14)


### 🐛 错误修复

* **imageTool:** 优化图片获取逻辑 ([84812a7](https://github.com/CandriaJS/karin-plugin-meme/commit/84812a7e47f9fd8690ea1b4dfda4a3ee7a4871f4))
* **models:** 修复 API 地址未配置时的错误提示 ([fbac855](https://github.com/CandriaJS/karin-plugin-meme/commit/fbac85570fe3198603aadf89a5e0f8bfb7ad2ba6))
* **server:** 优化 Linux 系统下进程运行时间解析 ([80d4a94](https://github.com/CandriaJS/karin-plugin-meme/commit/80d4a94400dbd8ec821a25964cba6f25f965d296))
* **server:** 修复 Linux 进程运行时间获取 ([68deed9](https://github.com/CandriaJS/karin-plugin-meme/commit/68deed9079dd6ca01bfaaf30a16094b4eed8fba1))
* **server:** 修复 linux下的时间计算与内存计算 ([68e344f](https://github.com/CandriaJS/karin-plugin-meme/commit/68e344f5004fc80bdec4570346602834444409a1))


### ⚡️ 性能优化

* **ImageTools:** 优化图片操作，部分图片操作支持艾特获取头像 ([61d8543](https://github.com/CandriaJS/karin-plugin-meme/commit/61d8543ea356d1e9b96d18fbc3ee2653bd6836fb))


### 📝 文档更新

* **README:** 更新项目计划状态 ([8e2104a](https://github.com/CandriaJS/karin-plugin-meme/commit/8e2104a18deada0c1253ba447c53f95650018e69))
* 修正描述 ([4a50cb4](https://github.com/CandriaJS/karin-plugin-meme/commit/4a50cb49aa9c7be271396dbac2e2f890e8d4f2ac))

## [2.3.0](https://github.com/CandriaJS/karin-plugin-meme/compare/v2.2.0...v2.3.0) (2025-05-13)


### ✨ 新功能

* **imageTool:** 添加图片操作功能 ([#81](https://github.com/CandriaJS/karin-plugin-meme/issues/81)) ([89a6892](https://github.com/CandriaJS/karin-plugin-meme/commit/89a689209114092ca396311ad0f0c4567956e1ce))
* **search:** 增加表情包标签搜索功能 ([#79](https://github.com/CandriaJS/karin-plugin-meme/issues/79)) ([95216b4](https://github.com/CandriaJS/karin-plugin-meme/commit/95216b4172e84f423a2ecaa28b5fb3e67bfdf26d))


### ♻️ 代码重构

* **models:** 更新数据库和文件保存路径 ([c73f128](https://github.com/CandriaJS/karin-plugin-meme/commit/c73f128d48ae4300ef9c30fcfb6c973d92ee6711))
* 模块化webui配置功能 ([#76](https://github.com/CandriaJS/karin-plugin-meme/issues/76)) ([2e1aaab](https://github.com/CandriaJS/karin-plugin-meme/commit/2e1aaab9fb884551c1ca3962b3f81143c0f19aad))


### 🎡 持续集成

* 优化 GitHub Actions 工作流并更新 issue 模板 ([1b72aa5](https://github.com/CandriaJS/karin-plugin-meme/commit/1b72aa54a25d0c2f3a5fa6db3f8c75cbb64c5403))

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
