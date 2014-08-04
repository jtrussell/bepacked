
'use strict';

var fs = require('fs')
  , path = require('path')
  , url = require('url')
  , _ = require('lodash')
  , cheerio = require('cheerio');

module.exports = function(input, opts, cb) {
  /**
   * @todo input could be
   *  - html text
   *  - a readable stream
   *  - [file address?]
   *  - [web address?]
   */

  // Should relative path assets be pulled from disc or the internets?
  var localInput = true;

  // opts and cb are optional
  if(2 === arguments.length) {
    if(_.isFunction(arguments[1])) {
      cb = opts;
      opts = {};
    } else {
      cb = _.noop;
    }
  } else if(1 === arguments.length) {
    opts = {};
    cb = _.noop;
  }

  opts = _.assign({}, {
    cwd: process.cwd(),
    scripts: true,
    styles: true,
    images: true
  }, opts);

  var $ = cheerio.load(input)
    , $scripts = opts.scripts ? $('script[src]') : []
    , $links = opts.styles ? $('link[rel="stylesheet"]') : []
    , $styles = opts.images ? $('style') : []
    , $images = opts.images ? $('img') : []
    , count = $scripts.length
        + $links.length
        + $styles.length
        + $images.length;

  var done = _.after(count, function() {
    cb(null, $.html());
  });

  $scripts.each(function(ix) {
    var $el = $(this)
      , pSrc = url.parse($el.attr('src'));
    if(localInput && !pSrc.hostname) {
      fs.readFile(path.join(opts.cwd, pSrc.path), function(err, contents) {
        if(err) { return cb(err); }
        $el.html(contents.toString().trim());
        $el.attr('src', null);
        done();
      });
    } else {
      done();
    }
  });

  $links.each(done);
  $styles.each(done);
  $images.each(done);
};
