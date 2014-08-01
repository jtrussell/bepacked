
var _ = require('lodash');

module.exports = function(input, opts, cb) {
  /**
   * @todo input could be
   *  - html text
   *  - a readable stream
   *  - [file address?]
   *  - [web address?]
   */

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

};
