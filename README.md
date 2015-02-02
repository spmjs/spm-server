# spm-server

[![NPM version](https://img.shields.io/npm/v/spm-server.svg?style=flat)](https://npmjs.org/package/spm-server)
[![Build Status](https://img.shields.io/travis/spmjs/spm-server.svg?style=flat)](https://travis-ci.org/spmjs/spm-server)
[![Coverage Status](https://img.shields.io/coveralls/spmjs/spm-server.svg?style=flat)](https://coveralls.io/r/spmjs/spm-server)
[![NPM downloads](http://img.shields.io/npm/dm/spm-server.svg?style=flat)](https://npmjs.org/package/spm-server)

spm-server 是 spm3 项目的本地开发和调试工具。包含 server 和 middleware 两层功能，默认封装了很多常用的调试工具，见下图：

![](https://t.alipayobjects.com/images/T1Nj4eXitdXXXXXXXX.png)

## Install

```bash
$ npm install spm-server -g
```

## 本地调试

本地调试没啥好说的，就是进入到一个 spm3 的项目或组件目录中，执行 `spm-server`。

![](https://t.alipayobjects.com/images/T1VzVeXcFoXXXXXXXX.png)

然后可以通过参数开启上图中的功能。

![](https://t.alipayobjects.com/images/T1Qj4eXntdXXXXXXXX.png)

### livereload

通过 `spm-server --livereload` 开启。

![](https://t.alipayobjects.com/images/T1rPReXjpvXXXXXXXX.png)

这时 spm-server 会做两件事：

1. 开启 livereload 服务器
2. 访问 html 页面时会插入 livereload 脚本，用于和服务器通讯实时刷新页面

### weinre

通过 `spm-server --weinre` 开启。

![](https://t.alipayobjects.com/images/T1ij0eXcRmXXXXXXXX.png)

和 livereload 一样，spm-server 会做两件事：

1. 开启 weinre 服务器
2. 访问 html 页面时会插入 weinre 脚本，用于和服务器通讯

然后就可以在 weinre 页面上看到当前绑定的设备了：(端口是 8989)

![](https://t.alipayobjects.com/images/T15j4eXoNcXXXXXXXX.png)

关于 weinre 的使用这里就不展开了，可以访问 [weinre 的官网文档](http://people.apache.org/~pmuellr/weinre/docs/latest/UserInterface.html) 来了解。

### spm

spm 的功能是通过 serve-spm 这个中间件来实现的，serve-spm 用在 `spm doc`、spmjs.io 等所有需要对 spm 进行调试的地方。

如果你的项目的根目录不是 `/`，而是 `/assets/` 或者 `http://x.com/assets/`，则需要配置 `base` 参数。比如：`spm-server --base /assets/`，然后就可以通过 http://localhost:8000/assets/index.js 来访问到你项目中的文件了。

  - 添加 base 参数支持, https://github.com/spmjs/serve-spm/issues/26

更多 serve-spm 的详细规则，见：[serve-spm](./serve-spm.md) 。

## 线上调试

线上调试主要是通过 anyproxy 实现。

```bash
## spm-server 不直接依赖 anyproxy ，所以第一次使用前需要手动安装
$ npm install anyproxy -g

## 启动 spm-server 和 (any)proxy
$ spm-server --proxy
```

然后应该能看到下图的提示：(包含 GUI 和 HTTP 代理的端口)

![](https://t.alipayobjects.com/images/T1Xj0eXc4nXXXXXXXX.png)

> 注意：第一次使用时应该会提示你安装根证书。

然后就是通过各种方式把请求配置到 HTTP 代理上去，比如 Chrome：

### Chrome

推荐使用扩展程序 [Proxy SwitchySharp](https://chrome.google.com/webstore/detail/proxy-switchysharp/dpplabbmogkhghncfbfdeeokoefdjegm?hl=zh-CN)，可以很方便地定制大力规则和情景模式。安装完成后，添加一个情景模式比如 spm：

![](https://t.alipayobjects.com/images/T1jjVeXgpsXXXXXXXX.png)

然后到切换到“切换规则”面板，启用规则切换，加入一条对 alipayobjects.com 的代理规则的配置：

![](https://t.alipayobjects.com/images/T1h68eXd0cXXXXXXXX.png)

> 根据项目的不同，这里可能需要加上你对应的开发环境的代理规则

OK，接下来选择开启 SwitchSharp 的“自动切换模式”，代理的配置就完成了：

![](https://t.alipayobjects.com/images/T1i6VeXidsXXXXXXXX.png)

然后访问 https://a.alipayobjects.com/ ，如果在页面上看到项目目录下的文件列表了，就说明本地环境启动成功了：

![](https://t.alipayobjects.com/images/T1Hn4eXjJXXXXXXXXX.png)

同时在 anyproxy 的监控页面也会看到一条请求记录：

![](https://t.alipayobjects.com/images/T1.PVeXftnXXXXXXXX.png)

### 移动端

1. 常规方法

  ![](https://t.alipayobjects.com/images/T1eP0eXgdmXXXXXXXX.png)

1. 代理 app，比如 Andriod 的 [ProxyDroid](https://play.google.com/store/apps/details?id=org.proxydroid)

## 同时调试多个包

如果一个项目中使用了多个包，可能会需要同时进行调试。别担心，spm-server 已经为你考虑到了：

```bash
$ spm-server ./modA ./modB
```

## 定制

参考：https://github.com/spmjs/spm-server/blob/master/cli.js
