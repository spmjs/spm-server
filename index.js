#!/usr/bin/env node

var join = require('path').join;
var program = require('commander');
var express = require('express');
var serveSPM = require('serve-spm');
var util = require('./util');

var DEFAULT_PORT = 8000;

program
  .version(require('./package').version, '-v, --version')
  .option('-p, --port <port>', 'server port, default: 8000')
  .option('-b, --base <path>', 'base path to access package in production')
  .option('--idleading [idleading]', 'prefix of module name, default: {{name}}/{{version}}')
  .parse(process.argv);

var app = express();

// Map.
app.use(function(req, res, next) {
  var base = program.base || 'dist';
  var idleading = program.idleading || '{{name}}/{{version}}';
  var pkg = require(join(process.cwd(), 'package'));
  var id = util.template(idleading, pkg);
  var prefix = join(base, id);
  if (prefix[0] !== '/') {
    prefix = '/' + prefix;
  }

  if (req.url.indexOf(prefix) === 0) {
    req.url = req.url.replace(prefix, '');
  }

  next();
});

app.use(serveSPM(process.cwd()));

// Listen.
util.isPortInUse(program.port || DEFAULT_PORT, function(port) {
  console.log('[error] port %s is in use', port);
}, function(err, port) {
  app.listen(port);
  console.log('listen on %s', port);
});
