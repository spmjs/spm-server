var koa = require('koa');
var logger = require('koa-logger');
var resolve = require('path').resolve;
var relative = require('path').relative;
var log = require('spm-log');
var watch = require('glob-watcher');
var extend = require('extend');
var request = require('request');

var join = require('path').join;
var readFile = require('fs').readFileSync;

module.exports = Server;

function Server(dir) {
  if (!(this instanceof Server)) return new Server(dir);
  this.cwd = dir || process.cwd();
  this.app = koa();
  this._port = null; // set this in listen.

  this.app.use(logger());
}

Server.prototype.port = function(port) {
  this._port = port;
  return this;
};

Server.prototype.spm = function(root, opt) {
  if (!opt) {
    opt = root;
    root = this.cwd;
  }
  var spm = require('serve-spm/lib/koa');
  this.app.use(spm(root, opt));
  return this;
};

Server.prototype.combo = function(opt) {
  var combo = require('koa-combo2');
  this.app.use(combo(extend({
    directory: this.cwd,
    proxy: 'https://a.alipayobjects.com',
    cache: false,
    log: false,
    static: true,
    beforeProxy: function(pathname, cb, next) {
      if (!this._port) {
        log.error('combo', 'not port is set');
        return next();
      }

//      var pkg;
//      try {
//        pkg = JSON.parse(readFile(join(this.cwd, 'package.json')));
//      } catch(e) {}
//      if (!pkg) return next();

      var url = 'http://localhost:' + this._port + pathname;
      request({url:url,headers:{'servespmexit':'1'}}, function(err, res, body) {
        if (err || res.statusCode >= 300) {
          return next();
        }
        cb(null, body);
      });
    }.bind(this)
  }, opt)));
  return this;
};

Server.prototype.directory = function() {
  var directory = require('koa-serve-index');
  this.static(this.cwd);
  this.app.use(directory(this.cwd));
  return this;
};

Server.prototype.static = function(dir) {
  var static = require('koa-static');
  dir = resolve(this.cwd, dir || '');
  this.app.use(static(dir));
  return this;
};

Server.prototype.use = function(gen) {
  this.app.use(gen);
  return this;
};

Server.prototype.livereload = function(opt) {
  opt = opt || {};
  var port = opt.port || 35729;

  var lrServer = require('tiny-lr')();
  lrServer.listen(port, function(err) {
    if (err) {
      log.error('livereload', err);
      return;
    }
    log.info('livereload', 'listened on %s', port);

    var glob = opt.glob || ['**', '!./{node-modules,sea-modules,spm_modules,_site}/**'];
    watch(glob, {cwd: this.cwd}, function(event) {
      var relativePath = relative(this.cwd, event.path);
      lrServer.changed({body: {files:[event.path]}});
      log.info('livereload', '%s was %s', relativePath, event.type);
    }.bind(this));
  }.bind(this));
  return this;
};

Server.prototype.https = function(fn) {
  if (!this._port) {
    log.error('https', 'enable failed! please use it after `listen`')
    return this;
  }

  var httpProxy = require('http-proxy');
  var _fn = function(arguments) {
    log.info('https', 'listened on 443');
    if (fn) fn.apply(this, arguments);
  };
  httpProxy.createServer({
    ssl: {
      key: readFile(join(__dirname, '../keys/key.pem')),
      cert: readFile(join(__dirname, '../keys/cert.pem'))
    },
    target: 'http://localhost:' + this.port,
    secure: true
  }).listen(443, _fn);
  return this;
};

Server.prototype.listen = function(port, fn) {
  this._port = port;
  var _fn = function(arguments) {
    log.info('http', 'listened on %s', port);
    if (fn) fn.apply(this, arguments);
  };
  this.app.listen(port, _fn);
  return this;
};
