var utils = require('../parserUtils');
var _ = require('lodash');
var parser = require('./_parser');

function OnParser() {
  this.type = 'On';
  this.test = /^-?[\d]{1,2}==?ON/;
}
var prototype = {
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
OnParser.prototype = _.extend({}, parser, prototype);
module.exports = OnParser;