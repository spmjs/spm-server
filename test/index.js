var SpmServer = require('../');

describe('index', function() {

  var server;

  afterEach(function() {
    server && server.close();
  });

  it('normal', function(done) {

    server = SpmServer({
      noArgvParse: true,
      open: false,
      port: 12345
    }, function() {
      done();
    });
  });
});