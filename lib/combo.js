var debug = require('debug')('spm-server:combo');
var combo = require('combo-url');
var request = require('co-request');
var mime = require('mime');
var extname = require('path').extname;

module.exports = function(opt) {

  return function*(next){
    var _url = decodeURIComponent(this.url);

    // Pass through when is not a combo url
    if (!combo.isCombo(_url)) {
      return yield next;
    }

    var data = combo.parse(_url);
    var ret = [];

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

