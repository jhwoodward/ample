var utils = require('./utils');

function ControllerParser() {
  this.type = 'controller';
  this.test = /^[\d]{1,3}==?C[\d]{1,3}/;
}
ControllerParser.prototype = {
  parse: function (s) {
    var out = {
      controller: parseInt(/C[\d]{1,3}/.exec(s)[0].replace('C',''),10)
    };
    return Object.assign(out, utils.parseValue(s));
  },
  process: function (state) {
    if (this.parsed.phrase) {
      state.expression.phrase.controller[this.parsed.controller] = this.parsed.value;
      return this.parsed;
  } else {
      state.expression.note.controller[this.parsed.controller] = this.parsed.value;
    }
  }
}

module.exports = ControllerParser;