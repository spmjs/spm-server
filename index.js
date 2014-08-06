#!/usr/bin/env node

var join = require('path').join;
var fs = require('fs');
var relative = require('path').relative;
var program = require('commander');
var express = require('express');
var tinylr = require('tiny-lr');
var Gaze = require('gaze');
var serveSPM = require('serve-spm');
var log = require('spm-log');
var httpProxy = require('http-proxy');
var combo = require('connect-combo');
var open = require('open');
var util = require('./util');

var DEFAULT_PORT = 8000;

program
  .version(require('./package').version, '-v, --version')
  .option('-p, --port <port>', 'server port, default: 8000')
  .option('-b, --base <path>', 'base path to access package in production')
  .option('--idleading <idleading>', 'prefix of module name, default: {{name}}/{{version}}')
  .option('--https', 'enable https proxy')
  .option('--livereload', 'enable livereload')
  .parse(process.argv);

var app = express();

// Map dist to src.
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

app.use(serveSPM(process.cwd(), {
  log: true
}));

app.use(combo({
  directory: join(process.cwd(), 'dist'),
  proxy: process.env.ONLINE_SERVER || 'https://a.alipayobjects.com',
  cache: true,
  log: true,
  static: true
}));

// Listen.
util.isPortInUse(program.port || DEFAULT_PORT, function(port) {
  log.error('server', 'port %s in in use', port);
}, function(err, port) {
  app.listen(port, function(e) {
    if (e) return log.error('error', e);
    log.info('server', 'listen on %s', port);

    // Open project in browser.
    open('http://localhost:' + port);

    // Https.
    if (program.https) {
      httpProxy.createServer({
        ssl: {
          key: fs.readFileSync(join(__dirname, 'keys/key.pem')),
          cert: fs.readFileSync(join(__dirname, 'keys/cert.pem'))
        },
        target: 'http://localhost:' + port,
        secure: true
      }).listen(443);
    }
  });
});

// Livereload.
if (program.livereload) {
  var port = process.env.LR_PORT || 35729;
  var server = tinylr();
  server.listen(port, function(err) {
    if (err) {
      log.error('livereload', err);
      return;
    }
    log.info('livereload', 'listened on %s', port);

    var gaze = new Gaze(['**', '!./{node-modules,sea-modules}/**'], {});
    gaze.on('all', function(event, filepath) {
      server.changed({body: {files:[filepath]}});
      var relativePath = relative(process.cwd(), filepath);
      log.info('livereload', '%s was %s', relativePath, event);
    });
  });
}
