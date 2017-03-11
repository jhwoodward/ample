var utils = require('../parserUtils');
var _ = require('lodash');

function TransposeParser() {
  this.type = 'transpose';
  this.test = /^-?[\d]{1,3}@/;
}
TransposeParser.prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  mutateState: function (state) {
    state.pitch.transpose = this.parsed.value;
  }
}

module.exports = TransposeParser;