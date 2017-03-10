var utils = require('./parserUtils');
var _ = require('lodash');

function OffParser() {
  this.type = 'On';
  this.test = /^-?[\d]{1,2}==?OFF/;
}
OffParser.prototype = {
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

module.exports = OffParser;