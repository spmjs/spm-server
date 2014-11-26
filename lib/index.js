var koa = require('koa');
var logger = require('koa-logger');
var resolve = require('path').resolve;
var relative = require('path').relative;
var log = require('spm-log');
var watch = require('glob-watcher');
var extend = require('extend');
var request = require('request');
var mime = require('mime');
var extname = require('path').extname;

module.exports = Server;

function Server(dir) {
  if (!(this instanceof Server)) return new Server(dir);
  this.cwd = dir || process.cwd();
  this.app = koa();

  this._ip = require('internal-ip')();
  this._port = null;

  this.app.use(logger());
  this.app.use(function *(next){
    this.type = mime.lookup(extname(this.url));
    yield next;
  });
}

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
  this.app.use(require('./combo')(extend(opt, {
    server: this
  })));
  return this;
};

Server.prototype.directory = function() {
  this.app.use(require('koa-serve-index')(this.cwd));
  return this;
};

Server.prototype.static = function(dir) {
  dir = resolve(this.cwd, dir || '');
  this.app.use(require('koa-static')(dir));
  return this;
};

Server.prototype.cdn = function(opt) {
  this.app.use(require('./cdn')(opt));
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

Server.prototype.listen = function(port, fn) {
  this.port(port);
  var _fn = function(arguments) {
    log.info('http', 'listened on %s', port);
    if (fn) fn.apply(this, arguments);
  };
  this.app.listen(port, _fn);
  return this;
};

Server.prototype.proxy = function(opt) {
  if (!this.port()) {
    log.error('proxy', 'enable failed! please use it after `listen`')
    return this;
  }

  opt = opt || {};

  var anyproxy;
  try {
    anyproxy = require('anyproxy');
  } catch(e) {
  }

  if (!anyproxy) {
    log.error('proxy', '`anyproxy` is not install correctly');
    return;
  }

  !anyproxy.isRootCAFileExists() && anyproxy.generateRootCA();
  new anyproxy.proxyServer({
    type: 'http',
    port: opt.port || 8989,
    hostname: 'localhost',
    rule: require('./rule')({
      server: this
    })
  });
  return this;
};

Server.prototype.port = function(port) {
  if (!port) return this._port;
  this._port = port;
  return this;
};

Server.prototype.ip = function(ip) {
  if (!ip) return this._ip;
  this._ip = ip;
  return this;
};
