var join = require('path').join;
var request = require('request');
var extend = require('extend');
var fs = require('fs');
var SpmServer = require('../');

var port = 12345;
var server;

describe('index', function() {

  var opts;

  beforeEach(function() {
    opts = {
      noArgvParse: true,
      open: false,
      port: port
    };
  });

  afterEach(function() {
    server && server.close();
  });

  it('normal', function(done) {
    opts.cwd = join(__dirname, './fixtures/normal');
    server = SpmServer(opts, function() {
      local('seajs/seajs/2.2.0/sea.js', function(err, res, body) {
        body.should.startWith('/*! Sea.js 2.2.0 | seajs.org/LICENSE.md */\n');
        local('normal/0.1.0/index.js', function(err, res, body) {
          fileEqual(body, 'normal/index.js');
          local('jquery/1.7.2/jquery.js', function(err, res, body) {
            body.should.startWith('define("jquery/1.7.2/jquery",[],function(e,t,n)');
            body.should.containEql('selector:"",jquery:"1.7.2"');
            local('type/1.0.0/index.js', function(err, res, body) {
              fileEqual(body, 'normal/type.js');
              local('normal/0.1.0/relative.js', function(err, res, body) {
                fileEqual(body, 'normal/relative.js');

                // combo deps
                local('??seajs/2.2.0/sea.js,jquery/1.7.2/jquery.js', function(err, res, body) {
                  fileEqual(body, 'normal/sea_jquery.js');

                  // combo all
                  local('??seajs/2.2.0/sea.js,jquery/1.7.2/jquery.js,normal/0.1.0/index.js', function(err, res, body) {
                    fileEqual(body, 'normal/sea_jquery_index.js');

                    // root project but 404
                    local('normal/0.1.0/notfound.js', function(err, res, body) {
                      res.statusCode.should.be.equal(404);
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it('standalone', function(done) {
    opts.cwd = join(__dirname, './fixtures/standalone');
    server = SpmServer(opts, function() {
      local('a.js', function(err, res, body) {
        body.should.be.equal('console.log(\'a: true\');\n');
        local('normal/0.1.0/index.js', function(err, res, body) {
          fileEqual(body, 'standalone/index.js');

          // combo
          local('??a.js,normal/0.1.0/index.js', function(err, res, body) {
            fileEqual(body, 'standalone/a_index.js');
            done();
          });
        });
      });
    });
  });

  it('standalone + base', function(done) {
    opts.cwd = join(__dirname, './fixtures/standalone');
    opts.base = 'group/project/9.9.9';
    server = SpmServer(opts, function() {
      local('group/project/9.9.9/index.js', function(err, res, body) {
        fileEqual(body, 'standalone/base_index.js');
        local('??a.js,group/project/9.9.9/index.js', function(err, res, body) {
          fileEqual(body, 'standalone/base_a_index.js');
          done();
        });
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
