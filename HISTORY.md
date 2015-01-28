# HISTORY

---

## 0.4.2

- deps: 更新 serve-spm 到 0.10.0
- deps: 添加 bluebird，修复 node 0.10 下报错的问题，Fix [#21](https://github.com/spmjs/serve-spm/issues/21)
- 添加 Access-Control-Allow-Origin 头，允许跨域访问

## 0.4.1

- 更新命令行说明

## 0.4.0

- 更新 serve-spm 到 0.9.0
- 命令行添加 cdn 参数，用于配置 cdn proxy
- 删除 anyproxy 依赖，使用 proxy 时需要 `npm install anyproxy -g`
- 切换依赖 ali.gnode 到 gnode
- 端口占用时提示出错
- 命令行参数 base 用途变更，改为配置 seajs 的 base, [spmjs/serve-spm#26](https://github.com/spmjs/serve-spm/issues/26)

## 0.3.1

- 更新 serve-spm 到 ~0.8.1
- 默认不开启 spm 的 cache，通过 `--cache` 参数开启
- 调整 directory 中间件的列表样式
- 修复 port 没有传入的问题

## 0.3.0

- 重构组织方式，便于通过 gulpfile 之类的进行自定义，比如：

  ```javascript
require('spm-server')(root)
  .serveSPM()
  .combo('https://a.alipayobjects.com')
  .livereload()
  .https()
  .listen(8000);
```

- [#10](https://github.com/spmjs/spm-server/issues/10) standalone 模式支持多个 script 同时引入
- [#3](https://github.com/spmjs/spm-server/issues/3) 同时支持多个 spm 包
- 优化目录索引，现在的样子不好看而且有时会报错
- https 证书认证问题
- 支持 weinre
- livereload 无需借助 Chrome 插件

## 0.2.5

- 更新版本，使用 `~` 前缀

## 0.2.4

- 调整 middlware 顺序，移动 serve-spm 到目录解析后面

## 0.2.3

- 添加 directory middleware，而不是直接 404
- 默认不在浏览器里打开，可以通过 `--open` 启用

## 0.2.2

- [`#928259`](https://github.com/spmjs/spm-server/commit/928259) 支持自定义 middleware

## 0.2.1

- [`#76ea0fc`](https://github.com/spmjs/spm-server/commit/76ea0fc) 用 gaze@0.5.x 代替 0.6.x，无需编译，减少安装故障
- [`#40b4403`](https://github.com/spmjs/spm-server/commit/40b4403) 支持淘系项目，通过指定 base 实现

## 0.2.0

- [`#01cfff6`](https://github.com/spmjs/spm-server/commit/01cfff6) 支持 https 协议
- [`#57ff857`](https://github.com/spmjs/spm-server/commit/57ff857) `serve-spm@0.3.11` 本地文件不存在时代理到 cdn 上的文件

## 0.1.0

- 通过 serve-spm 实现简单的 commonjs 文件封装
- 支持 map 生产环境的路径到源码
- 支持 livereload

