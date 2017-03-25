var utils = require('../parserUtils');
var parser = require('./_parser');
var eventType = require('../constants').eventType;
var _ = require('lodash');

function ControllerParser() {
  this.type = 'Controller';
  this.test = /^[\d]{1,3}==?C[\d]{1,3}/;
}
var prototype = {
  parse: function (s) {
    var out = {
      controller: parseInt(/C[\d]{1,3}/.exec(s)[0].replace('C', ''), 10)
    };
    return Object.assign(out, utils.parseValue(s));
  },
  mutateState: function (state) {
    state.controller[this.parsed.controller] = this.parsed.value;
  },
  getEvents: function (state, prev) {
    if (prev.controller[this.parsed.controller] === this.parsed.value) {
      return [];
    }
    return [{
      tick: state.time.tick,
      type: eventType.controller,
      controller: this.parsed.controller,
      value: this.parsed.value
    }];
  }
};

ControllerParser.prototype = _.extend({}, parser, prototype);

module.exports = ControllerParser;