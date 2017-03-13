var utils = require('../parserUtils');
var parser = require('./_parser');
var _ = require('lodash');

function DurationParser() {
  this.type = 'Duration';
  this.test = /^[\d]{1,3},/;
}
var prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  mutateState: function (state) {
    state.time.step = this.parsed.value;
  }
};

DurationParser.prototype = _.extend({}, parser, prototype);
module.exports = DurationParser;