var utils = require('../parserUtils');
var _ = require('lodash');

function OnParser() {
  this.type = 'On';
  this.test = /^-?[\d]{1,2}==?ON/;
}
OnParser.prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  mutateState: function (state) {
    if (this.parsed.phrase) {
      state.phrase.on = this.parsed.value;
    } else {
      state.note.on = this.parsed.value;
    }
  }
}

module.exports = OnParser;