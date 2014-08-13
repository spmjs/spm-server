var net = require('net');
var util = require('../util');

var PORT = 12345;
var noop = function(){};

describe('util', function() {

  it('isPortInUse (idle)', function(done) {
    util.isPortInUse(PORT, noop, function() {
      done();
    });
  });

  it('isPortInUse (used)', function(done) {
    var server = net.createServer();
    server.listen(PORT, function() {
      util.isPortInUse(PORT, function() {
        done();
      }, noop);
    });
  });

  it('template', function() {
    util.template('', {a:1}).should.be.equal('');
    util.template('{{a}}', {a:1}).should.be.equal('1');
    util.template('{{b}}', {a:1}).should.be.equal('');
  });
});