var util = require('../util');

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