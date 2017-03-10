var _ = require('lodash');
var utils = require('./parserUtils');

function VelocityParser() {
  this.type = 'velocity';
  this.test = /^[\d]{1,3}==?V/;
}
VelocityParser.prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  mutateState: function (state) {
    if (this.parsed.phrase) {
      state.phrase.velocity = this.parsed.value;
    } else {
      state.note.velocity = this.parsed.value;
    }
  }
}

module.exports = VelocityParser;