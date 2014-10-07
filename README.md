# bepacked

> Pack external assets into your html.

Bepacked came into being as a helper for [bedecked][bedecked], allowing you to
inline static assets and create standalone presentations that could be run
without an internet connection. In general it can be used to inline (most)
assets for any local or remote HTML document.

## Usage

Bepacked exports a single function:

```javascript
var bepacked = require('bepacked');

/**
 * Bepacked can take in a chunk of html, a path to a local html file, or a url.
 */
var input = '<html>...</html>';

/**
 * Bepacked is configurable, tell it exactly which types of assets you'd like to
 * inline. this is an optional argument and by default we'll inline everything
 * we can.
 *
 * The options hash can also specify a current working directory. This is useful
 * for example when you pass bepacked a bunch of HTML with relative asset paths,
 * we'll use cwd to resolve those assets. This defaults to the current working
 * directoy when unless the input was actually a file or url in which case that
 * file's directly is used.
 */
var opts = {
  cwd: process.cwd(),
  scripts: true,
  styles: true,
  images: true
};

/**
 * You may optionally pass a callback as the final parameter. It will be given
 * an error if there was one and the packed html.
 */
var cb = function(error, packedHtml) {
  // ...
};

/**
 * Bepacked also returns a promise if you're not into the whole callback thing.
 */
var promise = bepacked(input, opts, cb);
```

## License

[MIT][license]

[bedecked]: https://github.com/jtrussell/bedecked
[license]: https://raw.githubusercontent.com/jtrussell/bepacked/master/LICENSE-MIT
