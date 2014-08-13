var extend = require('extend');
var program = require('commander');
var join = require('path').join;
var fs = require('fs');
var relative = require('path').relative;
var express = require('express');
var tinylr = require('tiny-lr');
var Gaze = require('gaze');
var serveSPM = require('serve-spm');
var log = require('spm-log');
var httpProxy = require('http-proxy');
var combo = require('connect-combo');
var open = require('open');
var spmrc = require('spmrc');
var util = require('./util');
var http = require('http');

var defaults = {
  port: 8000
};

module.exports = function(options, callback) {

  if (!options.noArgvParse) {
    program
      .version(require('./package').version, '-v, --version')
      .option('-p, --port <port>', 'server port, default: 8000')
      .option('-b, --base <path>', 'base path to access package in production')
      .option('--idleading <idleading>', 'prefix of module name, default: {{name}}/{{version}}')
      .option('--https', 'enable https proxy')
      .option('--livereload', 'enable livereload')
      .option('--no-open', 'disable open in default browser')
      .parse(process.argv);
  }

  var args = extend({}, defaults, program, options);

  var app = express();

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

  var server = http.createServer(app);

  // Listen.
  util.isPortInUse(args.port, function(port) {
    log.error('server', 'port %s in in use', port);
  }, function(err, port) {
    server.listen(port, function(e) {
      if (e) return log.error('error', e);
      log.info('server', 'listen on %s', port);

      // Open project in browser.
      if (args.open) {
        open('http://localhost:' + port);
      }

      callback = callback || function() {};

      // Https.
      if (args.https) {
        log.info('https', 'enable');
        httpProxy.createServer({
          ssl: {
            key: fs.readFileSync(join(__dirname, 'keys/key.pem')),
            cert: fs.readFileSync(join(__dirname, 'keys/cert.pem'))
          },
          target: 'http://localhost:' + port,
          secure: true
        }).listen(443, callback);
      } else {
        callback();
      }
    });
  });

  // Livereload.
  if (args.livereload) {
    var port = process.env.LR_PORT || 35729;
    var server = tinylr();
    server.listen(port, function(err) {
      if (err) {
        log.error('livereload', err);
        return;
      }
      log.info('livereload', 'listened on %s', port);

      var installPath = spmrc.get('install.path');
      var gaze = new Gaze(['**', '!./{node-modules,'+installPath+'}/**'], {});
      gaze.on('all', function(event, filepath) {
        server.changed({body: {files:[filepath]}});
        var relativePath = relative(process.cwd(), filepath);
        log.info('livereload', '%s was %s', relativePath, event);
      });
    });
  }

  return server;
};
