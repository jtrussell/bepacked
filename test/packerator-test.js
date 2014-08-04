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
      $ = cheerio.load(packedHtml);
      done();
    });
  });

  it('should not generate an error', function() {
    expect(err).to.not.be.ok;
    expect(packedHtml).to.be.ok;
  });

  it('should remove src attributes from scripts', function() {
    expect($('#script-local').attr('src')).to.not.be.ok;
  });
  
  it('should inline local JavaScript sources', function() {
    var actual = $('#script-local').html().trim()
      , expected = 'var bar = \'blargus\';';
    expect(actual).to.equal(expected);
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

  it.skip('should not generte an error when there is nothing to do', function() {
    expect(false).to.be.ok;
  });

});
