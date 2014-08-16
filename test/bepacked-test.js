/*global describe, it, beforeEach */
/*jshint expr:true */

'use strict';

var fs = require('fs')
  , cheerio = require('cheerio');

var expect = require('chai').expect
  , sinon = require('sinon')
  , bepacked = require('../');

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
    'http://rawgit.com/jtrussell/bepacked/master/test/fixtures/foo.html': testHtml,
    'http://rawgit.com/jtrussell/bepacked/master/test/fixtures/bar.js': barjs,
    'https://rawgit.com/jtrussell/bepacked/master/test/fixtures/bar.js': barjs,
    'http://rawgit.com/jtrussell/bepacked/master/test/fixtures/bar.css': barcss,
    'https://rawgit.com/jtrussell/bepacked/master/test/fixtures/bar.css': barcss
  };
  if(map[url]) {
    cb(null, {statusCode: 200}, map[url]);
  } else {
    cb(null, {statusCode: 404}, 'FROWN TOWN');
  }
});

describe('bepacked', function() {

  //it.skip('should return a promise', function() {
  //  expect(false).to.be.ok;
  //});

  describe('inlining', function() {
    var error, $el;

    describe('local scripts', function() {
      var testHtml = fs.readFileSync(__dirname + '/fixtures/local-script.html').toString()
        , opts = {cwd: __dirname + '/fixtures'};

      beforeEach(function(done) {
        bepacked(testHtml, opts, function(err, html) {
          error = err;
          $el = cheerio.load(html)('#script-local');
          done();
        });
      });

      it('should not generate an error', function() {
        expect(error).to.not.be.ok;
      });

      it('should inline local JavaScript sources', function() {
        var actual = $el.html().trim();
        expect(actual).to.equal(barjs);
      });

      it('should remove src attributes from scripts', function() {
        var actual = $el.attr('src');
        expect(actual).to.not.be.ok;
      });
    });

    describe('remote scripts', function() {
      var testHtml = fs.readFileSync(__dirname + '/fixtures/remote-script.html').toString()
        , opts = {cwd: __dirname + '/fixtures'};

      beforeEach(function(done) {
        bepacked(testHtml, opts, function(err, html) {
          error = err;
          $el = cheerio.load(html)('#script-remote');
          done();
        });
      });

      it('should not generate an error', function() {
        expect(error).to.not.be.ok;
      });

      it('should inline remote JavaScript sources', function() {
        var actual = $el.html().trim();
        expect(actual).to.equal(barjs);
      });

      it('should remove src attributes from scripts', function() {
        var actual = $el.attr('src');
        expect(actual).to.not.be.ok;
      });
    });

    describe('local styles', function() {
      var testHtml = fs.readFileSync(__dirname + '/fixtures/local-style.html').toString()
        , opts = {cwd: __dirname + '/fixtures'};

      beforeEach(function(done) {
        bepacked(testHtml, opts, function(err, html) {
          error = err;
          $el = cheerio.load(html)('#style-local');
          done();
        });
      });

      it('should not generate an error', function() {
        expect(error).to.not.be.ok;
      });

      it('should inline local stylesheets', function() {
        var actual = $el.html().trim();
        expect(actual).to.equal(barcss);
      });

      it('should not leave href tags on style tags', function() {
        expect($el.attr('href')).to.not.be.ok;
      });

      it('should not leave rel attributes on style tages ', function() {
        expect($el.attr('rel')).to.not.be.ok;
      });
    });

    describe('remote styles', function() {
      var testHtml = fs.readFileSync(__dirname + '/fixtures/remote-style.html').toString()
        , opts = {cwd: __dirname + '/fixtures'};

      beforeEach(function(done) {
        bepacked(testHtml, opts, function(err, html) {
          error = err;
          $el = cheerio.load(html)('#style-remote');
          done();
        });
      });

      it('should not generate an error', function() {
        expect(error).to.not.be.ok;
      });

      it('should inline remote stylesheets', function() {
        var actual = $el.html().trim();
        expect(actual).to.equal(barcss);
      });

      it('should not leave href tags on style tags', function() {
        expect($el.attr('href')).to.not.be.ok;
      });

      it('should not leave rel attributes on style tages ', function() {
        expect($el.attr('rel')).to.not.be.ok;
      });
    });

    it('should not generate an error when there is nothing to do', function(done) {
      var testHtml = fs.readFileSync(__dirname + '/fixtures/remote-style.html').toString()
        , opts = {cwd: __dirname + '/fixtures'};
      bepacked(testHtml, opts, function(err, html) {
        expect(err).to.not.be.ok;
        expect(html).to.be.ok;
        done();
      });
    });

    describe('images', function() {
      it.skip('should datauri-ify local images', function() {
        //var actual = $('#img-local').attr('src');
        //expect(actual).to.equal(barjpgDataUri);
      });

      it.skip('should datauri-ify remote images', function() {
        //var actual = $('#img-local').attr('src');
        //expect(actual).to.equal(barjpgDataUri);
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
  });
});
