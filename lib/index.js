var koa = require('koa');
var logger = require('koa-logger');
var resolve = require('path').resolve;
var relative = require('path').relative;
var log = require('spm-log');
var watch = require('glob-watcher');
var extend = require('extend');
var mime = require('mime');
var extname = require('path').extname;
var join = require('path').join;
var exists = require('fs').existsSync;
var readFile = require('fs').readFileSync;
var isPortInUse = require('./utils').isPortInUse;

var WEINRE_PORT = 8990;
var LIVERELOAD_PORT = 35729;

module.exports = Server;

function Server(dir) {
  if (!(this instanceof Server)) return new Server(dir);
  this.cwd = dir || process.cwd();
  this.app = koa();

  this._ip = require('internal-ip')();
  this._port = null;
  this._weinre = false;

  var instance = this;

  this.app.use(logger());
  this.app.use(function *(next){
    // set content-type
    this.type = mime.lookup(extname(this.url));

    // inject weinre html
    var isHTML = /\.html?$/.test(this.url);
    if (isHTML && (instance._weinre || instance._livereload)) {
      var file = join(instance.cwd, this.url);
      if (exists(file)) {
        var data = readFile(file, 'utf-8');
        if (instance._weinre) {
          data += '<script src="http://' + instance.ip() + ':' + WEINRE_PORT +
            '/target/target-script-min.js#anonymous"></script>';
        }
        if (instance._livereload) {
          data += '<script src="http://' + instance.ip() + ':' + LIVERELOAD_PORT +
            '/livereload.js"></script>';
        }
        this.body = data;
      }
    } else {
      yield next;
    }
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
  this.app.use(require('koa-serve-index')(this.cwd, {
    hidden: true,
    view: 'details'
  }));
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
  this._livereload = true;

  opt = opt || {};
  var port = LIVERELOAD_PORT;

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
  var _fn = function(args) {
    log.info('http', 'listened on %s', port);
    if (fn) fn.apply(this, args);
  };
  isPortInUse(port, function() {
    log.error('error', 'port '+port+' is in use, change to another one');
    process.exit(1);
  }, function() {
    this.app.listen(port, _fn);
  }.bind(this));
  return this;
};

Server.prototype.proxy = function(opt) {
  if (!this.port()) {
    log.error('proxy', 'enable failed! please use it after `listen`');
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

Server.prototype.weinre = function() {
  this._weinre = true;

  require('coffee-script');
  require('weinre').run({
    httpPort: WEINRE_PORT,
    boundHost: '',
    verbose: false,
    debug: false,
    readTimeout: 5,
    open: false,
    weinre: true,
    deathTimeout: 15
  });
  return this;
};
