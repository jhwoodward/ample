var utils = require('../parserUtils');
var _ = require('lodash');
var parser = require('./_parser');

function TransposeParser() {
  this.type = 'Transpose';
  this.test = /^-?[\d]{1,3}@/;
}
var prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  mutateState: function (state) {
    state.pitch.transpose = this.parsed.value;
  }
}

TransposeParser.prototype = _.extend({}, parser, prototype);
module.exports = TransposeParser;