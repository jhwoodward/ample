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
    state.onOffset = this.parsed.value;
  }
}
OnParser.prototype = _.extend({}, parser, prototype);
module.exports = OnParser;