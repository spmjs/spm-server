# spm-server

[![NPM version](https://img.shields.io/npm/v/spm-server.svg?style=flat)](https://npmjs.org/package/spm-server)
[![Build Status](https://img.shields.io/travis/spmjs/spm-server.svg?style=flat)](https://travis-ci.org/spmjs/spm-server)
[![Coverage Status](https://img.shields.io/coveralls/spmjs/spm-server.svg?style=flat)](https://coveralls.io/r/spmjs/spm-server)
[![NPM downloads](http://img.shields.io/npm/dm/spm-server.svg?style=flat)](https://npmjs.org/package/spm-server)

Server for spm, [documentation](http://sorrycc.gitbooks.io/spm-handbook/content/develop-project/spm-server.html), [中文上手文档](https://github.com/spmjs/spm-server/issues/7).

## Install

```bash
$ npm install spm-server -g
```

## Usage

1. use in command line

```bash
$ spm-server [options]
```

2. use api for customize

```javascript
require('spm-server')(root)
  .use(middleware())
  .spm()
  .combo()
  .directory()
  .listen(8000);
```

## Options

* `-p, --port <port>`, server port, default: `8000`
* `-b, --base <path>`, set seajs's base
* `--proxy`, enable anyproxy on 8989
* `--livereload`, enable livereload
* `--weinre`, enable weinre
* `--cache`, enable 304 cache for spm
* `--cdn <cdn>`, cdn proxy, defaults: `https://115.238.23.196^a.alipayobjects.com`
