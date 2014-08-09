
'use strict';

var fs = require('fs')
  , path = require('path')
  , url = require('url')
  , _ = require('lodash')
  , request = require('request')
  , cheerio = require('cheerio');

var normalizePath = function(path, opts) {
  if(path.indexOf('//') === 0) {
    path = 'http:' + path;
  }
  return path;
};

// Replace a link tag with a script tag with the give contents
var scriptifyLink = function($, $ln, contents) {
  var ln = $ln[0]
    , attrKeys = Object.keys(ln.attribs)
    , $s = $('<style type="text/css"></style>')
    , attrs = []
    , ix;
  for(ix = attrKeys.length; ix--;) {
    $s.attr(attrKeys[ix], ln.attribs[attrKeys[ix]]);
  }
  $s.attr('href', null);
  $s.attr('rel', null);
  $s.html(contents.toString().trim());
  $ln.replaceWith($s);
};

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
    , $scripts = opts.scripts ? $('script[src]') : $()
    , $links = opts.styles ? $('link[href][rel="stylesheet"]') : $()
    , $styles = opts.images ? $('style') : $()
    , $images = opts.images ? $('img') : $()
    , count = $scripts.length +
        $links.length +
        $styles.length +
        $images.length;

  var done = _.after(count, function() {
    cb(null, $.html());
  });

  $scripts.each(function(ix) {
    var $el = $(this)
      , src = normalizePath($el.attr('src'))
      , pSrc = url.parse(src);
    if(localInput && !pSrc.hostname) {
      fs.readFile(path.join(opts.cwd, pSrc.path), function(err, contents) {
        if(err) { return cb(err); }
        $el.html(contents.toString().trim());
        $el.attr('src', null);
        return done();
      });
    } else {
      if(pSrc.hostname) {
        request.get(src, function(err, response, body) {
          if(err) { return cb(err); }
          if(response.statusCode === 200) {
            $el.html(body.trim());
            $el.attr('src', null);
          }
          return done();
        });
      } else {
        /**
         * @todo Remote script but relative to the url... not a path on disk
         */
        return done();
      }
    }
  });

  $links.each(function(ix) {
    var $el = $(this)
      , href = normalizePath($el.attr('href'))
      , pHref = url.parse(href);
    if(localInput && !pHref.hostname) {
      fs.readFile(path.join(opts.cwd, pHref.path), function(err, contents) {
        if(err) { return cb(err); }
        scriptifyLink($, $el, contents);
        done();
      });
    } else {
      if(pHref.hostname) {
        request.get(href, function(err, response, body) {
          if(err) { return cb(err); }
          if(response.statusCode === 200) {
            scriptifyLink($, $el, body);
          }
          return done();
        });
      } else {
        /**
         * @todo Remote style but relative to the url... not a path on disk
         */
        return done();
      }
    }
  });

  $styles.each(done);
  $images.each(done);
};
