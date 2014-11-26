var debug = require('debug')('spm-server:cdn');
var request = require('co-request');
var extend = require('extend');

module.exports = function(opt) {

  opt = extend({
    proxy: ['https://115.238.23.196', 'a.alipayobjects.com']
  }, opt);

  return function*(next){

    var proxy = opt.proxy[0];
    var host = opt.proxy[1];

    var url = proxy + this.url;

    debug('fetch: %s (%s)' + url, host);
    var result = yield request({url:url,headers:{
      'Host': host
    }});

    if (result.statusCode === 404) {
      yield next;
    } else {
      this.body = result.body;
    }
  };

};

// TODO:
// 1. 支持 cache (cdn 上的文件都是非覆盖的，所以不存在更新 cache 的问题)

