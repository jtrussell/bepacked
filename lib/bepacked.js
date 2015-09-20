
'use strict';

var fs = require('fs')
  , join = require('path').join
  , url = require('url')
  , mime = require('./mime')
  , _ = require('lodash')
  , request = require('request')
  , cheerio = require('cheerio')
  , P = require('bluebird');

// Internally urls must have a protocol or we'll fall down trying to request
// them.
var normalizePath = function(path, opts) {
  if(path.indexOf('//') === 0) {
    path = 'http:' + path;
  }
  return path;
};

// Is the given path relative?
var isRelativePath = function(path) {
  /**
   * @todo Handle absolute file paths
   */
  return path.indexOf('http') !== 0 && path.indexOf('file') !== 0;
};

// Is the given path a url?
var isUrl = function(path) {
  return path.indexOf('http') === 0;
};

var dataUriPref = function(pSrc) {
  return 'data:' + mime(pSrc.pathname) + ';base64,';
};
// Fetch assets contents at `path`, may be either url or location on disk.  If
// path is not absolute it will be interpreted relative to `root` (`root` will
// either be a working directory or a url base).
//
// Should resolve to a buffer in all cases
var fetch = function(path, root) {
  return new P(function(resolve, reject) {
    if(isRelativePath(path)) {
      path = isUrl(root) ?
        url.resolve(root, path) :
        join(root, path);
    }

    if(isUrl(path)) {
      request.get(path, {encoding: null}, function(err, response, body) {
        if(err) { return reject(err); }
        return response.statusCode === 200 ?
          resolve(body) :
          reject(new Error('Got status ' + response.statusCode + ' fetching ' + path));
      });
    } else {
      fs.readFile(path, function(err, body) {
        return err ?
          reject(err) :
          resolve(body);
      });
    }
  });
};

// Replace a link tag with a script tag with the give contents
var stylifyLink = function($, $ln, contents) {
  var ln = $ln[0]
    , attrKeys = Object.keys(ln.attribs)
    , $s = $('<style type="text/css"></style>')
    , attrs = []
    , ix;
  for(ix = attrKeys.length; ix--;) {
    $s.attr(attrKeys[ix], ln.attribs[attrKeys[ix]]);
  }

  // Save the origin href
  // ...
  $s.attr('data-bepacked-href', $s.attr('href'));

  $s.attr('href', null);
  $s.attr('rel', null);
  $s.text(contents.toString().trim());
  $ln.replaceWith($s);
};


/**
 * Pack external assets into given html
 *
 * Can take a bunch of html (i.e. string), a path to a local html file, or a
 * url.
 *
 * Use `opts` to specify which assets should be packed, and also to set a
 * working directory for resolving relative paths. This is only necessary when
 * `input` is a string - if `input` is a path to a file on disk that file's
 * directory will be used as the working directory for resolving relative paths.
 * Similarly if `input` is a url, assets will be fetched relative to that url.
 *
 * Default options:
 *
 * ```
 * {
 *   cwd: process.cwd(),
 *   scripts: true,
 *   styles: true,
 *   images: true
 * }
 * ```
 *
 * You may pass a callback as the third parameter or use the returned promise to
 * get your packed html:
 *
 * ```
 * bepacked('foo/bar.html', function(err, html) {
 *   // ...
 * });
 * ```
 * or
 *
 * ```
 * bepacked('foo/bar.html').then(function(html) {
 *   // ...
 * }, function(err) {
 *   // ...
 * });
 * ```
 *
 * @param {String} input Raw html, local path, or url
 * @param {Object} opts [optional] Specify assets to pack and cwd
 * @param {Object} cb [optional] Callback, gets an error and the packed html
 * @return {Promise} Resolves to packed html... if you're into that sort of thing
 */
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
    cwd: isUrl(input) ? input : process.cwd(),
    scripts: true,
    styles: true,
    images: true
  }, opts);

  /**
   * @todo if input is a url we should fetch it first!
   */

  var $ = cheerio.load(input)
    , $scripts = opts.scripts ? $('script[src]') : $()
    , $links = opts.styles ? $('link[href][rel="stylesheet"]') : $()
    , $styles = opts.images ? $('style') : $()
    , $images = opts.images ? $('img') : $()
    , count = $scripts.length +
        $links.length +
        (opts.images ? 1 : 0) +
        //$styles.length +
        $images.length;

  var done = _.after(count, function() {
    cb(null, $.html());
  });

  // Don't start inlining images until after links have finished
  var linksDoneDef = (function() {
    var resolve, reject, promise;
    promise = new P(function() {
      resolve = arguments[0];
      reject = arguments[1];
    });
    return {
      resolve: resolve,
      reject: reject,
      promise: promise
    };
  }());

  var linksDone = _.after($links.length, function() {
    linksDoneDef.resolve();
  });

  if(!$links.length) {
    linksDone();
  }

  $scripts.each(function(ix) {
    var $el = $(this)
      , src = normalizePath($el.attr('src'))
      , pSrc = url.parse(src);

    fetch(src, opts.cwd).then(function(body) {
      $el.text(body.toString().trim());
      $el.attr('src', null);
    })
    .catch(function(reason) {
      // oh nos! do something?!?!?
    })
    .finally(done);
  });

  $links.each(function(ix) {
    var $el = $(this)
      , href = normalizePath($el.attr('href'))
      , pHref = url.parse(href);
    fetch(href, opts.cwd).then(function(body) {
      stylifyLink($, $el, body);
    })
    .then(linksDone)
    .catch(function(reason) {
      // oh nos! do something?!?!?
      linksDoneDef.reject(reason);
    })
    .finally(done);
  });

  linksDoneDef.promise.then(function() {
    // We may have more style elements after inlining links
    $styles = opts.images ? $('style') : $();

    var styleImagePattern = /url\((?:['"]*)(?!['"]*data:)(.*?)(?:['"]*)\)/
      , styleImagePatternG = /url\((?:['"]*)(?!['"]*data:)(.*?)(?:['"]*)\)/g
      , styleImagesCache = {};

    // Our routine to actually perform the base64ification of inline urls. Runs
    // synchronously after we have already downloaded image contents
    var inlineStyleImages = _.after($styles.length, function() {
      $styles.each(function(ix) {
        var $el = $(this)
          , lnkHref = $el.attr('data-bepacked-href');
        $el.text($el.html().replace(styleImagePatternG, function(match, $1) {
          var src = lnkHref ?
                normalizePath(url.resolve(lnkHref, $1)) :
                normalizePath($1)
            , pSrc = url.parse(src);
          if(styleImagesCache.hasOwnProperty(src)) {
            return 'url(' + dataUriPref(pSrc) + styleImagesCache[src].toString('base64') + ')';
          } else {
            return 'url(' + src + ')';
          }
        }));
      });
      done();
    });

    if(!$styles.length) {
      return done();
    }

    // Prime the image cache
    $styles.each(function(ix) {
      var $el = $(this)
        , matches = $el.html().match(styleImagePatternG) || []
        , proceed = _.after(matches.length, inlineStyleImages)
        , lnkHref = $el.attr('data-bepacked-href');

      if(!matches.length) {
        return proceed();
      }

      _(matches).forEach(function(m) {
        // These paths, if relative, should be relative to the origin link path if
        // the link was external. If it was we should have stashed the href on the
        // element in `data-bepacked-href`
        var path = m.match(styleImagePattern)[1]
          , src = lnkHref ?
              normalizePath(url.resolve(lnkHref, path)) :
              normalizePath(path);

        if(!styleImagesCache.hasOwnProperty(src)) {
          fetch(src, opts.cwd).then(function(body) {
            styleImagesCache[src] = body;
          }).
          finally(proceed);
        } else {
          proceed();
        }
      });
    });
  });

  $images.each(function(ix) {
    var $el = $(this)
      , src = normalizePath($el.attr('src'))
      , pSrc = url.parse(src);

    fetch(src, opts.cwd).then(function(body) {
      $el.attr('src', dataUriPref(pSrc) + body.toString('base64'));
    })
    .catch(function(reason) {
      // oh nos! do something!!!!
    })
    .finally(done);
  });
};
