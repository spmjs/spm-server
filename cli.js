#!/usr/bin/env node

var program = require('commander');
var SPMServer = require('./');
var join = require('path').join;

program
  .version(require('./package').version, '-v, --version')
  .option('-p, --port <port>', 'server port, default: 8000')
  .option('-b, --base <path>', 'base path to access package in production')
  .option('--proxy', 'enable anyproxy on 8989')
  .option('--livereload', 'enable livereload')
  .option('--weinre', 'enable weinre')
  .option('--cache', 'enable 304 cache for spm')
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
s.combo();
s.directory();

if (args.length > 1) {
  args.forEach(function(root) {
    s.spm(join(cwd, root), {paths:paths});
  });
} else {
  s.spm({paths:paths,cache:program.cache});
}

s.cdn();
s.static();
s.listen(program.port || 8000);

if (program.livereload) s.livereload();
if (program.proxy) s.proxy();
if (program.weinre) s.weinre();
