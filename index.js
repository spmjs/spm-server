#!/usr/bin/env node

var join = require('path').join;
var relative = require('path').relative;
var program = require('commander');
var express = require('express');
var tinylr = require('tiny-lr');
var Gaze = require('gaze');
var serveSPM = require('serve-spm');
var util = require('./util');

var DEFAULT_PORT = 8000;

program
  .version(require('./package').version, '-v, --version')
  .option('-p, --port <port>', 'server port, default: 8000')
  .option('-b, --base <path>', 'base path to access package in production')
  .option('--idleading <idleading>', 'prefix of module name, default: {{name}}/{{version}}')
  .option('--no-livereload', 'disable livereload')
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

// Livereload.
if (program.livereload) {
  var port = process.env.LR_PORT || 35729;
  var server = tinylr();
  server.listen(port, function(err) {
    if (err) {
      console.log('livereload error: %s', err);
      return;
    }
    console.log('livereload: listened on %s', port);

    var gaze = new Gaze(['**', '!./{node-modules,sea-modules}/**'], {});
    gaze.on('all', function(event, filepath) {
      server.changed({body: {files:[filepath]}});
      var relativePath = relative(process.cwd(), filepath);
      console.log('%s was %s', relativePath, event);
    });
  });
}
