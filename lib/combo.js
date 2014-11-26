var debug = require('debug')('spm-server:combo');
var combo = require('combo-url');
var request = require('co-request');
var mime = require('mime');
var extname = require('path').extname;

module.exports = function(opt) {

  return function*(next){
    // Pass through when is not a combo url
    if (!combo.isCombo(this.url)) {
      return yield next;
    }

    var data = combo.parse(this.url);
    var ret = [];

    this.type = mime.lookup(extname(this.url));

    for (var i=0; i<data.combo.length; i++) {
      var item = data.combo[i];
      var url = this.protocol + '://' + opt.server.ip() + ':' + opt.server.port() + item;

      debug('fetch: ', url);
      var result = yield request(url);

      if (result.statusCode === 404) {
        debug('404: ', url);
        this.status = 404;
        this.body = 'Not Found:\n' + url;
        return;
      }

      ret.push(result.body);
    }

    this.body = ret.join('\n');
  };
};

