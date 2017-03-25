var utils = require('../parserUtils');
var _ = require('lodash');
var parser = require('./_parser');

function OffParser() {
  this.type = 'Off';
  this.test = /^-?[\d]{1,2}==?OFF/;
}
var prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  mutateState: function (state) {
    state.off = state.off || {};
    state.off.offset = this.parsed.value;
  }
}

OffParser.prototype = _.extend({}, parser, prototype);

module.exports = OffParser;