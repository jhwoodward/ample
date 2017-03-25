var _ = require('lodash');
var utils = require('../parserUtils');
var parser = require('./_parser');

function VelocityParser() {
  this.type = 'Velocity';
  this.test = /^[\d]{1,3}==?V/;
}
var prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  mutateState: function (state) {
    state.velocity = this.parsed.value;
  }
}
VelocityParser.prototype = _.extend({}, parser, prototype);
module.exports = VelocityParser;