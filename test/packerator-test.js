/*global describe, it, beforeEach */
/*jshint expr:true */

var fs = require('fs');

var expect = require('chai').expect
  , packerator = require('../');

var testFile = __dirname + '/fixtures/foo.html'
  , testHtml = fs.readFileSync(testFile).toString();

describe('packerator', function() {

  it('should not generate an error', function(done) {
    packerator(testHtml, function(err, html) {
      expect(err).to.not.be.ok;
      expect(html).to.be.ok;
      done();
    });
  });

  it('should have a streaming interface', function() {
    expect(false).to.be.ok;
  });
  
  it('should inline local JavaScript sources', function() {
    expect(false).to.be.ok;
  });

  it('should inline external JavaScript sources', function() {
    expect(false).to.be.ok;
  });

  it('should inline local stylesheets', function() {
    expect(false).to.be.ok;
  });

  it('should inline external stylesheets', function() {
    expect(false).to.be.ok;
  });

  it('should datauri-ify local images', function() {
    expect(false).to.be.ok;
  });

  it('should datauri-ify external images', function() {
    expect(false).to.be.ok;
  });

  it('should datauri-ify images in stylesheets', function() {
    expect(false).to.be.ok;
  });

  it('should datauri-ify images in inline styles', function() {
    expect(false).to.be.ok;
  });

});
