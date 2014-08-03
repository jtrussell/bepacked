/*global describe, it, beforeEach */
/*jshint expr:true */

'use strict';

var fs = require('fs')
  , cheerio = require('cheerio');

var expect = require('chai').expect
  , packerator = require('../');

var testFile = __dirname + '/fixtures/foo.html'
  , testHtml = fs.readFileSync(testFile).toString();

describe('packerator', function() {

  var $, err, packedHtml;

  beforeEach(function(done) {
    packerator(testHtml, {cwd: __dirname + '/fixtures'}, function(e, html) {
      err = e;
      packedHtml = html;
      $ = cheerio.load(html);
      done();
    });
  });

  it('should not generate an error', function() {
    expect(err).to.not.be.ok;
    expect(packedHtml).to.be.ok;
  });
  
  it.skip('should inline local JavaScript sources', function() {
    expect($('#script-local').html()
      .trim()).to.equal('var bar = \'blargus\';');
  });

  it.skip('should inline external JavaScript sources', function() {
    expect(false).to.be.ok;
  });

  it.skip('should inline local stylesheets', function() {
    expect(false).to.be.ok;
  });

  it.skip('should inline external stylesheets', function() {
    expect(false).to.be.ok;
  });

  it.skip('should datauri-ify local images', function() {
    expect(false).to.be.ok;
  });

  it.skip('should datauri-ify external images', function() {
    expect(false).to.be.ok;
  });

  it.skip('should datauri-ify images in stylesheets', function() {
    expect(false).to.be.ok;
  });

  it.skip('should datauri-ify images in inline styles', function() {
    expect(false).to.be.ok;
  });

  it.skip('should have a streaming interface', function() {
    expect(false).to.be.ok;
  });

});
