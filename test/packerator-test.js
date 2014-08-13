/*global describe, it, beforeEach */
/*jshint expr:true */

/**
 * @todo split html into isolated cases for each test
 */

'use strict';

var fs = require('fs')
  , cheerio = require('cheerio');

var expect = require('chai').expect
  , sinon = require('sinon')
  , packerator = require('../');

var testFile = __dirname + '/fixtures/foo.html'
  , testHtml = fs.readFileSync(testFile).toString()
  , barjs = fs.readFileSync(__dirname + '/fixtures/bar.js').toString().trim()
  , barcss = fs.readFileSync(__dirname + '/fixtures/bar.css').toString().trim()
  , barjpg = fs.readFileSync(__dirname + '/fixtures/bar.jpg').toString('base64').trim()
  , barjpgDataUri = 'data:image/jpeg;base64,'+barjpg;

var request = require('request');

// I don't want to reach out to the internets so let's stub `request.get`
sinon.stub(request, 'get', function(url, opts, cb) {
  if(typeof cb === 'undefined') {
    cb = opts;
    opts = {};
  }
  var map = {
    'http://rawgit.com/jtrussell/packerator/master/test/fixtures/foo.html': testHtml,
    'http://rawgit.com/jtrussell/packerator/master/test/fixtures/bar.js': barjs,
    'https://rawgit.com/jtrussell/packerator/master/test/fixtures/bar.js': barjs,
    'http://rawgit.com/jtrussell/packerator/master/test/fixtures/bar.css': barcss,
    'https://rawgit.com/jtrussell/packerator/master/test/fixtures/bar.css': barcss
  };
  if(map[url]) {
    cb(null, {statusCode: 200}, map[url]);
  } else {
    cb(null, {statusCode: 404}, 'FROWN TOWN');
  }
});

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

  it.skip('should return a promise', function() {
    expect(false).to.be.ok;
  });

  it('should remove src attributes from scripts', function() {
    expect($('#script-local').attr('src')).to.not.be.ok;
  });

  it('should inline local JavaScript sources', function() {
    var actual = $('#script-local').html().trim();
    expect(actual).to.equal(barjs);
  });

  it('should inline remote JavaScript sources', function() {
    var actual = $('#script-remote').html().trim();
    expect(actual).to.equal(barjs);
  });

  it.only('should inline local stylesheets', function() {
    var actual = $('#style-local').html().trim();
    expect(actual).to.equal(barcss);
  });

  it('should not leave href attributes on style tags', function() {
    expect($('#style-local').attr('href')).to.not.be.ok;
  });

  it('should not leave rel attributes on style tags', function() {
    expect($('#style-local').attr('rel')).to.not.be.ok;
  });

  it('should inline remote stylesheets', function() {
    var actual = $('#style-remote').html().trim();
    expect(actual).to.equal(barcss);
  });

  it.skip('should datauri-ify local images', function() {
    var actual = $('#img-local').attr('src');
    expect(actual).to.equal(barjpgDataUri);
  });

  it.skip('should datauri-ify remote images', function() {
    var actual = $('#img-local').attr('src');
    expect(actual).to.equal(barjpgDataUri);
  });

  it.skip('should datauri-ify images in stylesheets', function() {
    expect(false).to.be.ok;
  });

  it.skip('should datauri-ify images in inline styles', function() {
    expect(false).to.be.ok;
  });

  it.skip('should not generte an error when there is nothing to do', function() {
    expect(false).to.be.ok;
  });

});
