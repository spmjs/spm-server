var join = require('path').join;
var request = require('supertest');
var SPMServer = require('../lib/');

var port = 12345;
var app;

function getApp(project, base) {
  var paths = base ? [[base,'']] : null;
  return SPMServer(join(__dirname, 'fixtures', project))
    .spm({
      paths: paths
    })
    .combo()
    .directory()
    .static()
    .port(port)
    .app;
}

describe('index', function() {

  describe('normal', function() {

    before(function() {
      app = getApp('normal');
    });

    it('seajs', function(done) {
      request(app.listen())
        .get('/seajs/seajs/2.2.0/sea.js')
        .expect(200, done);
    });

    it('index', function(done) {
      request(app.listen())
        .get('/normal/0.1.0/index.js')
        .expect(readFile('normal/index.js'))
        .expect(200, done);
    });

    it('jquery', function(done) {
      request(app.listen())
        .get('/jquery/1.7.2/jquery.js')
        .expect(/^define\(\"jquery\/1\.7\.2\/jquery",\[\],function\(e,t,n\)/)
        .expect(/selector:\"\",jquery:\"1\.7\.2\"/)
        .expect(200, done);
    });

    it('type, go dist first', function(done) {
      request(app.listen())
        .get('/type/1.0.0/index.js')
        .expect(readFile('normal/type.js'))
        .expect(200, done);
    });

    it('relative', function(done) {
      request(app.listen())
        .get('/normal/0.1.0/relative.js')
        .expect(readFile('normal/relative.js'))
        .expect(200, done);
    });

    it('combo deps', function(done) {
      var server = app.listen(port);
      request(server)
        .get('/??seajs/2.2.0/sea.js,jquery/1.7.2/jquery.js')
        .expect(readFile('normal/sea_jquery.js'))
        .expect(200, function() {
          server && server.close();
          done.apply(this, arguments);
        });
    });

    it('combo all', function(done) {
      var server = app.listen(port);
      request(server)
        .get('/??seajs/2.2.0/sea.js,jquery/1.7.2/jquery.js,normal/0.1.0/index.js')
        .expect(readFile('normal/sea_jquery_index.js'))
        .expect(200, function() {
          server && server.close();
          done.apply(this, arguments);
        });
    });

    it('root project but 404', function(done) {
      request(app.listen())
        .get('/normal/0.1.0/notfound.js')
        .expect(404, done);
    });

    it('directory', function(done) {
      request(app.listen())
        .get('/')
        .expect(/<body class=\"directory\">/)
        .expect(200, done);
    });

  });

  describe('standalone', function() {

    before(function() {
      app = getApp('standalone');
    });

    it('a.js', function(done) {
      request(app.listen())
        .get('/a.js')
        .expect('console.log(\'a: true\');\n')
        .expect(200, done);
    });

    it('index', function(done) {
      request(app.listen())
        .get('/normal/0.1.0/index.js')
        .expect(readFile('standalone/index.js'))
        .expect(200, done);
    });

    it('combo', function(done) {
      var server = app.listen(port);
      request(server)
        .get('/??a.js,normal/0.1.0/index.js')
        .expect(readFile('standalone/a_index.js'))
        .expect(200, function() {
          server && server.close();
          done.apply(this, arguments);
        });
    });
  });

  describe('standalone + base', function() {

    before(function() {
      app = getApp('standalone', '/group/project/9.9.9');
    });

    it('index', function(done) {
      request(app.listen())
        .get('/group/project/9.9.9/index.js')
        .expect(readFile('standalone/base_index.js'))
        .expect(200, done);
    });

    it('combo', function(done) {
      var server = app.listen(port);
      request(server)
        .get('/??a.js,group/project/9.9.9/index.js')
        .expect(readFile('standalone/base_a_index.js'))
        .expect(200, function() {
          server && server.close();
          done.apply(this, arguments);
        });
    });

  });

});

function readFile(filepath) {
  return require('fs').readFileSync(join(__dirname, 'expect', filepath), 'utf-8');
}
