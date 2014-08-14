var join = require('path').join;
var request = require('request');
var extend = require('extend');
var fs = require('fs');
var SpmServer = require('../');

var port = 12345;
var server;

var defaults = {
  noArgvParse: true,
  open: false,
  port: port
};

describe('index', function() {

  describe('normal', function() {

    before(function(done) {
      var opts = extend(defaults, {
        cwd: join(__dirname, './fixtures/normal')
      });
      server = SpmServer(opts, done);
    });

    after(function() {
      server && server.close();
    });

    it('seajs', function(done) {
      local('seajs/seajs/2.2.0/sea.js', function (err, res, body) {
        body.should.startWith('/*! Sea.js 2.2.0 | seajs.org/LICENSE.md */\n');
        done();
      });
    });

    it('index', function(done) {
      local('normal/0.1.0/index.js', function(err, res, body) {
        fileEqual(body, 'normal/index.js');
        done();
      });
    });


    it('jquery', function(done) {
      local('jquery/1.7.2/jquery.js', function (err, res, body) {
        body.should.startWith('define("jquery/1.7.2/jquery",[],function(e,t,n)');
        body.should.containEql('selector:"",jquery:"1.7.2"');
        done();
      });
    });

    it('type', function(done) {
      local('type/1.0.0/index.js', function(err, res, body) {
        fileEqual(body, 'normal/type.js');
        done();
      });
    });

    it('relative', function(done) {
      local('normal/0.1.0/relative.js', function(err, res, body) {
        fileEqual(body, 'normal/relative.js');
        done();
      });
    });

    it('combo deps', function(done) {
      local('??seajs/2.2.0/sea.js,jquery/1.7.2/jquery.js', function(err, res, body) {
        fileEqual(body, 'normal/sea_jquery.js');
        done();
      });
    });

    it('combo all', function(done) {
      local('??seajs/2.2.0/sea.js,jquery/1.7.2/jquery.js,normal/0.1.0/index.js', function(err, res, body) {
        fileEqual(body, 'normal/sea_jquery_index.js');
        done();
      });
    });

    it('root project but 404', function(done) {
      local('normal/0.1.0/notfound.js', function(err, res, body) {
        res.statusCode.should.be.equal(404);
        done();
      });
    });

  });

  describe('standalone', function() {

    before(function(done) {
      var opts = extend(defaults, {
        cwd: join(__dirname, './fixtures/standalone')
      });
      server = SpmServer(opts, done);
    });

    after(function() {
      server && server.close();
    });

    it('a.js', function(done) {
      local('a.js', function(err, res, body) {
        body.should.be.equal('console.log(\'a: true\');\n');
        done();
      });
    });

    it('index', function(done) {
      local('normal/0.1.0/index.js', function(err, res, body) {
        fileEqual(body, 'standalone/index.js');
        done();
      });
    });

    it('combo', function(done) {
      local('??a.js,normal/0.1.0/index.js', function(err, res, body) {
        fileEqual(body, 'standalone/a_index.js');
        done();
      });
    });

  });

  describe('standalone + base', function() {

    before(function(done) {
      var opts = extend(defaults, {
        cwd: join(__dirname, './fixtures/standalone'),
        base: 'group/project/9.9.9'
      });
      server = SpmServer(opts, done);
    });

    after(function() {
      server && server.close();
    });

    it('index', function(done) {
      local('group/project/9.9.9/index.js', function(err, res, body) {
        fileEqual(body, 'standalone/base_index.js');
        done();
      });
    });

    it('combo', function(done) {
      local('??a.js,group/project/9.9.9/index.js', function(err, res, body) {
        fileEqual(body, 'standalone/base_a_index.js');
        done();
      });
    });

  });

});

function local(pathname, cb, opts) {
  var args = {
    url: 'http://localhost:'+port+'/'+pathname
  };
  request(extend(args, opts), cb);
}

function fileEqual(body, filepath) {
  filepath = join(__dirname, 'expect', filepath);
  body.should.be.equal(fs.readFileSync(filepath, 'utf-8'));
}
