#!/usr/bin/env node

var program = require('commander');
var SPMServer = require('./');
var join = require('path').join;

program
  .version(require('./package').version, '-v, --version')
  .option('-p, --port <port>', 'server port, default: 8000')
  .option('-b, --base <path>', 'set seajs\'s base')
  .option('--proxy', 'enable anyproxy on 8989')
  .option('--livereload', 'enable livereload')
  .option('--weinre', 'enable weinre')
  .option('--cache', 'enable 304 cache for spm')
  .option('--cdn <cdn>', 'cdn proxy, defaults: https://115.238.23.196^a.alipayobjects.com')
  .parse(process.argv);

var cwd = process.cwd();
var args = program.args;

if (args.length === 1) {
  cwd = join(cwd, args[0]);
}

var s = new SPMServer(cwd);
s.combo();
s.directory();

var spmOpts = {
  base: program.base,
  cache: program.cache
};
if (args.length > 1) {
  args.forEach(function(root) {
    s.spm(join(cwd, root), spmOpts);
  });
} else {
  s.spm(spmOpts);
}

s.cdn({
  proxy: program.cdn && program.cdn.split('^')
});
s.static();
s.listen(program.port || 8000);

if (program.livereload) s.livereload();
if (program.proxy) s.proxy();
if (program.weinre) s.weinre();
