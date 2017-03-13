var utils = require('../parserUtils');
var _ = require('lodash');
var parser = require('./_parser');

function OffParser() {
  this.type = 'On';
  this.test = /^-?[\d]{1,2}==?OFF/;
}
var prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  mutateState: function (state) {
    if (this.parsed.phrase) {
      state.phrase.off = this.parsed.value;
    } else {
      state.note.off = this.parsed.value;
    }
  }
}

OffParser.prototype = _.extend({}, parser, prototype);

module.exports = OffParser;