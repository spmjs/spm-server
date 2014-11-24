#!/usr/bin/env node

var program = require('commander');
var SPMServer = require('./');
var join = require('path').join;

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

var cwd = process.cwd();
var args = program.args;

if (args.length === 1) {
  cwd = join(cwd, args[0]);
}

var s = SPMServer(cwd);

if (args.length > 1) {
  args.forEach(function(root) {
    s.spm(root, {paths:paths});
  });
} else {
  s.spm({paths:paths});
}

s.combo();
s.directory();
s.listen(8000);

if (program.livereload) s.livereload();
if (program.https) s.https();
