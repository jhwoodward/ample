var utils = require('./utils');

function DurationParser() {
  this.type = 'Duration';
  this.test = /^[\d]{1,3},/;
}
DurationParser.prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  process: function (state) {
    state.time.step = this.parsed.value;
  }
}

module.exports = DurationParser;