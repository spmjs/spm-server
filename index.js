var extend = require('extend');
var program = require('commander');
var join = require('path').join;
var fs = require('fs');
var relative = require('path').relative;
var express = require('express');
var tinylr = require('tiny-lr');
var serveSPM = require('serve-spm');
var log = require('spm-log');
var httpProxy = require('http-proxy');
var combo = require('connect-combo');
var open = require('open');
var http = require('http');
var request = require('request');
var watch = require('glob-watcher');
var util = require('./util');

var defaults = {
  port: 8000,
  cwd: process.cwd()
};

module.exports = function(options, callback) {

  options = options || {};

  if (!options.noArgvParse) {
    program
      .version(require('./package').version, '-v, --version')
      .option('-p, --port <port>', 'server port, default: 8000')
      .option('-b, --base <path>', 'base path to access package in production')
      .option('--idleading <idleading>', 'prefix of module name, default: {{name}}/{{version}}')
      .option('--https', 'enable https proxy')
      .option('--livereload', 'enable livereload')
      .option('--open', 'enable open in default browser')
      .parse(process.argv);
  }

  var args = extend({}, defaults, program, options);

  // normalize base
  args.base = util.normalizeBase(args.base);
  var paths;
  if (args.base) {
    paths = [[args.base, '']];
  }

  var app = express();

  if (args.middleware && args.middleware.before) {
    app.use(args.middleware.before);
  }

  app.use(serveSPM(args.cwd, {
    log: console.log,
    paths: paths
  }));

  // dir middleware
  app.use(function(req, res, next) {
    var file = join(args.cwd, req.url);

    if (!fs.existsSync(file)) {
      return next();
    }

    var isDir = fs.statSync(file).isDirectory();
    if (!isDir) return next();

    if (!/\/$/.test(file)) {
      return res.redirect(req.url + '/');
    }

    var html = renderDir(file);
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(html);
  });

  if (args.middleware && args.middleware.after) {
    app.use(args.middleware.after);
  }

  app.use(combo({
    directory: join(args.cwd, 'dist'),
    proxy: process.env.ONLINE_SERVER || 'https://a.test.alipay.net',
    cache: false,
    log: true,
    static: true,
    beforeProxy: function(urlPath, cb, next) {
      var pkg = serveSPM.util.getPackage(args.cwd);
      var re = new RegExp('^/'+pkg.name+'/'+pkg.version+'/');
      if (re.test(urlPath) || urlPath.indexOf(args.base) === 0) {
        var url = 'http://localhost:' + args.port + urlPath;
        request({url:url,headers:{'servespmexit':'1'}}, function(err, res, body) {
          if (err || res.statusCode >= 300) {
            return next();
          }
          cb(null, body);
        });
      } else {
        next();
      }
    }
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
    var lrServer = tinylr();
    lrServer.listen(port, function(err) {
      if (err) {
        log.error('livereload', err);
        return;
      }
      log.info('livereload', 'listened on %s', port);

      watch(['**', '!./{node-modules,sea-modules,spm_modules,_site}/**'], function(event) {
        var relativePath = relative(args.cwd, event.path);
        lrServer.changed({body: {files:[event.path]}});
        log.info('livereload', '%s was %s', relativePath, event.type);
      });
    });
  }

  return server;
};

function renderDir(filepath) {
  var list = fs.readdirSync(filepath);
  var html = list.map(function(item) {
    if (item === '.' || item === '..') {
      return '';
    }
    return '<li><a href="'+item+'">'+item+'</a></li>';
  });
  return html.join('\n');
}
