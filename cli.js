#!/usr/bin/env node

var program = require('commander');
var SPMServer = require('./');

program
  .version(require('./package').version, '-v, --version')
  .option('-p, --port <port>', 'server port, default: 8000')
  .option('-b, --base <path>', 'base path to access package in production')
  .option('--https', 'enable https proxy')
  .option('--livereload', 'enable livereload')
  .parse(process.argv);

var paths;
if (program.base) {
  paths = [[require('./util').normalizeBase(program.base), '']];
}

var s = SPMServer(process.cwd())
  .spm({paths:paths})
  .combo()
  .directory()
  .listen(8000);

if (program.livereload) s.livereload();
if (program.https) s.https();
