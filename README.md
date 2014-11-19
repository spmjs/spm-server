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

```bash
$ spm-server [options]
```

```javascript
require('spm-server')(options);
```

## Options

* `-p, --port <port>`, server port, default: `8000`
* `-b, --base <path>`, base path to access package in production
* `--idleading <idleading>`, prefix of module name, default: `{{name}}/{{version}}`
* `--https`, enable https proxy
* `--livereload`, enable livereload
