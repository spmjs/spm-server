var net = require('net');
var util = require('../util');

var PORT = 12345;
var noop = function(){};

describe('util', function() {

  it('normalizeBase', function() {
    util.normalizeBase('http://a.com/b/c/').should.be.equal('/b/c/');
    util.normalizeBase('http://a.com/b/c').should.be.equal('/b/c/');
    util.normalizeBase('https://a.com/b/c').should.be.equal('/b/c/');
    util.normalizeBase('b/c').should.be.equal('/b/c/');
    util.normalizeBase('/b/c').should.be.equal('/b/c/');
    util.normalizeBase('/b/c/').should.be.equal('/b/c/');
    util.normalizeBase(false).should.be.false;
  });
});